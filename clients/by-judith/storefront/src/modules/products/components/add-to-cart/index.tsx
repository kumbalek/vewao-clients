"use client"

import { clx } from "@medusajs/ui"

import { BagPlusIcon, MinusIcon } from "@modules/design-system/components/icons"
import Spinner from "@modules/common/icons/spinner"
import HoverNote from "./hover-note"

/** The buy button's look (owner, 2026-11-25): `.buy-button` in globals.css. */
export const BUY_BUTTON = "buy-button"

export type AddToCartControlProps = {
  size: "big" | "small"
  /** This product's quantity in the cart; above 0 the count and minus show. */
  quantity: number
  onAdd: () => void
  onRemoveOne: () => void
  /** Big: the button's text. Small: its accessible name (the icon has none). */
  label: string
  removeLabel: string
  /** Announced with the count, e.g. "V košíku: 2". */
  countLabel: string
  busy?: boolean
  disabled?: boolean
  /**
   * Why it cannot be added, e.g. "Není skladem" (owner, 2026-11-24): shown on
   * hover or focus. The button stays focusable (aria-disabled) so the note can
   * be reached, and adds nothing.
   */
  unavailableNote?: string | null
  error?: string | null
  className?: string
  /** The add button's test id; the phone's sticky bar keeps its own. */
  buttonTestId?: string
  "data-testid"?: string
}

/**
 * The add-to-cart button (vewao-clients#75). Big on the product page: the
 * text, then, once the product is in the cart, the count and a round minus
 * beside it while the button gives up the room. Small on product cards: the
 * bag-with-plus icon instead of the text.
 */
export default function AddToCartControl({
  size,
  quantity,
  onAdd,
  onRemoveOne,
  label,
  removeLabel,
  countLabel,
  busy = false,
  disabled = false,
  unavailableNote = null,
  error,
  className,
  buttonTestId = "add-product-button",
  "data-testid": testId = "add-to-cart",
}: AddToCartControlProps) {
  const big = size === "big"
  const inCart = quantity > 0
  const unavailable = !!unavailableNote

  const addButton = (noteId?: string) => (
    <button
      type="button"
      onClick={unavailable ? undefined : onAdd}
      disabled={disabled || busy}
      aria-disabled={unavailable || undefined}
      aria-describedby={noteId}
      aria-label={big ? undefined : label}
      aria-busy={busy || undefined}
      data-testid={buttonTestId}
      className={clx(
        BUY_BUTTON,
        "flex shrink-0 items-center justify-center",
        big ? "h-12 w-full min-w-0 flex-1 px-6 text-base" : "h-11 w-11"
      )}
    >
      {busy ? <Spinner /> : big ? <span className="truncate">{label}</span> : <BagPlusIcon size={24} />}
    </button>
  )

  return (
    <div className={clx("flex flex-col gap-y-2", big && "w-full", className)} data-testid={testId} data-quantity={quantity}>
      <div className={clx("flex items-center", big && "w-full")}>
        {unavailableNote ? (
          <HoverNote note={unavailableNote} className={clx("shrink-0", big && "min-w-0 flex-1")}>
            {(noteId) => addButton(noteId)}
          </HoverNote>
        ) : (
          addButton()
        )}

        {/* Width animates open, so the button gives up its room smoothly; hidden and inert at 0. */}
        <div
          className={clx(
            "flex shrink-0 items-center overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out motion-reduce:transition-none",
            big ? "gap-x-3" : "gap-x-2",
            // The gap to the button only while shown, so an empty cart leaves the button its full width.
            inCart ? (big ? "ml-3 max-w-[7rem] opacity-100" : "ml-2 max-w-[5rem] opacity-100") : "ml-0 max-w-0 opacity-0"
          )}
          aria-hidden={!inCart}
          inert={!inCart}
        >
          <span
            className={clx(
              "min-w-[1ch] text-center tabular-nums text-ink",
              // Small: over a photo, so a white halo keeps the digits legible.
              big ? "text-xl" : "text-base font-medium [text-shadow:0_0_6px_rgb(255_255_255),0_0_2px_rgb(255_255_255)]"
            )}
            data-testid="cart-quantity"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onRemoveOne}
            disabled={!inCart || busy}
            aria-label={removeLabel}
            data-testid="remove-one-button"
            className={clx(
              "flex shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors duration-150 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              big ? "h-10 w-10" : "h-8 w-8"
            )}
          >
            <MinusIcon size={big ? 18 : 16} />
          </button>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {inCart ? countLabel : ""}
      </span>
      {error && (
        <p role="alert" className="text-xs text-danger" data-testid="add-to-cart-error">
          {error}
        </p>
      )}
    </div>
  )
}
