"use client"

import { useEffect, useState } from "react"
import { MemberNavbar } from "@/components/member/member-navbar"
import { Navbar } from "@/components/landing/navbar"

export function SmartNavbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const { createClient } = await import("@/lib/supabase")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setLoggedIn(!!user)
    })()
  }, [])

  if (loggedIn === null) return (
    <div className="h-16 border-b border-white/[0.06] bg-[#050508]/70 backdrop-blur-xl sticky top-0 z-50" />
  )
  return loggedIn ? <MemberNavbar /> : <Navbar />
}
