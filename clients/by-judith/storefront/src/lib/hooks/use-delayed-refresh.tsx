"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export const useDelayedRefresh = () => {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const delayedRefresh = useCallback(
    async (waitMs = 800) => {
      setIsRefreshing(true)

      // 1. Wait for the backend subscribers/workflows to finish
      await new Promise((resolve) => setTimeout(resolve, waitMs))

      // 2. Force Next.js to re-fetch server data (the updated cart)
      router.refresh()

      setIsRefreshing(false)
    },
    [router]
  )

  return { delayedRefresh, isRefreshing }
}
