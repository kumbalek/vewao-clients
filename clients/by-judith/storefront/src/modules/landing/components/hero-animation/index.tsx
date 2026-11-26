"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { bookingPath } from "content/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Heading, Text } from "@modules/design-system"

import {
  BEATS,
  BEAT_GAP,
  Beat,
  CLIP,
  FADE_MS,
  MARKS,
  RESOLVE_HOLD,
  framePath,
  openingFrames,
} from "./config"
import { useFrameSequence } from "./use-frame-sequence"
import { readBeats, useHeroMotion } from "./use-hero-motion"

/**
 * The hero starts at the top of the page, under the site header and mobile
 * booking bar, which turn transparent over it (`data-header-overlay`, see
 * layout/templates/site-header for the heights). The stage fills the viewport;
 * `--stage` is the height everything in the choreography is measured in.
 */
const underHeader = "-mt-[129px] medium:-mt-[114px] [--stage:100svh]"

/** Keeps the header's light text legible over the top of the frame. */
const HeaderScrim = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/25 to-transparent medium:h-32"
  />
)

/** The claim sits in the third of the frame she is looking into. */
const channelClass = (beat: Beat) => {
  if (beat.direction === "east") {
    return "small:ml-auto small:w-[34%] small:pr-[5vw] small:text-right"
  }
  if (beat.direction === "west") {
    return "small:mr-auto small:w-[34%] small:pl-[5vw] small:text-left"
  }
  return "small:mx-auto small:w-[64%] small:text-center"
}

/**
 * Mobile keeps the type still and lets alignment whisper the direction: the
 * align swings, plus a ~16px indent. The indent is asymmetric padding rather
 * than a translate, so a full-width block never overhangs the viewport.
 */
const mobileNudge = (beat: Beat) => {
  if (beat.direction === "east") {
    return "pl-6 pr-10 text-right"
  }
  if (beat.direction === "west") {
    return "pl-10 pr-6 text-left"
  }
  return "px-6 text-left"
}

const ClaimBlock = ({
  beat,
  index,
  bookLabel,
}: {
  beat: Beat
  index: number
  bookLabel: string
}) => (
  <div className={`w-full small:px-0 ${mobileNudge(beat)} ${channelClass(beat)}`}>
    <Text
      size="xs"
      tone="inverse"
      className="pb-4 uppercase tracking-[0.2em] text-white/60"
      style={{ opacity: "var(--claim, 1)" }}
    >
      {beat.eyebrow}
    </Text>

    <Heading
      level={index === 0 ? 1 : 2}
      tone="inverse"
      className="whitespace-pre-line text-3xl leading-[1.1] small:whitespace-normal small:text-5xl small:leading-[1.1]"
      style={{ opacity: "var(--claim, 1)" }}
    >
      <span className="small:hidden">{beat.mobileTitle}</span>
      <span className="hidden small:inline">{beat.title}</span>
    </Heading>

    {/* Real anchors, present at load — only their opacity is animated. */}
    {beat.action && (
      <div className="pt-6" style={{ opacity: "var(--action, 1)" }}>
        <LocalizedClientLink
          href={beat.action.href}
          className="inline-block border-b border-white/40 pb-1 text-base text-white/85 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {beat.action.label}
        </LocalizedClientLink>
      </div>
    )}

    {/* Same wording and target as the header's booking button. */}
    {beat.isResolve && (
      <div className="pt-8" style={{ opacity: "var(--action, 1)" }}>
        <ButtonLink href={bookingPath} variant="outline-inverse" size="lg">
          {bookLabel}
        </ButtonLink>
      </div>
    )}
  </div>
)

/**
 * The landing hero: a frame sequence of the clinic's lead doctor whose gaze is
 * driven by the claims scrolling past her. See ../../README.md.
 */
const HeroAnimation = () => {
  const t = useTranslations("layout")

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beatRefs = useRef<(HTMLElement | null)[]>([])

  const [revealed, setRevealed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [portrait, setPortrait] = useState<boolean | null>(null)
  const [openingBeat, setOpeningBeat] = useState<number | null>(null)

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    setPortrait(window.innerHeight > window.innerWidth)
    // Which section a refresh landed on, so the loader fetches that frame first
    // instead of the opening run. The motion hook reads this again when it
    // starts, and that read is the authoritative one.
    setOpeningBeat(readBeats(stageRef.current, beatRefs.current).nearest)
  }, [])

  const crop = portrait === null ? null : portrait ? "portrait" : "wide"

  const priority = useMemo(() => openingFrames(openingBeat ?? 0), [openingBeat])

  const { ready, draw } = useFrameSequence({
    canvasRef,
    dir: reducedMotion || !crop || openingBeat === null ? null : CLIP.sets[crop],
    count: CLIP.frameCount,
    priority,
  })

  const { activeBeat, jumpToBeat } = useHeroMotion({
    sectionRef,
    stageRef,
    beatRefs,
    openingBeat: openingBeat ?? 0,
    draw,
    enabled: !reducedMotion && revealed,
  })

  useEffect(() => {
    if (ready) {
      setRevealed(true)
    }
  }, [ready])

  const setBeatRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      beatRefs.current[index] = element
    },
    []
  )

  const direction = BEATS[activeBeat]?.direction ?? "center"

  // ---------------------------------------------------------------- reduced
  // A real layout, not the animated one with the motion stripped out. Each
  // claim leads with the still the animation would have rested on, which is the
  // only honest way to keep the gaze doing its work without any motion.
  if (reducedMotion) {
    return (
      <section
        data-testid="landing-hero"
        data-motion="reduced"
        data-header-overlay=""
        className={`relative bg-black ${underHeader}`}
      >
        {BEATS.map((beat, index) => (
          <div key={beat.id}>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={framePath(CLIP.sets.wide, MARKS[index])}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              {index === 0 && <HeaderScrim />}
            </div>

            <div className="mx-auto w-full max-w-8xl px-6 py-16 small:px-12 small:py-24">
              <div className="max-w-2xl">
                <ClaimBlock beat={beat} index={index} bookLabel={t("book")} />
              </div>
            </div>
          </div>
        ))}
      </section>
    )
  }

  // ---------------------------------------------------------------- animated
  return (
    <section
      ref={sectionRef}
      data-testid="landing-hero"
      data-motion="full"
      data-header-overlay=""
      className={`relative bg-black ${underHeader}`}
    >
      {/* The stage. The only thing that is pinned. */}
      <div
        ref={stageRef}
        data-testid="landing-stage"
        className="sticky top-0 h-[var(--stage)] w-full overflow-hidden"
      >
        <div
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`absolute inset-0 transition-opacity ease-out ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        </div>

        {/* Side gradients follow the gaze: the channel she looks into lifts,
            the opposite side deepens. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black to-transparent transition-opacity duration-700"
          style={{ opacity: direction === "east" ? 0.85 : 0.35 }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-black to-transparent transition-opacity duration-700"
          style={{ opacity: direction === "west" ? 0.85 : 0.35 }}
        />

        {/* Grade shift by direction. Felt, not seen. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#c98a3a] mix-blend-overlay transition-opacity duration-1000"
          style={{ opacity: direction === "east" ? 0.09 : 0 }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#9fc4dd] mix-blend-overlay transition-opacity duration-1000"
          style={{ opacity: direction === "west" ? 0.09 : 0 }}
        />

        <HeaderScrim />

        {/* Mobile scrim: long and multi-stop, so it never reads as a video player. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/60 via-black/25 to-transparent small:hidden"
        />

        {/* Three-segment progress: a contract that there are three beats, then out. */}
        <div
          aria-hidden="true"
          className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 small:flex"
        >
          {BEATS.slice(0, 3).map((beat, index) => (
            <span
              key={beat.id}
              className={`h-8 w-px transition-colors duration-500 ${
                index <= activeBeat ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-[104px] left-6 z-30 flex gap-2 small:hidden"
        >
          {BEATS.slice(0, 3).map((beat, index) => (
            <span
              key={beat.id}
              className={`h-px w-8 transition-colors duration-500 ${
                index <= activeBeat ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* The claims are ordinary flow content. They never stick, they walk
          across the stage at 1:1 and out the top. */}
      <div className="relative z-20 -mt-[var(--stage)]">
        {BEATS.map((beat, index) => {
          const isResolve = Boolean(beat.isResolve)
          // The two centred beats sit over her face; lift them clear of it.
          // The resolve goes higher still, to keep the CTA off her features.
          const lift = isResolve
            ? "-translate-y-[20svh]"
            : index === 0
              ? "-translate-y-[10svh]"
              : ""

          return (
            <div
              key={beat.id}
              data-testid="landing-beat"
              onFocusCapture={() => jumpToBeat(index)}
              style={{
                height: `calc(var(--stage) * ${isResolve ? BEAT_GAP + RESOLVE_HOLD : BEAT_GAP})`,
              }}
            >
              {/* The one exception to "nothing sticks": the resolve holds. */}
              <div
                ref={setBeatRef(index)}
                className={`${
                  isResolve ? "sticky top-0 h-[var(--stage)]" : ""
                } flex items-end pb-[140px] small:items-center small:pb-0`}
                style={isResolve ? undefined : { height: `calc(var(--stage) * ${BEAT_GAP})` }}
              >
                {/* Lifted off the measured element, not applied to it — the
                    trigger line reads these rects to decide the active beat. */}
                <div className={`mx-auto w-full max-w-8xl ${lift}`}>
                  <ClaimBlock beat={beat} index={index} bookLabel={t("book")} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HeroAnimation
