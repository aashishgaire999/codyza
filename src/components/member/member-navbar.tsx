"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/member", label: "Hub" },
  { href: "/member/projects", label: "Projects" },
  { href: "/member/groups", label: "Groups" },
  { href: "/member/bounties", label: "Bounties" },
  { href: "/member/standup", label: "Timesheet" },
  { href: "/member/settings", label: "Settings" },
]

function useElapsed(startedAt: string | null) {
  const [label, setLabel] = useState("")
  useEffect(() => {
    if (!startedAt) { setLabel(""); return }
    const update = () => {
      const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000))
      setLabel(`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [startedAt])
  return label
}

export function MemberNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [codyzaId, setCodyzaId] = useState("")
  const [activeSessionStart, setActiveSessionStart] = useState<string | null>(null)
  const elapsed = useElapsed(activeSessionStart)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return
      const { data } = await supabase
        .from("contributors")
        .select("is_admin, codyza_id")
        .eq("email", user.email)
        .maybeSingle()
      setIsAdmin(!!data?.is_admin)
      setCodyzaId(data?.codyza_id || "")

      if (data?.codyza_id) {
        const res = await fetch(`/api/work-sessions?codyza_id=${data.codyza_id}`)
        const sessions = await res.json()
        const active = Array.isArray(sessions) ? sessions.find((s: any) => s.status === "active") : null
        setActiveSessionStart(active?.started_at || null)
      }
    })()
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-8">
        <Link href="/member" className="flex shrink-0 items-center gap-2.5">
          <CodyzaLogo size={28} variant="full" />
          <span className="member-hero-label hidden md:inline">
            {codyzaId || "member"}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
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
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              {elapsed}
            </Link>
          )}
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
  )
}
