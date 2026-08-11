"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PublicShell } from "@/components/shared/public-shell"

export default function SubmitRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/member/projects") }, [router])
  return (
    <PublicShell footer={false}>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
          <p className="sofi-body text-black/50">Taking you to projects…</p>
        </div>
      </div>
    </PublicShell>
  )
}
