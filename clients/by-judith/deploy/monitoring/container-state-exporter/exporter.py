#!/usr/bin/env python3
"""Expose a bounded subset of Docker container state as Prometheus metrics."""

from __future__ import annotations

import json
import os
import re
import time
from collections.abc import Mapping, Sequence
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Final
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


DEFAULT_REQUIRED_SERVICES: Final = ("platform", "storefront", "postgres", "redis")
HEALTH_STATES: Final = ("healthy", "unhealthy", "starting", "none", "unknown")
LABEL_VALUE_PATTERN: Final = re.compile(r"^[A-Za-z0-9_.-]+$")
MAX_RESPONSE_BYTES: Final = 4 * 1024 * 1024


def escape_label(value: object) -> str:
    return str(value).replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')


def metric(name: str, value: int | float, labels: Mapping[str, object] | None = None) -> str:
    label_text = ""
    if labels:
        rendered = ",".join(
            f'{key}="{escape_label(label_value)}"' for key, label_value in sorted(labels.items())
        )
        label_text = f"{{{rendered}}}"
    return f"{name}{label_text} {value}"


def required_services_from_env(value: str | None) -> tuple[str, ...]:
    services = tuple(item.strip() for item in (value or "").split(",") if item.strip())
    if not services:
        return DEFAULT_REQUIRED_SERVICES
    if len(set(services)) != len(services):
        raise ValueError("REQUIRED_SERVICES contains a duplicate service")
    if any(not LABEL_VALUE_PATTERN.fullmatch(service) for service in services):
        raise ValueError("REQUIRED_SERVICES contains an invalid service name")
    return services


class DockerClient:
    def __init__(self, base_url: str, timeout_seconds: float = 4.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        if not self.base_url.startswith("http://"):
            raise ValueError("DOCKER_API_URL must use plain HTTP on the private collector network")

    def _get_json(self, path: str) -> object:
        request = Request(f"{self.base_url}{path}", headers={"Accept": "application/json"})
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                payload = response.read(MAX_RESPONSE_BYTES + 1)
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            raise RuntimeError("Docker API request failed") from error
        if len(payload) > MAX_RESPONSE_BYTES:
            raise RuntimeError("Docker API response exceeded the size limit")
        try:
            return json.loads(payload)
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise RuntimeError("Docker API returned invalid JSON") from error

    def list_project_containers(self, project: str) -> list[Mapping[str, object]]:
        filters = json.dumps(
            {"label": [f"com.docker.compose.project={project}"]},
            separators=(",", ":"),
        )
        result = self._get_json(f"/containers/json?{urlencode({'all': 'true', 'filters': filters})}")
        if not isinstance(result, list):
            raise RuntimeError("Docker API container list had an unexpected shape")
        return [item for item in result if isinstance(item, Mapping)]

    def inspect_container(self, container_id: str) -> Mapping[str, object]:
        if not re.fullmatch(r"[a-f0-9]{12,64}", container_id):
            raise RuntimeError("Docker API returned an invalid container ID")
        result = self._get_json(f"/containers/{quote(container_id, safe='')}/json")
        if not isinstance(result, Mapping):
            raise RuntimeError("Docker API inspect response had an unexpected shape")
        return result


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, Mapping) else {}


def _newest_container_by_service(
    containers: Sequence[Mapping[str, object]], required_services: Sequence[str]
) -> tuple[dict[str, Mapping[str, object]], dict[str, int]]:
    candidates: dict[str, list[Mapping[str, object]]] = {service: [] for service in required_services}
    for container in containers:
        labels = _mapping(container.get("Labels"))
        service = labels.get("com.docker.compose.service")
        if isinstance(service, str) and service in candidates:
            candidates[service].append(container)

    selected: dict[str, Mapping[str, object]] = {}
    counts: dict[str, int] = {}
    for service, service_containers in candidates.items():
        counts[service] = len(service_containers)
        if service_containers:
            selected[service] = max(
                service_containers,
                key=lambda item: int(item.get("Created", 0)) if isinstance(item.get("Created", 0), int) else 0,
            )
    return selected, counts


def collect_state(
    client: DockerClient, project: str, required_services: Sequence[str]
) -> tuple[dict[str, Mapping[str, object]], dict[str, int]]:
    selected, counts = _newest_container_by_service(
        client.list_project_containers(project), required_services
    )
    inspections: dict[str, Mapping[str, object]] = {}
    for service, container in selected.items():
        container_id = container.get("Id")
        if not isinstance(container_id, str):
            raise RuntimeError("Docker API container entry had no ID")
        inspections[service] = client.inspect_container(container_id)
    return inspections, counts


def render_state_metrics(
    inspections: Mapping[str, Mapping[str, object]],
    counts: Mapping[str, int],
    required_services: Sequence[str],
) -> str:
    lines = [
        "# HELP vewao_container_present Whether the required Compose service has a container.",
        "# TYPE vewao_container_present gauge",
        "# HELP vewao_container_instances Number of containers found for the required Compose service.",
        "# TYPE vewao_container_instances gauge",
        "# HELP vewao_container_running Whether the selected container is running.",
        "# TYPE vewao_container_running gauge",
        "# HELP vewao_container_restarting Whether the selected container is restarting.",
        "# TYPE vewao_container_restarting gauge",
        "# HELP vewao_container_dead Whether the selected container is dead.",
        "# TYPE vewao_container_dead gauge",
        "# HELP vewao_container_oom_killed Whether the selected container was OOM-killed.",
        "# TYPE vewao_container_oom_killed gauge",
        "# HELP vewao_container_restart_count Docker restart count for the selected container.",
        "# TYPE vewao_container_restart_count gauge",
        "# HELP vewao_container_health_status One-hot Docker health status for the selected container.",
        "# TYPE vewao_container_health_status gauge",
        "# HELP vewao_container_info Running container and immutable image information.",
        "# TYPE vewao_container_info gauge",
    ]

    for service in required_services:
        labels = {"service": service}
        inspection = inspections.get(service)
        present = inspection is not None
        lines.append(metric("vewao_container_present", int(present), labels))
        lines.append(metric("vewao_container_instances", counts.get(service, 0), labels))

        state = _mapping(inspection.get("State")) if inspection else {}
        running = bool(state.get("Running", False))
        lines.append(metric("vewao_container_running", int(running), labels))
        lines.append(metric("vewao_container_restarting", int(bool(state.get("Restarting", False))), labels))
        lines.append(metric("vewao_container_dead", int(bool(state.get("Dead", False))), labels))
        lines.append(metric("vewao_container_oom_killed", int(bool(state.get("OOMKilled", False))), labels))

        restart_count = inspection.get("RestartCount", 0) if inspection else 0
        if not isinstance(restart_count, int) or restart_count < 0:
            restart_count = 0
        lines.append(metric("vewao_container_restart_count", restart_count, labels))

        health = "unknown" if not present else "none"
        health_block = _mapping(state.get("Health"))
        health_value = health_block.get("Status")
        if isinstance(health_value, str) and health_value in HEALTH_STATES:
            health = health_value
        for status in HEALTH_STATES:
            lines.append(
                metric(
                    "vewao_container_health_status",
                    int(status == health),
                    {"service": service, "status": status},
                )
            )

        if inspection:
            config = _mapping(inspection.get("Config"))
            container_name = str(inspection.get("Name", "")).lstrip("/")
            image_id = str(inspection.get("Image", "unknown"))
            image_ref = str(config.get("Image", "unknown"))
            lines.append(
                metric(
                    "vewao_container_info",
                    1,
                    {
                        "container": container_name or "unknown",
                        "image_id": image_id,
                        "image_ref": image_ref,
                        "service": service,
                    },
                )
            )

    return "\n".join(lines) + "\n"


class MetricsHandler(BaseHTTPRequestHandler):
    client: DockerClient
    project: str
    required_services: tuple[str, ...]
    last_success_timestamp: float = 0.0

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if self.path == "/-/healthy":
            self._respond(200, "text/plain; charset=utf-8", b"ok\n")
            return
        if self.path != "/metrics":
            self._respond(404, "text/plain; charset=utf-8", b"not found\n")
            return

        generated_at = time.time()
        try:
            inspections, counts = collect_state(
                self.client, self.project, self.required_services
            )
            self.__class__.last_success_timestamp = generated_at
            body = render_state_metrics(inspections, counts, self.required_services)
            body += metric("vewao_container_state_scrape_success", 1) + "\n"
        except RuntimeError:
            body = metric("vewao_container_state_scrape_success", 0) + "\n"
        body += metric(
            "vewao_container_state_last_success_timestamp_seconds",
            self.__class__.last_success_timestamp,
        ) + "\n"
        self._respond(200, "text/plain; version=0.0.4; charset=utf-8", body.encode())

    def _respond(self, status: int, content_type: str, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        return


def main() -> None:
    project = os.environ.get("COMPOSE_PROJECT", "by-judith-dev")
    if not LABEL_VALUE_PATTERN.fullmatch(project):
        raise SystemExit("COMPOSE_PROJECT is invalid")
    required_services = required_services_from_env(os.environ.get("REQUIRED_SERVICES"))
    client = DockerClient(os.environ.get("DOCKER_API_URL", "http://socket-proxy:2375"))

    MetricsHandler.client = client
    MetricsHandler.project = project
    MetricsHandler.required_services = required_services
    server = ThreadingHTTPServer(("0.0.0.0", 9101), MetricsHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
