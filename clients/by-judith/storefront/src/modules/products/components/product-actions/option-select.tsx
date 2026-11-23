import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  /** The chosen value, or the chosen values where several may be chosen. */
  current: string | string[] | undefined
  /** The buttons toggle: several values may be chosen at once (vewao-clients#70). */
  multiple?: boolean
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  multiple = false,
}) => {
  const t = useTranslations("product")
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isChosen = (value: string) => (Array.isArray(current) ? current.includes(value) : value === current)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">
        {t("selectOption", { option: title.toLocaleLowerCase("cs") })}
        {multiple && <span className="text-ink-subtle"> · {t("severalAllowed")}</span>}
      </span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                // As wide as its words, never broken; buttons wrap onto rows (vewao-clients#70).
                "bg-ui-bg-subtle border text-small-regular h-10 rounded-[3rem] px-4 whitespace-nowrap",
                {
                  "border-ui-border-interactive": isChosen(v),
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    !isChosen(v),
                }
              )}
              disabled={disabled}
              aria-pressed={isChosen(v)}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
