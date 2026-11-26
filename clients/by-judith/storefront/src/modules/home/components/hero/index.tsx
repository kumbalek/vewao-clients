"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ExpandableButton from "modules/common/components/expand-button"

const mapToRange = (value: number, min: number, max: number): number => {
  // value is in [-1, 1]
  return Math.floor(min + (value + 1) * 0.5 * (max - min))
}

const baseWave = (x: number, y: number, time: number): number => {
  // Smooth "field" with multiple blobs
  return (
    Math.sin((x * x + y * y) / 400 + time) + Math.cos((x + y) / 60 + time / 3)
  )
}

const Hero = () => {
  const t = useTranslations("hero")
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current) {
      const context = ref.current.getContext("2d")
      if (context) {
        let time = 0

        const color = function (
          x: number,
          y: number,
          r: number,
          g: number,
          b: number
        ) {
          context.fillStyle = `rgb(${r}, ${g}, ${b})`
          context.fillRect(x, y, 5, 5)
        }

        const R = function (x: number, y: number, time: number): number {
          const v = baseWave(x, y, time)
          return mapToRange(v, 235, 245) // mostly bright, subtle shift
        }

        const G = function (x: number, y: number, time: number): number {
          const v = baseWave(x, y, time + 0.3) // tiny phase offset
          return mapToRange(v, 210, 235) // close to R, keeps warmth
        }

        const B = function (x: number, y: number, time: number): number {
          const v = baseWave(x, y, time + 0.6)
          return mapToRange(v, 180, 215) // lower range, keeps gold/beige tint
        }

        const startAnimation = function () {
          for (let x = 0; x <= 30; x++) {
            for (let y = 0; y <= 30; y++) {
              color(x, y, R(x, y, time), G(x, y, time), B(x, y, time))
            }
          }
          time = time + 0.01
          window.requestAnimationFrame(startAnimation)
        }

        startAnimation()
      }
    }
  }, [])

  return (
    <div className="w-full relative">
      <div className="relative inset-0 z-10 flex flex-col justify-start items-center text-center py-8 px-4 small:p-16 gap-6">
        <Heading
          level="h1"
          className="text-2xl small:text-4xl small:leading-10 large:text-5xl large:leading-[3.5rem] text-ui-fg-base font-normal max-w-3xl"
        >
          {t("claim")}
        </Heading>
        <div className="relative w-full max-w-6xl">
          <div className="absolute bottom-0 h-[58%] w-full rounded-[3rem] overflow-hidden">
            <canvas
              width="32px"
              height="32px"
              className="absolute h-full w-full overflow-hidden"
              ref={ref}
            />
          </div>
          <div className="relative w-full">
            <Image
              src={"/judit.webp"}
              alt="Judita Halvová"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }} // optional
            />
          </div>
          <div className="absolute top-[45%] left-[16%]">
            <ExpandableButton
              expandedContent={
                <div className="flex flex-col gap-1 min-w-32">
                  <Heading level="h3" className="text-xl">
                    № 1 Allergy
                  </Heading>
                  <span className="text-xl text-neutral-500">1.890 Kč</span>
                  <LocalizedClientLink
                    className="rounded-[1rem] bg-black text-white shadow-none outline-none text-[12px] py-2 px-3 mx-1"
                    href="/products/allergy"
                  >
                    {t("showProduct")}
                  </LocalizedClientLink>
                </div>
              }
            />
          </div>
          <div className="absolute top-[77%] left-[48%]">
            <ExpandableButton
              expandedContent={
                <div className="flex flex-col gap-1 min-w-32">
                  <Heading level="h3" className="text-xl">
                    № 7 Runny Nose Acute
                  </Heading>
                  <span className="text-xl text-neutral-500">590 Kč</span>
                  <LocalizedClientLink
                    className="rounded-[1rem] bg-black text-white shadow-none outline-none text-[12px] py-2 px-3 mx-1"
                    href="/products/runny-nose-acute"
                  >
                    {t("showProduct")}
                  </LocalizedClientLink>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
