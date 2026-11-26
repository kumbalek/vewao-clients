"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { buttonClasses } from "@modules/design-system"

/**
 * The e-shop's hero (owner, 2026-11-25), after Apple's product pages: a still
 * of the clip's first frame shows at once, the clip loads after the page and
 * replaces it, plays once (7 s) and rests on its last frame, her looking into
 * the camera. Compact, so the call to action and the "Akce" section come
 * within the first screen. Cut from content/video.mp4, see
 * public/assets/shop-hero/README.md.
 *
 * Desktop: the clip fills the hero, the copy sits in the dark third left of
 * her. Phone: the portrait crop, the copy below it, never over her face.
 */
const ASSETS = "/assets/shop-hero"
/**
 * The portrait crop where the clip's box is taller than wide: below 1024px the
 * box is the full width by 56svh, so portrait when the screen is narrower than
 * 0.56 of its height (phones). A tablet held upright gets the wide clip, which
 * covers its landscape-shaped box without cutting her face.
 */
const PORTRAIT = "(max-width: 1023px) and (max-aspect-ratio: 56/100)"
const REDUCED = "(prefers-reduced-motion: reduce)"

type State = "still" | "playing" | "paused" | "ended"

export default function ShopHero() {
  const t = useTranslations("hero")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<State>("still")

  useEffect(() => {
    const video = videoRef.current
    // Reduced motion: the clip never loads; the picture shows the last frame.
    if (!video || window.matchMedia(REDUCED).matches) return
    let cancelled = false
    // After the page itself: the still is the first paint, the clip comes second.
    const start = () => {
      if (cancelled) return
      video.src = `${ASSETS}/${
        window.matchMedia(PORTRAIT).matches ? "hero-portrait" : "hero-wide"
      }.mp4`
      video.load()
      // A refused autoplay (iOS Low Power Mode) leaves the still and offers play.
      video.play().catch(() => !cancelled && setState("paused"))
    }
    if (document.readyState === "complete") start()
    else window.addEventListener("load", start, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener("load", start)
    }
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (state === "playing") {
      video.pause()
    } else {
      if (state === "ended") video.currentTime = 0
      video.play().catch(() => setState("paused"))
    }
  }

  const label =
    state === "playing"
      ? t("pauseVideo")
      : state === "ended"
      ? t("replayVideo")
      : t("playVideo")

  return (
    <section
      data-testid="shop-hero"
      data-header-overlay=""
      // Starts under the e-shop's header (65px, 114px from `medium`), which floats over it.
      className="relative -mt-[65px] bg-black text-white medium:-mt-[114px] small:flex small:h-[72svh] small:min-h-[560px] small:items-center"
    >
      <div className="relative h-[56svh] min-h-[360px] w-full overflow-hidden small:absolute small:inset-0 small:h-full">
        {/* The still: the clip's first frame, or its last (to camera) for
            reduced motion, chosen by the browser before any script runs. */}
        <picture>
          <source
            media={`${REDUCED} and ${PORTRAIT}`}
            srcSet={`${ASSETS}/end-portrait.jpg`}
          />
          <source media={REDUCED} srcSet={`${ASSETS}/end-wide.jpg`} />
          <source media={PORTRAIT} srcSet={`${ASSETS}/start-portrait.jpg`} />
          <img
            src={`${ASSETS}/start-wide.jpg`}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => setState("playing")}
          onPause={(event) => !event.currentTarget.ended && setState("paused")}
          onEnded={() => setState("ended")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            state === "still" ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Keeps the floating header's light text legible. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"
        />
        {/* Desktop: the copy's side darkens; phone: the clip fades into the copy below it. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-black/80 to-transparent small:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent small:hidden"
        />

        {state !== "still" && (
          <button
            type="button"
            onClick={toggle}
            aria-label={label}
            title={label}
            data-testid="shop-hero-toggle"
            className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white small:bottom-6 small:right-6"
          >
            <ToggleIcon state={state} />
          </button>
        )}
      </div>

      {/* The column of the "Akce" heading and the rails below. */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-2 small:pb-0 small:pt-[114px]">
        {/* Narrower and smaller between 1024 and 1440px, where the dark third left of her is. */}
        <div className="flex max-w-xl flex-col gap-6 small:max-w-[21rem] large:max-w-[30rem]">
          <h1 className="text-2xl leading-tight small:text-3xl small:leading-tight large:text-4xl large:leading-tight">
            {t("claim")}
          </h1>
          <div className="flex flex-wrap gap-3">
            {/* In-page anchors: the category rails and the sale section below. */}
            <a
              href="#produkty"
              className={buttonClasses({ variant: "inverse", size: "lg" })}
            >
              {t("shop")}
            </a>
            <a
              href="#akce"
              className={buttonClasses({
                variant: "outline-inverse",
                size: "lg",
              })}
            >
              {t("sale")}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ToggleIcon({ state }: { state: State }) {
  if (state === "playing") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        fill="currentColor"
      >
        <rect x="3" y="2" width="3.5" height="12" rx="1" />
        <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
      </svg>
    )
  }
  if (state === "ended") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M4 2.5v11a.5.5 0 0 0 .77.42l8.5-5.5a.5.5 0 0 0 0-.84l-8.5-5.5A.5.5 0 0 0 4 2.5Z" />
    </svg>
  )
}
