import assert from "node:assert/strict"
import { existsSync, readdirSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"
import {
  BEATS,
  CLIP,
  FADE_MS,
  FPS,
  MARKS,
  framePath,
  openingFrames,
} from "../src/modules/landing/components/hero-animation/config.ts"

const publicDir = fileURLToPath(new URL("../public", import.meta.url))

test("every frame the hero can ask for exists, and no more", () => {
  for (const dir of Object.values(CLIP.sets)) {
    for (let index = 0; index < CLIP.frameCount; index++) {
      const file = `${publicDir}${framePath(dir, index)}`
      assert.ok(existsSync(file), `missing ${file}`)
    }
    assert.equal(readdirSync(`${publicDir}${dir}`).length, CLIP.frameCount, dir)
  }
})

test("beats rest on frames inside the clip, in playing order", () => {
  assert.deepEqual(MARKS, [40, 75, 125, 175])
  assert.ok(MARKS.every((mark) => mark < CLIP.frameCount))
  assert.deepEqual([...MARKS].sort((a, b) => a - b), MARKS)
})

test("only the top of the page waits for the opening run", () => {
  assert.deepEqual(openingFrames(0), Array.from({ length: 41 }, (_, index) => index))
  assert.deepEqual(openingFrames(2), [125])
  // The stage fades in over exactly that run.
  assert.equal(FADE_MS, (40 / FPS) * 1000)
})

test("west is read before east, each linking to its procedure category", () => {
  assert.deepEqual(
    BEATS.map((beat) => beat.direction),
    ["center", "west", "east", "center"]
  )
  assert.deepEqual(
    BEATS.map((beat) => beat.action?.href),
    [undefined, "/procedury/beauty", "/procedury/akupunktura", undefined]
  )
  // Only the last beat carries the booking button.
  assert.deepEqual(
    BEATS.map((beat) => Boolean(beat.isResolve)),
    [false, false, false, true]
  )
})

test("frame paths are zero-padded to three digits", () => {
  assert.equal(framePath("/f", 7), "/f/frame-007.webp")
})
