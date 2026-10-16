"use client"

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react"
import { useRouter } from "next/navigation"

/** Payload Live Preview: re-renders the server components after each autosave. */
export default function RefreshOnSave() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={process.env.NEXT_PUBLIC_CMS_URL ?? ""} />
}
