import "server-only"

import { notFound } from "next/navigation"

/**
 * The temporary production site is the e-shop alone (vewao-clients#47):
 * `SITE_MODE=shop` hides the clinic's pages (landing, procedures, Ceník,
 * Magazín, Novinky, O nás, CMS pages) until the full site launches. Read at
 * request time, so one image serves either site.
 */
export const isShopOnly = () => process.env.SITE_MODE === "shop"

/** For a page of the full site: a 404 while only the e-shop is live. */
export function fullSiteOnly() {
  if (isShopOnly()) notFound()
}
