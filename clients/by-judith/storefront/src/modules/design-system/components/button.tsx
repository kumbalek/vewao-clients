import { clx } from "@medusajs/ui"
import React from "react"

import Spinner from "@modules/common/icons/spinner"

export type ButtonVariant = "primary" | "secondary" | "inverse" | "outline-inverse"
export type ButtonSize = "sm" | "md" | "lg"

export type ButtonStyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-normal whitespace-nowrap transition-colors duration-200 ease-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const variants: Record<ButtonVariant, string> = {
  // The dark pill used for "Přidat do košíku".
  primary:
    "bg-action text-white hover:bg-action-hover focus-visible:outline-ink",
  // The white pill with a hairline border (promo "Přidat do košíku").
  secondary:
    "bg-white text-ink border border-line hover:bg-surface-hover focus-visible:outline-ink",
  // For dark panels such as the free-delivery popup.
  inverse:
    "bg-white text-ink hover:bg-surface-hover focus-visible:outline-white",
  "outline-inverse":
    "border border-white text-white hover:bg-white/10 focus-visible:outline-white",
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
}

/** Class names for anything that should look like a button, including links. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: ButtonStyleProps = {}): string {
  return clx(base, variants[variant], sizes[size], fullWidth && "w-full")
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & {
    /** Disables the button and shows a spinner; the label stays readable. */
    isLoading?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={clx(buttonClasses({ variant, size, fullWidth }), className)}
      {...props}
    >
      {isLoading && <Spinner aria-hidden="true" />}
      {children}
    </button>
  )
)

Button.displayName = "Button"

export default Button
