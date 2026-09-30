"use client"

import { RefObject, useCallback, useEffect, useRef, useState } from "react"

import { framePath } from "./config"

/** Parallel image requests. Enough to saturate HTTP/2 without starving the priority range. */
const CONCURRENCY = 6

/** Retina beyond 2x costs fill rate for no visible gain on a full-bleed image. */
const MAX_DPR = 2

type Options = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** Null until the crop is chosen on the client. */
  dir: string | null
  count: number
  /**
   * The frames the first paint needs, in load order — the whole opening run at
   * the top of the page, a single resting frame when it opens mid-section. All
   * of them must be in memory before `ready` flips, so the opening plays
   * without stuttering on a cold cache. Must be stable across renders.
   */
  priority: number[]
}

/**
 * Loads a frame sequence and paints it to a canvas, object-fit: cover style.
 *
 * `ready` flips once the priority range has settled; the remaining frames keep
 * loading in the background, so the intro starts without waiting for the tail.
 */
export function useFrameSequence({
  canvasRef,
  dir,
  count,
  priority,
}: Options) {
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([])
  const lastScaleRef = useRef(1)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastFrameRef = useRef(priority[0])

  const [ready, setReady] = useState(false)

  /** Falls back to the closest loaded neighbour so a gap never blanks the canvas. */
  const resolveFrame = useCallback((index: number) => {
    const frames = framesRef.current
    const exact = frames[index]

    if (exact) {
      return exact
    }

    for (let offset = 1; offset < frames.length; offset++) {
      const before = frames[index - offset]

      if (before) {
        return before
      }

      const after = frames[index + offset]

      if (after) {
        return after
      }
    }

    return undefined
  }, [])

  /** `scale` multiplies into the cover fit: the push-in, and nothing else. */
  const draw = useCallback(
    (index: number, scale = 1) => {
      const canvas = canvasRef.current
      const context = contextRef.current

      if (!canvas || !context) {
        return
      }

      lastFrameRef.current = index
      lastScaleRef.current = scale

      const image = resolveFrame(index)

      if (!image) {
        return
      }

      const { width, height } = canvas
      const cover = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight
      )
      const drawWidth = image.naturalWidth * cover * scale
      const drawHeight = image.naturalHeight * cover * scale

      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight
      )
    },
    [canvasRef, resolveFrame]
  )

  // Size the backing store to the element, and repaint whatever was on screen.
  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    contextRef.current = canvas.getContext("2d")

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const width = Math.round(canvas.clientWidth * dpr)
      const height = Math.round(canvas.clientHeight * dpr)

      if (canvas.width === width && canvas.height === height) {
        return
      }

      canvas.width = width
      canvas.height = height
      draw(lastFrameRef.current, lastScaleRef.current)
    }

    resize()

    window.addEventListener("resize", resize)
    window.addEventListener("orientationchange", resize)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("orientationchange", resize)
    }
  }, [canvasRef, draw])

  useEffect(() => {
    if (!dir) {
      return
    }

    const frames: (HTMLImageElement | undefined)[] = new Array(count)
    framesRef.current = frames

    // Whichever frame the page opens on is the one to paint the moment it
    // arrives, not frame 0.
    lastFrameRef.current = priority[0]

    let cancelled = false

    const loadOne = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new Image()

        image.decoding = "async"

        const settle = () => {
          if (!cancelled) {
            frames[index] = image

            // The very first frame should appear as soon as it exists.
            if (index === lastFrameRef.current) {
              draw(index, lastScaleRef.current)
            }
          }
          resolve()
        }

        image.onload = () => {
          // Decode up front so the rAF loop never blocks on it.
          const decoded = image.decode?.()

          if (decoded) {
            decoded.then(settle, settle)
          } else {
            settle()
          }
        }

        // Leave the slot empty; `resolveFrame` covers the hole.
        image.onerror = () => resolve()

        image.src = framePath(dir, index)
      })

    /** Runs `indices` through a fixed-size pool, in order. */
    const runPool = async (indices: number[]) => {
      let cursor = 0

      const worker = async () => {
        while (!cancelled) {
          const index = indices[cursor++]

          if (index === undefined) {
            return
          }

          await loadOne(index)
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, indices.length) }, worker)
      )
    }

    const wanted = new Set(priority)
    /** The frame the opening comes to rest on. */
    const anchor = priority[priority.length - 1]
    const rest = Array.from({ length: count }, (_, index) => index)
      .filter((index) => !wanted.has(index))
      // Outward from where it came to rest, so a turn in either direction has
      // its frames before it needs them — opening mid-section, the run-up at
      // the top of the clip is the last thing worth fetching.
      .sort((a, b) => Math.abs(a - anchor) - Math.abs(b - anchor))

    const run = async () => {
      await runPool(priority)

      if (cancelled) {
        return
      }

      setReady(true)

      await runPool(rest)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [dir, count, priority, draw])

  return { ready, draw }
}
