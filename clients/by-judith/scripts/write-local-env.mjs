import { readFileSync, writeFileSync, existsSync } from "node:fs"
const path = new URL("../storefront/.env.local", import.meta.url)
const key = process.argv[2]
if (!/^pk_[A-Za-z0-9_-]+$/.test(key ?? "")) throw new Error("Invalid publishable key")
let contents = existsSync(path) ? readFileSync(path, "utf8") : readFileSync(new URL("../storefront/.env.example", import.meta.url), "utf8")
for (const [name, value] of Object.entries({
  MEDUSA_BACKEND_URL: "http://localhost:9000",
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: key,
  NEXT_PUBLIC_BASE_URL: "http://localhost:8000",
  NEXT_PUBLIC_DEFAULT_REGION: "cz",
})) {
  const pattern = new RegExp(`^${name}=.*$`, "m")
  contents = pattern.test(contents) ? contents.replace(pattern, `${name}=${value}`) : `${contents.trimEnd()}\n${name}=${value}\n`
}
writeFileSync(path, contents, { mode: 0o600 })
