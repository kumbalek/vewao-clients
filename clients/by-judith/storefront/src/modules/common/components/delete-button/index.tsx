import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useId, useState } from "react"

import { useDelayedRefresh } from "@lib/hooks/use-delayed-refresh"

const DeleteButton = ({
  id,
  children,
  className,
  "data-testid": dataTestid,
  "aria-label": ariaLabel,
  disabled,
  onBusyChange,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  "data-testid"?: string
  "aria-label"?: string
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { delayedRefresh, isRefreshing } = useDelayedRefresh()
  const generatedId = useId()
  const errorId = `delete-button-error-${generatedId}`
  const busy = isDeleting || isRefreshing
  const isDisabled = disabled || busy

  useEffect(() => {
    onBusyChange?.(busy)
  }, [busy, onBusyChange])

  const handleDelete = async (id: string) => {
    if (isDisabled) {
      return
    }
    setIsDeleting(true)
    onBusyChange?.(true)
    setError(null)

    try {
      await deleteLineItem(id)
      await delayedRefresh()
    } catch {
      setError("Odebrání položky se nepodařilo. Zkuste to prosím znovu.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        type="button"
        data-testid={dataTestid}
        aria-label={ariaLabel ?? (children ? undefined : "Odebrat položku")}
        aria-describedby={error ? errorId : undefined}
        aria-busy={isDisabled}
        disabled={isDisabled}
        onClick={() => handleDelete(id)}
      >
        {isDeleting || isRefreshing ? (
          <Spinner className="animate-spin" />
        ) : (
          <Trash />
        )}
        <span>{children}</span>
      </button>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-rose-500 text-small-regular"
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default DeleteButton
