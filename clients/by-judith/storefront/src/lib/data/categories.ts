import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { menuCategories, type MenuCategory } from "@lib/util/menu-categories"
import { catalogueRevalidate } from "@lib/util/catalogue-cache"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next: { ...next, revalidate: catalogueRevalidate() },
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products, *parent_category",
          handle,
        },
        next: { ...next, revalidate: catalogueRevalidate() },
      }
    )
    .then(({ product_categories }) => product_categories[0])
}

/** The shop's categories for the header and footer menus: top level with their subcategories. */
export const listMenuCategories = async (): Promise<MenuCategory[]> =>
  menuCategories(
    await listCategories({ fields: "id,handle,name,rank,parent_category_id,description,metadata", limit: 200 })
  )
