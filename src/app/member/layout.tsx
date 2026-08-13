"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { usePathname, useRouter } from "next/navigation"
import { MemberNavbar } from "@/components/member/member-navbar"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { SiteShell } from "@/components/shared/site-shell"
import { CosmicBackdrop, type CosmicVariant } from "@/components/effects/cosmic-backdrop"

function getCosmicVariant(pathname: string): CosmicVariant {
  if (pathname.includes("/projects")) return "projects"
  if (pathname.includes("/groups")) return "groups"
  if (pathname.includes("/bounties")) return "bounties"
  if (pathname.includes("/standup")) return "standup"
  if (pathname.includes("/settings")) return "settings"
  return "hub"
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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

  useEffect(() => {
    // Mobile browsers can preserve an accidental horizontal scroll position
    // between navigations. The member shell is intentionally viewport-bound.
    window.scrollTo({ left: 0, top: window.scrollY, behavior: "instant" })
  }, [pathname])

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <SiteShell showProgress={false} className="codyza-member">
      <div className="cosmic-workspace" data-cosmic-zone={getCosmicVariant(pathname)}>
        <CosmicBackdrop variant={getCosmicVariant(pathname)} />
        <div className="cosmic-workspace-content">
          <MemberNavbar />
          <main className="cosmic-main mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
    </SiteShell>
  )
}
