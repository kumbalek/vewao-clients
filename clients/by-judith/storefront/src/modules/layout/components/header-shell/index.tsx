"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"

/**
 * Wraps the site header and the mobile booking bar. On a page with a dark hero
 * (an element marked `data-header-overlay`), they float over it with a
 * transparent background and light text, through the `overlay:` Tailwind
 * variant, until the hero has scrolled out from under the header.
 *
 * Whether the page has such a hero is decided in CSS, so the first paint is
 * already right; this only marks when the header has scrolled past it.
 * `display: contents` keeps the page itself the sticky header's container.
 */
export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      // Looked up each time: the hero swaps its element for the reduced-motion layout.
      const hero = document.querySelector("[data-header-overlay]")
      const header = ref.current?.querySelector("header")

      if (!hero || !header) {
        setPastHero(false)
        return
      }

      setPastHero(hero.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [pathname])

  return (
    <div ref={ref} data-past-hero={pastHero} className="site-header contents">
      {children}
    </div>
  )
}
