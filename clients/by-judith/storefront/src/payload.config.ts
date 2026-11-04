import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { cs } from "@payloadcms/translations/languages/cs"
import { en } from "@payloadcms/translations/languages/en"
import path from "path"
import { buildConfig, type Payload } from "payload"

import { Articles } from "./cms/collections/Articles"
import { Media } from "./cms/collections/Media"
import { News } from "./cms/collections/News"
import { Pages } from "./cms/collections/Pages"
import { Products } from "./cms/collections/Products"
import { Topics } from "./cms/collections/Topics"
import { Users } from "./cms/collections/Users"
import { migrations } from "./cms/migrations"

// The Payload CLI (types, import map, migrations) runs from the storefront root.
const dirname = path.resolve(process.cwd(), "src")

/**
 * Payload CMS inside the storefront (D22, vewao-clients#31): the admin at
 * /admin, its REST API under /api, content read in-process via the Local API.
 */
const serverURL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "")
// Cookie-authenticated requests only from the shop's own origin.
const trustedOrigins = serverURL ? [serverURL] : []
const s3 = process.env.CMS_S3_BUCKET

/**
 * Payload lets whoever opens /admin first create the first admin. On a public
 * shop that window is unacceptable, so the first admin comes from server env
 * (CMS_INITIAL_ADMIN_EMAIL/PASSWORD) on start; remove the values afterwards.
 */
async function ensureInitialAdmin(payload: Payload) {
  const email = process.env.CMS_INITIAL_ADMIN_EMAIL?.trim()
  const password = process.env.CMS_INITIAL_ADMIN_PASSWORD
  const { totalDocs } = await payload.count({ collection: "users", overrideAccess: true })
  if (totalDocs > 0) return
  if (!email || !password) {
    payload.logger.warn("CMS has no users: set CMS_INITIAL_ADMIN_EMAIL and CMS_INITIAL_ADMIN_PASSWORD")
    return
  }
  await payload.create({ collection: "users", data: { email, password, roles: ["admin"] }, overrideAccess: true })
  payload.logger.info(`Created the initial CMS admin ${email}`)
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · By Judith obsah" },
    livePreview: {
      breakpoints: [
        { label: "Mobil", name: "mobile", width: 390, height: 844 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  i18n: { supportedLanguages: { cs, en }, fallbackLanguage: "cs" },
  onInit: ensureInitialAdmin,
  collections: [Pages, Articles, Topics, News, Products, Media, Users],
  // Scheduled publishing queues a job; this server runs due jobs every minute.
  // The cron starts with Payload, on the first request that uses the CMS. A job
  // runs outside any request, where Next cannot expire cached pages, so a
  // scheduled publish shows within the 5-minute cache lifetime (lib/cms/client).
  jobs: { autoRun: [{ cron: "* * * * *", queue: "default" }] },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  cors: trustedOrigins,
  csrf: trustedOrigins,
  // No GraphQL: the admin uses REST and the storefront the Local API.
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "cms/payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.PAYLOAD_DATABASE_URL || "" },
    migrationDir: path.resolve(dirname, "cms/migrations"),
    // Production applies committed migrations on start; dev pushes the schema.
    prodMigrations: migrations,
  }),
  plugins: s3
    ? [
        s3Storage({
          collections: { media: { prefix: process.env.CMS_S3_PREFIX || "cms" } },
          bucket: s3,
          config: {
            region: process.env.CMS_S3_REGION,
            endpoint: process.env.CMS_S3_ENDPOINT || undefined,
            forcePathStyle: process.env.CMS_S3_FORCE_PATH_STYLE === "true",
            credentials: {
              accessKeyId: process.env.CMS_S3_ACCESS_KEY_ID || "",
              secretAccessKey: process.env.CMS_S3_SECRET_ACCESS_KEY || "",
            },
          },
        }),
      ]
    : [],
})
