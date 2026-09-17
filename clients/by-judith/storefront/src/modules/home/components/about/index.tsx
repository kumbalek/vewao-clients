import Image from "next/image"
import { Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import Thumbnail from "@modules/products/components/thumbnail"

const About = () => {
  const t = useTranslations("hero")

  return (
    <div className="w-full relative flex flex-col items-center py-12 small:py-24">
      <div className="w-full relative content-container max-w-7xl flex gap-8 justify-center align-center flex-col">
        <div className="w-full bg-zinc-50 p-6 small:p-8 rounded-[3rem]">
          <Heading
            level="h3"
            className="text-4xl small:text-6xl text-ui-fg-base font-normal max-w-3xl"
          >
            {"Judita Halvová"}
          </Heading>
          <div className="flex flex-col small:flex-row gap-4 large:gap-8 ">
            <div className="small:w-1/2">
              <p className="mt-4 ">{t("jh1")}</p>
              <p className="mt-4 ">{t("jh2")}</p>
              <p className=" ">{t("jh3")}</p>
            </div>
            <div className="small:w-1/2">
              <p className="mt-4 ">{t("jh4")}</p>
              <p className="mt-4 ">{t("jh5")}</p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-7xl rounded-[3rem] overflow-hidden">
          <Image
            src={"/jh-about.webp"}
            alt="Judita Halvová"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </div>
  )
}

export default About
