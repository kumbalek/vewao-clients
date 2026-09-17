import { Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import Thumbnail from "@modules/products/components/thumbnail"

const Reviews = () => {
  const t = useTranslations("hero")

  return (
    <div className="w-full relative flex flex-col items-center py-8 small:py-12">
      <div className="w-full relative content-container max-w-7xl flex gap-8 justify-between flex-col-reverse small:flex-row  py-8 small:p-16">
        <div className="small:w-1/3 max-w-96">
          <Thumbnail thumbnail={"/dn.webp"} size="full" />
        </div>
        <div className="flex flex-col gap-8 small:w-2/3">
          <div className="px-6 small:px-8 py-8 bg-zinc-50 rounded-[3rem] flex flex-col justify-center">
            <div>
              <Heading
                level="h2"
                className="text-xl text-ui-fg-base font-normal max-w-3xl"
              >
                {t("dnTitle")}
              </Heading>
              <Heading
                level="h3"
                className="text-4xl small:text-6xl text-ui-fg-base font-normal max-w-3xl"
              >
                {"Denisa Nesvačilová"}
              </Heading>
              <p className="mt-8 text-lg tracking-wide">{t("dnReview1")}</p>
              <p className="mt-4 text-lg tracking-wide">{t("dnReview2")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reviews
