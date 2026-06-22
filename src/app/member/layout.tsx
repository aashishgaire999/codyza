"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { MemberNavbar } from "@/components/member/member-navbar"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { SiteShell } from "@/components/shared/site-shell"

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [auth, setAuth] = useState<boolean | null>(null)
  useScrollReveal()

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setAuth(true)
    })()
  }, [router])

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <SiteShell showProgress={false}>
      <MemberNavbar />
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">{children}</main>
    </SiteShell>
  )
}
