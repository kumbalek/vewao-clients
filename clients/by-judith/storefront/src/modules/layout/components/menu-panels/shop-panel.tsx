"use client"

import React, { useState } from "react"

import type { MenuCategory } from "@lib/util/menu-categories"
import { Container } from "@modules/design-system"
import CategoryBox from "@modules/layout/components/category-box"

const SUBCATEGORIES_ID = "shop-panel-subcategories"

/**
 * The shop's categories as boxes (vewao-clients#70). Hovering or focusing a
 * category with subcategories shows them as small boxes side by side under the
 * categories, wrapping onto further rows. ArrowDown on that category moves
 * into them; Tab reaches them after the categories. The logo leads to the
 * e-shop's front page, the footer to the full product list.
 */
export default function ShopPanel({ categories }: { categories: MenuCategory[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = categories.find((category) => category.id === activeId && category.children.length > 0)

  const enterSubcategories = (event: React.KeyboardEvent, category: MenuCategory) => {
    if (event.key !== "ArrowDown" || !category.children.length) return
    event.preventDefault()
    document.getElementById(SUBCATEGORIES_ID)?.querySelector("a")?.focus()
  }

  return (
    <Container width="page" className="py-8" onMouseLeave={() => setActiveId(null)}>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
        {categories.map((category) => (
          <li
            key={category.id}
            onMouseEnter={() => setActiveId(category.id)}
            onFocus={() => setActiveId(category.id)}
            onKeyDown={(event) => enterSubcategories(event, category)}
          >
            <CategoryBox
              href={`/categories/${category.handle}`}
              title={category.title}
              subtitle={category.subtitle}
              image={category.image}
              active={category.id === active?.id}
              className="h-full"
            />
          </li>
        ))}
      </ul>
      {active && (
        <ul id={SUBCATEGORIES_ID} aria-label={active.title} className="mt-4 flex flex-wrap gap-2">
          {active.children.map((child) => (
            <li key={child.id}>
              <CategoryBox
                href={`/categories/${child.handle}`}
                title={child.title}
                image={child.image}
                size="small"
              />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
