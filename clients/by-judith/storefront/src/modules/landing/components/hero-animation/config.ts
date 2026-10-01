/**
 * Which way she is looking, and which half of the argument the claim carries.
 * One field for both, because the copy is ordered to agree with the footage:
 * she looks screen left at 3s and screen right at 5s, so *Západ* is read first
 * and *Východ* second. It places the claim in the third of the frame she is
 * looking into, and picks the grade — east warm, west cool.
 */
export type BeatDirection = "center" | "east" | "west"

export type Beat = {
  id: string
  direction: BeatDirection
  /** Second of the clip this beat rests on. Converted to a frame index below. */
  seconds: number
  eyebrow: string
  /**
   * Display line. Mobile gets its own so the desktop line never orphans. A
   * one-letter preposition is bound to the next word (\u00a0), as Czech
   * typesetting requires.
   */
  title: string
  mobileTitle: string
  /** Secondary action. Always a real anchor, present at load. */
  action?: { label: string; href: string }
  /** Only the resolve carries the primary CTA, the header's "Rezervovat". */
  isResolve?: boolean
}

export const FPS = 25

/**
 * One shoot, one sequence, cut from `Movie.mov` (see ../../README.md). The cut
 * between the two halves is baked into the footage, so the stage is a single
 * canvas playing a single run of frames: 176 of them, 0s..7.0s at FPS. She is
 * to camera at 1s, turned west at 3s, east at 5s and back at 7s.
 */
export const CLIP = {
  frameCount: 176,
  /** Two crops: the stage on desktop, a tighter one on mobile. */
  sets: {
    wide: "/assets/landing/frames/movie/wide",
    portrait: "/assets/landing/frames/movie/portrait",
  },
}

/**
 * The four beats. Her gaze is the cause; the copy is placed where she looks,
 * and ordered to follow her rather than the other way round — she turns west
 * before she turns east, so *Západ* is the claim that goes on the left.
 *
 * The two actions lead to the procedure categories in the Content plugin, by
 * slug; renaming a category there breaks its link here.
 */
export const BEATS: Beat[] = [
  {
    id: "center",
    direction: "center",
    seconds: 1.6,
    eyebrow: "Klinika",
    title: "Snoubíme západ s\u00a0východem",
    mobileTitle: "Snoubíme západ\ns\u00a0východem",
  },
  {
    id: "west",
    direction: "west",
    seconds: 3,
    eyebrow: "Západ",
    title: "Efektivita pro moderní život",
    mobileTitle: "Efektivita pro\nmoderní život",
    action: {
      label: "Lasery · injekční ošetření · pleť",
      href: "/procedury/beauty",
    },
  },
  {
    id: "east",
    direction: "east",
    seconds: 5,
    eyebrow: "Východ",
    title: "Revoluce v\u00a0akupunktuře",
    mobileTitle: "Revoluce\nv\u00a0akupunktuře",
    action: {
      label: "TCM diagnostika · akupunktura",
      href: "/procedury/akupunktura",
    },
  },
  {
    id: "resolve",
    direction: "center",
    seconds: 7,
    eyebrow: "Začátek",
    title: "Dva směry, jeden cíl",
    mobileTitle: "Dva směry,\njeden cíl",
    isResolve: true,
  },
]

/** Frame index the clip rests on, per beat. */
export const MARKS: number[] = BEATS.map((beat) => Math.round(beat.seconds * FPS))

/**
 * Where the sequence opens: the very start of the clip, her head down. It is
 * not a resting pose — no beat scrolls to it. Once the opening run is in memory
 * the clip plays from here to the first mark, lifting her head into camera, and
 * the stage fades up over exactly that move.
 */
export const INTRO_FROM = 0

/**
 * The fade and the opening run are one gesture, so they last the same: however
 * long she takes to lift her head at the rate she was filmed.
 */
export const FADE_MS = ((MARKS[0] - INTRO_FROM) / FPS) * 1000

/**
 * The frame the sequence opens on, given the beat the page opened on. Only the
 * top of the page gets the opening run: refresh halfway down and it opens
 * already resting on that section's frame rather than replaying every turn
 * before it.
 */
export const openingFrame = (beat: number) => (beat === 0 ? INTRO_FROM : MARKS[beat])

/**
 * The frames the first paint needs, so loading waits for exactly them — the
 * whole opening run at the top, a single resting frame anywhere else.
 */
export const openingFrames = (beat: number) => {
  const from = openingFrame(beat)
  const to = MARKS[beat]

  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

export const framePath = (dir: string, index: number) =>
  `${dir}/frame-${String(index).padStart(3, "0")}.webp`

/**
 * Exponential lerp applied to the push-in, so a fast flick still settles after
 * the scroll has stopped rather than snapping with it.
 */
export const DAMPING = 0.07

/** Slow push-in across the whole section. Felt, not seen. */
export const PUSH_IN = 0.035

/**
 * Vertical gap between claims, as a fraction of the stage height. Does the work
 * a pin would otherwise do.
 */
export const BEAT_GAP = 0.9

/** The one thing that holds: the resolve, while she returns to camera. */
export const RESOLVE_HOLD = 0.6

/**
 * Where a claim comes to rest, as a fraction of the stage height from its top.
 * Each claim block is BEAT_GAP tall and centred on this line at its rest
 * position — the first one at scroll zero.
 */
export const TRIGGER_LINE = BEAT_GAP / 2
