"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"

export const useDelayedRefresh = () => {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const delayedRefresh = useCallback(
    async (waitMs = 800) => {
      setIsRefreshing(true)

      // Wait for the backend subscribers/workflows to finish.
      await new Promise((resolve) => setTimeout(resolve, waitMs))

      startTransition(() => {
        router.refresh()
      })

      setIsRefreshing(false)
    },
    [router]
  )

  return { delayedRefresh, isRefreshing: isRefreshing || isPending }
}
