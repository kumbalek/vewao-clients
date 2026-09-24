import unittest

from exporter import HEALTH_STATES, render_state_metrics, required_services_from_env


class ExporterTest(unittest.TestCase):
    def test_missing_services_emit_explicit_zero_and_unknown_health(self) -> None:
        metrics = render_state_metrics({}, {}, ("platform", "redis"))

        self.assertIn('vewao_container_present{service="platform"} 0', metrics)
        self.assertIn('vewao_container_running{service="platform"} 0', metrics)
        self.assertIn(
            'vewao_container_health_status{service="platform",status="unknown"} 1',
            metrics,
        )
        self.assertIn('vewao_container_instances{service="redis"} 0', metrics)

    def test_running_container_emits_health_restart_oom_and_image(self) -> None:
        inspection = {
            "Name": "/by-judith-dev-platform-1",
            "Image": "sha256:immutable",
            "Config": {"Image": "ghcr.io/example/platform@sha256:release"},
            "RestartCount": 3,
            "State": {
                "Running": True,
                "Restarting": False,
                "Dead": False,
                "OOMKilled": True,
                "Health": {"Status": "healthy"},
            },
        }

        metrics = render_state_metrics(
            {"platform": inspection}, {"platform": 1}, ("platform",)
        )

        self.assertIn('vewao_container_running{service="platform"} 1', metrics)
        self.assertIn('vewao_container_restart_count{service="platform"} 3', metrics)
        self.assertIn('vewao_container_oom_killed{service="platform"} 1', metrics)
        self.assertIn(
            'image_id="sha256:immutable",image_ref="ghcr.io/example/platform@sha256:release"',
            metrics,
        )
        for status in HEALTH_STATES:
            expected = 1 if status == "healthy" else 0
            self.assertIn(
                f'vewao_container_health_status{{service="platform",status="{status}"}} {expected}',
                metrics,
            )

    def test_required_service_configuration_is_bounded(self) -> None:
        self.assertEqual(required_services_from_env(None), ("platform", "storefront", "postgres", "redis"))
        self.assertEqual(required_services_from_env("platform,redis"), ("platform", "redis"))
        with self.assertRaises(ValueError):
            required_services_from_env("platform,platform")
        with self.assertRaises(ValueError):
            required_services_from_env("platform,bad service")


if __name__ == "__main__":
    unittest.main()
