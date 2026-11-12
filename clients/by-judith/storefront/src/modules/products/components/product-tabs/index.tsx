"use client"

import { useTranslations } from "next-intl"
import Accordion from "./accordion"
import { lexicalToPlainText, renderLexical, type LexicalState } from "@lib/cms/lexical"
import type { ProductTexts } from "@lib/cms/product-texts"

type ProductTabsProps = {
  texts: Pick<ProductTexts, "dosage" | "ingredients" | "information">
}

// The tabs' typography: paragraphs and list items spaced alike, ingredients as a
// dashed list (the dash hidden from screen readers), allergens emphasised.
const tabText = [
  "py-4 flex flex-col gap-y-4 font-normal font-sans txt-medium text-ui-fg-subtle",
  "[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-y-4 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-y-4",
  "[&_li]:flex [&_li]:items-start [&_li]:gap-x-2 [&_li]:px-2 [&_li]:before:content-['–'_/_''] [&_li]:before:shrink-0",
  "[&_strong]:font-semibold [&_strong]:text-ui-fg-base [&_a]:underline",
].join(" ")

/** Dosage, ingredients and further information from the product's texts; empty tabs are left out. */
const ProductTabs = ({ texts }: ProductTabsProps) => {
  const t = useTranslations("product")
  const tabs: { label: string; state: LexicalState; testId: string }[] = [
    { label: t("dose"), state: texts.dosage, testId: "product-dosage" },
    { label: t("ingredients"), state: texts.ingredients, testId: "product-ingredients" },
    { label: t("info"), state: texts.information, testId: "product-information" },
  ].filter((tab) => lexicalToPlainText(tab.state).trim())

  if (!tabs.length) return null

  return (
    <div className="w-full lg:max-w-[500px]">
      <Accordion type="multiple">
        {tabs.map((tab) => (
          <Accordion.Item
            key={tab.testId}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            <div className={tabText} data-testid={tab.testId}>
              {renderLexical(tab.state)}
            </div>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default ProductTabs
