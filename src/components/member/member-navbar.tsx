"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Clock3, House, LogOut, Rocket, Settings, Target, Users } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { memberFetch } from "@/lib/member-fetch"
import { InstallAppButton } from "@/components/shared/install-app-button"

const LINKS = [
  { href: "/member", label: "Hub", icon: House },
  { href: "/member/projects", label: "Projects", icon: Rocket },
  { href: "/member/groups", label: "Groups", icon: Users },
  { href: "/member/bounties", label: "Bounties", icon: Target },
  { href: "/member/standup", label: "Time", icon: Clock3 },
  { href: "/member/settings", label: "Settings", icon: Settings },
]

function useElapsed(startedAt: string | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!startedAt) return
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [startedAt])
  if (!startedAt) return ""
  const totalMinutes = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000))
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
}

type SessionSummary = { status: string; started_at: string }

export function MemberNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [codyzaId, setCodyzaId] = useState("")
  const [activeSessionStart, setActiveSessionStart] = useState<string | null>(null)
  const elapsed = useElapsed(activeSessionStart)

  useEffect(() => {
    let cancelled = false
    const loadMemberChrome = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return
      const { data } = await supabase
        .from("contributors")
        .select("is_admin, codyza_id")
        .eq("email", user.email)
        .maybeSingle()
      if (cancelled) return
      setIsAdmin(Boolean(data?.is_admin))
      setCodyzaId(data?.codyza_id || "")

      if (data?.codyza_id) {
        const res = await memberFetch("/api/work-sessions")
        const sessions = await res.json()
        const active = Array.isArray(sessions) ? sessions.find((session: SessionSummary) => session.status === "active") : null
        if (!cancelled) setActiveSessionStart(active?.started_at || null)
      }
    }
    const handleSessionChange = (event: Event) => {
      const detail = (event as CustomEvent<{ startedAt: string | null }>).detail
      setActiveSessionStart(detail?.startedAt || null)
    }
    void loadMemberChrome()
    window.addEventListener("codyza:work-session", handleSessionChange)
    return () => {
      cancelled = true
      window.removeEventListener("codyza:work-session", handleSessionChange)
    }
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
    <header className="member-navbar sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <Link href="/member" className="flex shrink-0 items-center gap-2.5">
          <CodyzaLogo size={28} variant="full" />
          <span className="member-hero-label hidden md:inline">
            {codyzaId || "member"}
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "member-nav-link rounded-full px-3 py-1.5 text-sm transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="rounded-full px-3 py-1.5 text-sm text-accent hover:opacity-80">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeSessionStart && (
            <Link
              href="/member/standup"
              className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success sm:flex"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none" />
              {elapsed}
            </Link>
          )}
          <InstallAppButton compact />
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
    <nav className="member-mobile-dock lg:hidden" aria-label="Member navigation">
      {LINKS.map((link) => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn("member-mobile-link", active && "member-mobile-link-active")}
          >
            <Icon aria-hidden className="h-[18px] w-[18px]" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
    </>
  )
}
