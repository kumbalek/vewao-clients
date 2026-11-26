"use client"

import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { ButtonLink } from "@modules/design-system"

import type { DiamondScene } from "./diamond-scene"
import type { Highlight } from "./regions"

export type DiamondSlide = {
  key: string
  title: string
  description: string | null
  href: string
  /** The button's label; "Zobrazit nabídku" without one. */
  cta: string | null
  /** The facets the slide brings forward. */
  highlight: Highlight
}

const REDUCED = "(prefers-reduced-motion: reduce)"
const AUTOPLAY_MS = 6000

/**
 * The diamond and the carousel beside it (below it on phones). The WebGL
 * canvas covers the whole hero, so the facets swirl in across all of it; the
 * diamond comes to rest on the anchor, the left column, which shows the logo
 * SVG until WebGL draws. The carousel appears once the diamond is whole, or
 * after a few seconds without it (CSS fallback, so it also shows without
 * JavaScript). Slides change on their own every 6 s until the visitor uses the
 * controls or pauses them (WCAG 2.2.2).
 */
export default function DiamondHeroClient({ slides }: { slides: DiamondSlide[] }) {
  const t = useTranslations("diamondHero")
  const tHero = useTranslations("hero")
  const canvasRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<DiamondScene | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [assembled, setAssembled] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  // three.js loads after the page, as its own chunk.
  useEffect(() => {
    let disposed = false
    const container = canvasRef.current
    const anchor = anchorRef.current
    if (!container || !anchor) return
    import("./diamond-scene")
      .then(({ createDiamondScene }) =>
        createDiamondScene(container, anchor, {
          svgUrl: "/logo_new.svg",
          reducedMotion: window.matchMedia(REDUCED).matches,
          onReady: () => !disposed && setDrawing(true),
          onAssembled: () => !disposed && setAssembled(true),
        })
      )
      .then((scene) => {
        if (disposed) scene.dispose()
        else sceneRef.current = scene
      })
      // No WebGL: the static logo stays and the carousel shows at once.
      .catch(() => !disposed && setAssembled(true))
    return () => {
      disposed = true
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (assembled) sceneRef.current?.setHighlight(slides[index]?.highlight ?? null)
  }, [assembled, index, slides])

  useEffect(() => {
    if (!assembled || !playing || slides.length < 2) return
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % slides.length), AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [assembled, playing, index, slides.length])

  if (!slides.length) return null

  // A visitor's choice stops the slides changing on their own.
  const go = (next: number) => {
    setPlaying(false)
    setIndex((next + slides.length) % slides.length)
  }

  return (
    <section
      data-testid="diamond-hero"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,rgb(215_180_107/0.18),transparent_60%)]"
    >
      <h1 className="sr-only">{tHero("claim")}</h1>
      {/* The canvas, over the whole hero and under its content. */}
      <div ref={canvasRef} className="pointer-events-none absolute inset-0" data-testid="diamond-stage" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-6 py-6 small:grid-cols-2 small:gap-12 small:py-10">
        {/* Where the diamond comes to rest. */}
        <div ref={anchorRef} className="relative h-[36svh] min-h-[240px] small:h-[56svh] small:min-h-[420px]" data-testid="diamond-anchor">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_new.svg"
            alt=""
            className={clx(
              "absolute left-1/2 top-1/2 h-[74%] w-auto -translate-x-1/2 -translate-y-1/2",
              // Shown only if WebGL has not started drawing within a moment.
              drawing ? "hidden" : "animate-[diamond-fallback_400ms_ease-out_1200ms_both] opacity-0"
            )}
          />
        </div>

        <div
          aria-roledescription="carousel"
          aria-label={t("label")}
          data-testid="diamond-carousel"
          className={clx(
            "flex flex-col gap-6",
            assembled ? "opacity-100 transition-opacity duration-500" : "animate-[diamond-fallback_500ms_ease-out_3500ms_both] opacity-0"
          )}
        >
          <div aria-live={playing ? "off" : "polite"}>
            {slides.map((slide, slideIndex) => (
              <div
                key={slide.key}
                role="group"
                aria-roledescription="slide"
                aria-label={t("slideOf", { index: slideIndex + 1, total: slides.length })}
                hidden={slideIndex !== index}
                data-testid="diamond-slide"
                // `flex` would override the hidden attribute, so only the shown slide gets it.
                className={clx(
                  "animate-[diamond-in_500ms_ease-out] flex-col gap-4 motion-reduce:animate-none",
                  slideIndex === index ? "flex" : "hidden"
                )}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
                  {String(slideIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </p>
                <h2 className="text-4xl leading-tight text-ink small:text-5xl">{slide.title}</h2>
                {slide.description && <p className="max-w-md text-lg text-ink-subtle">{slide.description}</p>}
                <div className="pt-2">
                  <ButtonLink href={slide.href} size="lg">
                    {slide.cta ?? t("show")}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ControlButton label={t("previous")} onClick={() => go(index - 1)}>
              <path d="M10 3 5 8l5 5" />
            </ControlButton>
            <ul className="flex items-center gap-1">
              {slides.map((slide, slideIndex) => (
                <li key={slide.key}>
                  <button
                    type="button"
                    onClick={() => go(slideIndex)}
                    aria-label={slide.title}
                    aria-current={slideIndex === index ? "true" : undefined}
                    className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    <span
                      className={clx(
                        "block h-1.5 rounded-full transition-all duration-300",
                        slideIndex === index ? "w-5 bg-ink" : "w-1.5 bg-ink/30 group-hover:bg-ink/60"
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <ControlButton label={t("next")} onClick={() => go(index + 1)}>
              <path d="m6 3 5 5-5 5" />
            </ControlButton>
            <ControlButton label={playing ? t("pause") : t("play")} onClick={() => setPlaying((current) => !current)}>
              {playing ? <path d="M5.5 3v10M10.5 3v10" /> : <path d="M5 3v10l8-5z" />}
            </ControlButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
