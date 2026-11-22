"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { catalogueRevalidate } from "@lib/util/catalogue-cache"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { ...next, revalidate: catalogueRevalidate() },
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { ...next, revalidate: catalogueRevalidate() },
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

/**
 * The country's region. Read through listRegions' cache, not a module-level map:
 * a map would keep a region's settings until the server restarts (#65).
 */
export const getRegion = async (countryCode: string) => {
  try {
    const regions = await listRegions()

    if (!regions) {
      return null
    }

    const code = countryCode || "cz"
    return regions.find((region) => region.countries?.some((c) => c?.iso_2 === code))
  } catch (e: any) {
    return null
  }
}
