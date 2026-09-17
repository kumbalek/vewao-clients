"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { useTranslations } from "next-intl"
import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const t = useTranslations("product")
  const tabs = [
    // {
    //   label: "Product Information",
    //   component: <ProductInfoTab product={product} />,
    // },
    // {
    //   label: "Shipping & Returns",
    //   component: <ShippingInfoTab />,
    // },
    {
      label: t("dose"),
      component: <DoseTab product={product} />,
    },
    {
      label: t("ingredients"),
      component: <IngredientsTab product={product} />,
    },
    {
      label: t("info"),
      component: <InfoTab product={product} />,
    },
  ]

  return (
    <div className="w-full lg:max-w-[500px]">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const IngredientsTab = ({ product }: ProductTabsProps) => {
  const ingredients = product?.metadata?.ingredients as string
  const parsedIngredients = JSON.parse(ingredients || "[]")

  return (
    <div className="text-small-regular py-4">
      <div className="flex flex-col gap-y-4">
        {parsedIngredients.map((ingredient: string, index: number) => (
          <div
            key={`ingredient_${index}`}
            className="flex items-start gap-x-2 px-2"
          >
            {"–"}
            <span className="font-normal font-sans txt-medium text-ui-fg-subtle whitespace-pre-line">
              {ingredient}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DoseTab = ({ product }: ProductTabsProps) => {
  const dose = (product?.metadata?.dose || "") as string
  const parsedDose = dose.split(";")

  return (
    <div className="text-small-regular py-4">
      <div className="flex flex-col gap-y-4">
        {parsedDose.map((singleDose, index) => (
          <p
            key={`dose_${index}`}
            className="font-normal font-sans txt-medium text-ui-fg-subtle whitespace-pre-line"
          >
            {singleDose}
          </p>
        ))}
      </div>
    </div>
  )
}

const InfoTab = ({ product }: ProductTabsProps) => {
  const weight = product?.metadata?.weight as string
  const information = (product?.metadata?.informations || "") as string
  const parsedInformation = information.split(";")

  return (
    <div className="text-small-regular py-4">
      <div className="flex flex-col gap-y-4">
        {parsedInformation.map((singleInfo, index) => (
          <p
            key={`info_${index}`}
            className="font-normal font-sans txt-medium text-ui-fg-subtle whitespace-pre-line"
          >
            {singleInfo}
          </p>
        ))}
        <p className="font-normal font-sans txt-medium text-ui-fg-subtle whitespace-pre-line">
          {weight}
        </p>
      </div>
    </div>
  )
}

export default ProductTabs
