"use client"

import { RefObject, useEffect, useRef, useState } from "react"

import {
  DAMPING,
  FPS,
  INTRO_FROM,
  MARKS,
  PUSH_IN,
  TRIGGER_LINE,
  openingFrame,
} from "./config"

/**
 * Frame-rate independent exponential lerp. `DAMPING` is expressed per 60Hz
 * frame, so a 120Hz display settles over the same wall-clock time.
 */
const approach = (current: number, target: number, deltaMs: number) =>
  current + (target - current) * (1 - Math.pow(1 - DAMPING, deltaMs / 16.667))

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * The head turn advances at a constant rate rather than easing toward the mark:
 * she is a person moving, and people do not decelerate into a pose. Running at
 * the clip's own frame rate means she turns at exactly the speed she was
 * filmed, which is what makes it read as footage rather than as an animation.
 */
const advance = (current: number, target: number, deltaMs: number, fps: number) => {
  const distance = target - current
  const remaining = Math.abs(distance)

  if (remaining < 0.5) {
    return target
  }

  const step = fps * (deltaMs / 1000)

  return remaining <= step ? target : current + Math.sign(distance) * step
}

/** Ceiling on how long catching up may take, in seconds. */
const MAX_CATCH_UP_SEC = 2

/**
 * The rate is fixed once, when the target changes — deriving it per frame from
 * the shrinking distance would decay into an ease, which is the thing we are
 * deliberately not doing.
 */
const rateFor = (from: number, to: number) =>
  Math.max(FPS, Math.abs(to - from) / MAX_CATCH_UP_SEC)

/** Stage fractions over which a claim fades in / out. In > out, by design. */
const ENTER_RANGE = 0.55
const EXIT_RANGE = 0.3

/**
 * One pass over the claims: which one is nearest the trigger line, and how far
 * each sits from it as a fraction of the stage height.
 *
 * Measured against the stage rather than the viewport, because the stage sits
 * below the sticky site header. Shared rather than inlined so the read that
 * decides where the sequence opens and the read the loop does every frame can
 * never disagree about which beat the page is on.
 */
export const readBeats = (stage: HTMLElement | null, beats: (HTMLElement | null)[]) => {
  const frame = stage?.getBoundingClientRect() ?? { top: 0, height: window.innerHeight }
  const line = frame.top + frame.height * TRIGGER_LINE
  const offsets: (number | null)[] = []
  let nearest = 0
  let nearestDistance = Infinity

  beats.forEach((element, index) => {
    if (!element) {
      offsets[index] = null
      return
    }

    const rect = element.getBoundingClientRect()
    const centre = rect.top + rect.height / 2
    const distance = Math.abs(centre - line)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = index
    }

    offsets[index] = (centre - line) / frame.height
  })

  return { nearest, offsets }
}

/** Live chase state for the sequence. */
type Chase = {
  frame: number
  target: number
  /** Frames per second for the move currently in flight. */
  rate: number
  lastTarget: number
}

type Options = {
  sectionRef: RefObject<HTMLElement | null>
  /** The sticky stage. Claims are measured against it. */
  stageRef: RefObject<HTMLElement | null>
  /** One per beat, in order. Their position decides which beat is live. */
  beatRefs: RefObject<(HTMLElement | null)[]>
  /**
   * The beat the page opened on — 0 at the top, whatever a refresh restored
   * otherwise. Decides where the sequence opens, and is seeded before the stage
   * is revealed so the channel and grade are already right when it fades in.
   */
  openingBeat: number
  /** Paints the sequence: a frame index, and the push-in on top of the cover fit. */
  draw: (index: number, scale: number) => void
  enabled: boolean
}

/**
 * The only remapped thing is the gaze.
 *
 * Scroll picks a target beat by which claim is nearest the trigger line, and
 * the clip walks to that beat's frame at the rate it was filmed, so she is
 * never bound frame-for-frame to the finger. The framing does not move at all:
 * the frame sits centred on the crop it was extracted at, touched only by the
 * slow push-in.
 */
export function useHeroMotion({
  sectionRef,
  stageRef,
  beatRefs,
  openingBeat,
  draw,
  enabled,
}: Options) {
  const [activeBeat, setActiveBeat] = useState(0)

  /** Read by the loop, so a new `draw` identity never restarts it. */
  const drawRef = useRef(draw)

  /** Replaced with the real opening position the moment the loop starts. */
  const chaseRef = useRef<Chase>({
    frame: INTRO_FROM,
    target: INTRO_FROM,
    rate: FPS,
    lastTarget: INTRO_FROM,
  })

  /** Live value, chasing the target below. */
  const zoomRef = useRef(1)
  const targetZoomRef = useRef(1)

  const activeRef = useRef(0)

  useEffect(() => {
    drawRef.current = draw
  })

  // Long before the stage is revealed — loading sees to that — so nothing has
  // to swing sides once it is on screen.
  useEffect(() => {
    activeRef.current = openingBeat
    setActiveBeat(openingBeat)
  }, [openingBeat])

  useEffect(() => {
    if (!enabled) {
      return
    }

    // At the top this is the start of the clip, so the first pass below
    // retargets to the first mark and that walk becomes the opening run.
    // Anywhere else it already is that beat's mark, the first pass retargets to
    // the same number, and nothing moves — the stage just fades in on it.
    const from = openingFrame(activeRef.current)

    chaseRef.current = {
      frame: from,
      target: from,
      rate: FPS,
      lastTarget: from,
    }

    let raf = 0
    let last = performance.now()

    const measure = () => {
      const section = sectionRef.current
      const stage = stageRef.current
      const beats = beatRefs.current

      if (!section || !stage || !beats) {
        return
      }

      const { nearest, offsets } = readBeats(stage, beats)

      beats.forEach((element, index) => {
        const offset = offsets[index]

        if (!element || offset === null) {
          return
        }

        // Exits are faster than entrances, and the ranges are tuned so one claim
        // is fully gone before the next appears — never a cross-fade.
        const opacity =
          offset >= 0
            ? 1 - clamp(offset / ENTER_RANGE, 0, 1)
            : 1 - clamp(-offset / EXIT_RANGE, 0, 1)

        element.style.setProperty("--claim", String(opacity))
        // The supporting link arrives a beat after the line it belongs to.
        element.style.setProperty("--action", String(clamp((opacity - 0.45) / 0.55, 0, 1)))
      })

      if (nearest !== activeRef.current) {
        activeRef.current = nearest
        setActiveBeat(nearest)
      }

      chaseRef.current.target = MARKS[nearest]

      // How far the stage has been held: zero until it pins, one when the
      // section releases it.
      const sectionTop = section.getBoundingClientRect().top
      const stageRect = stage.getBoundingClientRect()
      const travel = section.offsetHeight - stageRect.height
      const progress = travel > 0 ? clamp((stageRect.top - sectionTop) / travel, 0, 1) : 0

      targetZoomRef.current = 1 + PUSH_IN * progress
    }

    const frame = (now: number) => {
      const deltaMs = Math.min(now - last, 100)
      last = now

      measure()

      const chase = chaseRef.current

      if (chase.target !== chase.lastTarget) {
        chase.rate = rateFor(chase.frame, chase.target)
        chase.lastTarget = chase.target
      }

      chase.frame = advance(chase.frame, chase.target, deltaMs, chase.rate)

      zoomRef.current = approach(zoomRef.current, targetZoomRef.current, deltaMs)

      drawRef.current(Math.round(chase.frame), zoomRef.current)

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(raf)
  }, [enabled, sectionRef, stageRef, beatRefs])

  /** Lets a keyboard focus jump the sequence to a beat instead of fighting it. */
  const jumpToBeat = (index: number) => {
    activeRef.current = index
    setActiveBeat(index)
    chaseRef.current.target = MARKS[index]
  }

  return { activeBeat, jumpToBeat }
}
