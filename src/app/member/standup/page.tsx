"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/shared/site-shell"

export default function StandupRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/member") }, [router])
  return (
    <SiteShell className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
      </div>
    </SiteShell>
  )
}
