"use client"

import { ArrowLeftMini } from "@medusajs/icons"
import { useTranslations } from "next-intl"

const BackButton = () => {
  const t = useTranslations("cart")

  const handleBack = () => {
    window.history.back()
  }

  return (
    <button onClick={handleBack}>
      <div className="flex justify-center items-center gap-1">
        <ArrowLeftMini />
        {t("backToTheShop")}
      </div>
    </button>
  )
}

export default BackButton
