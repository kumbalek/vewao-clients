import { MetadataRoute } from "next"

// Never block crawling here: a crawler that cannot fetch a page cannot see the
// X-Robots-Tag that keeps non-production hosts out of search results (see
// middleware.ts). Add the sitemap together with the legacy URL migration.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" } }
}
