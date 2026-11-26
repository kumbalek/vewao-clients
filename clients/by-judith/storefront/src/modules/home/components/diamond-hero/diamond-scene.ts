import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import { highlights, regionOf, toneOf, type Highlight, type Region, type Tone } from "./regions"

/**
 * The logo's diamond in WebGL (owner, 2026-11-25): its 30 facets, read from
 * the logo SVG, are thick pieces of polished coloured glass that swirl in from
 * behind the camera across the whole hero and lock into the diamond, which
 * rests where the anchor element is (the left column on desktop, the top on
 * phones). Each carousel slide raises one group of facets out of the diamond
 * towards the camera; they keep their size and shape, and nothing fades.
 *
 * The diamond is one rigid, opaque object: it sways as a whole, and the depth
 * buffer, not per-object sorting, decides what is in front. Glass here is
 * polished, not see-through: transmission in WebGL shows only what is behind
 * the diamond (the cream backdrop), which would wash out the logo's colours
 * and make raised facets look like holes. The gloss is a clear coat, a studio
 * environment's reflections and bevelled edges that catch them as it sways.
 */

/** The logo's viewBox. */
const LOGO_W = 156.96
const LOGO_H = 198.43
const DEPTH = 10
/** The bevel, kept inside the facet's outline so the diamond's seams stay closed. */
const BEVEL = 0.7
/**
 * A long lens: from far away a raised facet stays over its place instead of
 * spreading out from the diamond's middle, and keeps its size.
 */
const FOV = 14
/** Room around the diamond inside its anchor. */
const MARGIN = 1.12

const INTRO_S = 2.1
const STAGGER_S = 0.04
/** How high a raised facet rises towards the camera, in logo units (the diamond is 198 tall). */
const RISE = 34
const VIEW_AXIS = new THREE.Vector3(0, 0, 1)
/** The glass: how much of the colour is lit (and shades as it turns), how much glows. */
const GLASS_BASE = 0.26
const GLASS_GLOW = 0.7

type Piece = {
  mesh: THREE.Mesh
  material: THREE.MeshPhysicalMaterial
  region: Region
  tone: Tone
  home: THREE.Vector3
  from: THREE.Vector3
  fromRotation: THREE.Quaternion
  delay: number
  /** 0..1, how far towards its raised place. */
  rise: number
}

export type DiamondScene = {
  setHighlight: (highlight: Highlight | null) => void
  dispose: () => void
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export async function createDiamondScene(
  container: HTMLElement,
  anchor: HTMLElement,
  options: { svgUrl: string; reducedMotion: boolean; onReady: () => void; onAssembled: () => void }
): Promise<DiamondScene> {
  const svg = await (await fetch(options.svgUrl)).text()

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  // Keeps hues true under bright reflections (made for product colours).
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.domElement.setAttribute("aria-hidden", "true")
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none"
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  // A key light from the top left for the bevels' glints.
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(-1, 1.6, 2.2)
  scene.add(key)

  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10)
  const diamond = new THREE.Group()
  scene.add(diamond)

  // The facets, each centred on itself so it turns about its own middle.
  const pieces: Piece[] = []
  const geometries: THREE.BufferGeometry[] = []
  for (const path of new SVGLoader().parse(svg).paths) {
    const color = path.color.clone()
    const tone = toneOf(`#${color.getHexString()}`)
    for (const shape of SVGLoader.createShapes(path)) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH - 2 * BEVEL,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
        bevelOffset: -BEVEL,
        bevelSegments: 2,
        curveSegments: 16,
      })
      // SVG y runs down. Flipping y and z together is a turn, not a mirror, so
      // faces keep their winding and only the sides facing the camera draw:
      // two neighbours' shared edge no longer fights itself.
      geometry.scale(1, -1, -1)
      geometry.translate(-LOGO_W / 2, LOGO_H / 2, DEPTH / 2)
      geometry.computeBoundingBox()
      const home = geometry.boundingBox!.getCenter(new THREE.Vector3())
      geometry.translate(-home.x, -home.y, -home.z)
      geometry.computeVertexNormals()
      geometries.push(geometry)

      // The logo's colour comes from the glass's own glow, which lighting does
      // not shift; a dim lit base and the clear coat add the reflections on top.
      const material = new THREE.MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(GLASS_BASE),
        emissive: color,
        emissiveIntensity: GLASS_GLOW,
        metalness: 0,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        ior: 1.5,
        specularIntensity: 1,
        envMapIntensity: 1,
      })
      const mesh = new THREE.Mesh(geometry, material)
      diamond.add(mesh)
      pieces.push({
        mesh,
        material,
        // In SVG coordinates (y down), as the regions are defined.
        region: regionOf(home.x + LOGO_W / 2, LOGO_H / 2 - home.y),
        tone,
        home,
        from: new THREE.Vector3(),
        fromRotation: new THREE.Quaternion(),
        delay: 0,
        rise: 0,
      })
    }
  }

  // The camera's axis runs through the diamond's middle, wherever the anchor
  // puts it in the hero: the canvas is a window into a larger view centred on
  // the diamond. So raised facets rise straight up from it, and the sway turns
  // it about its own middle.
  const frame = { left: 1, right: 1, top: 1, bottom: 1, distance: 1 }
  const fit = () => {
    const width = container.clientWidth || 1
    const height = container.clientHeight || 1
    renderer.setSize(width, height, false)
    const box = container.getBoundingClientRect()
    const target = anchor.getBoundingClientRect()
    const centreX = target.left - box.left + target.width / 2
    const centreY = target.top - box.top + target.height / 2
    const pixelsPerUnit = Math.max(Math.min(target.height / (LOGO_H * MARGIN), target.width / (LOGO_W * MARGIN)), 0.01)
    const fullWidth = 2 * Math.max(centreX, width - centreX)
    const fullHeight = 2 * Math.max(centreY, height - centreY)
    camera.aspect = fullWidth / fullHeight
    camera.setViewOffset(fullWidth, fullHeight, fullWidth / 2 - centreX, fullHeight / 2 - centreY, width, height)
    frame.distance = fullHeight / pixelsPerUnit / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    camera.position.set(0, 0, frame.distance)
    // A depth range just around the scene: with the long lens the camera is
    // far away, and a loose range cannot tell close surfaces apart.
    camera.near = frame.distance * 0.05
    camera.far = frame.distance + 400
    camera.updateProjectionMatrix()
    // The hero's edges around the diamond, in its units: where the swirl starts from.
    frame.left = -centreX / pixelsPerUnit
    frame.right = (width - centreX) / pixelsPerUnit
    frame.top = centreY / pixelsPerUnit
    frame.bottom = -(height - centreY) / pixelsPerUnit
  }
  fit()

  // Starts behind the camera, spread over the whole hero, turned every which
  // way; the order is shuffled so the diamond fills in from everywhere at once.
  const order = pieces.map((_, index) => index).sort(() => Math.random() - 0.5)
  order.forEach((pieceIndex, rank) => {
    const piece = pieces[pieceIndex]
    piece.from.set(
      THREE.MathUtils.lerp(frame.left, frame.right, Math.random()),
      THREE.MathUtils.lerp(frame.bottom, frame.top, Math.random()),
      frame.distance * (1.1 + Math.random() * 0.6)
    )
    piece.fromRotation.setFromEuler(
      new THREE.Euler((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7)
    )
    piece.delay = rank * STAGGER_S
  })
  const introEnd = (pieces.length - 1) * STAGGER_S + INTRO_S

  let highlight: Highlight | null = null
  let assembled = false
  let animation = 0
  let onScreen = true
  let last = performance.now()
  const start = last
  const offset = new THREE.Vector3()
  const identity = new THREE.Quaternion()

  const render = (now: number) => {
    animation = requestAnimationFrame(render)
    if (!onScreen) {
      last = now
      return
    }
    const elapsed = options.reducedMotion ? introEnd : (now - start) / 1000
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    // Damped approach to the targets; immediate with reduced motion.
    const follow = options.reducedMotion ? 1 : 1 - Math.exp(-dt * 5)

    // Once whole, a slow sway of the diamond as one: the raised facets show
    // their height, and the glass its reflections.
    if (!options.reducedMotion && elapsed > introEnd) {
      const idle = (elapsed - introEnd) * 0.5
      diamond.rotation.y = Math.sin(idle) * 0.22
      diamond.rotation.x = Math.sin(idle * 0.7) * 0.08
    }

    for (const piece of pieces) {
      const raised = highlight !== null && highlights(highlight, piece)
      piece.rise += ((raised ? 1 : 0) - piece.rise) * follow

      const t = Math.min(Math.max((elapsed - piece.delay) / INTRO_S, 0), 1)
      const e = easeOutCubic(t)
      // The way in: the start's offset shrinks and unwinds about the view axis.
      offset.copy(piece.from).sub(piece.home).multiplyScalar(1 - e)
      offset.applyAxisAngle(VIEW_AXIS, (1 - e) * 2.4)
      piece.mesh.position.copy(piece.home).add(offset)
      piece.mesh.quaternion.copy(piece.fromRotation).slerp(identity, e)
      piece.mesh.visible = t > 0

      // Raised along the diamond's own axis, so it turns with it; shrunk by
      // exactly what coming closer adds, so it keeps its size.
      const rise = RISE * piece.rise
      piece.mesh.position.z += rise
      piece.mesh.scale.setScalar((frame.distance - rise) / frame.distance)

    }

    renderer.render(scene, camera)
    if (!assembled && elapsed >= introEnd) {
      assembled = true
      options.onAssembled()
    }
  }

  const resize = new ResizeObserver(fit)
  resize.observe(container)
  resize.observe(anchor)
  // No drawing while the hero is off screen.
  const intersection = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
  })
  intersection.observe(container)

  // For tests and tuning: how many facets each tone and region holds.
  const count = (key: "tone" | "region") =>
    pieces.reduce<Record<string, number>>((counts, piece) => ({ ...counts, [piece[key]]: (counts[piece[key]] ?? 0) + 1 }), {})
  container.dataset.tones = JSON.stringify(count("tone"))
  container.dataset.regions = JSON.stringify(count("region"))

  animation = requestAnimationFrame(render)
  options.onReady()

  return {
    setHighlight: (next) => {
      highlight = next
    },
    dispose: () => {
      cancelAnimationFrame(animation)
      resize.disconnect()
      intersection.disconnect()
      for (const geometry of geometries) geometry.dispose()
      for (const piece of pieces) piece.material.dispose()
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
