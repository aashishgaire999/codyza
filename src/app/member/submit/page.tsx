"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MemberSubmitRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/member/projects") }, [router])
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-muted-foreground">Opening projects…</p>
      </div>
    </div>
  )
}
