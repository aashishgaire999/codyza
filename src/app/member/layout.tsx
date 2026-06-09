"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { MemberNavbar } from "@/components/member/member-navbar"
import { GalaxyBackground } from "@/components/effects/galaxy-background"

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [auth, setAuth] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setAuth(true)
    })()
  }, [router])

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-5 h-5 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin"/>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-background">
      <GalaxyBackground />
      <div className="relative" style={{zIndex:1}}>
        <MemberNavbar />
        {children}
      </div>
    </div>
  )
}
