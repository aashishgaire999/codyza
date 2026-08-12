"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function HomeAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash?.includes("access_token=") && (hash.includes("type=invite") || hash.includes("type=recovery"))) {
      router.replace(`/set-password${hash}`)
    }
  }, [router])

  return null
}
