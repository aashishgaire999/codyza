"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { LogOut, Zap } from "lucide-react"
import { NotificationBell } from "@/components/member/notification-bell"

export function MemberNavbar() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [codyzaId, setCodyzaId] = useState("")

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
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
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/member" className="flex items-center gap-2">
            <CodyzaLogo size={32} withGlow={false} />
            <span className="text-lg font-bold">Member Portal</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/member" className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              Dashboard
            </Link>
            <Link href="/member/submit" className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              Submit Project
            </Link>
            <Link href="/member/standup" className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              Standup
            </Link>
            <Link href="/leaderboard" className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {codyzaId && <NotificationBell codyzaId={codyzaId} />}
          {isAdmin && (
            <>
              <Link href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20">
                <Zap className="h-3 w-3" />
                Admin
              </Link>
              <span className="hidden h-4 w-px bg-white/10 sm:block" />
            </>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
