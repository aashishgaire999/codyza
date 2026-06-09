"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { MemberNavbar } from "@/components/member/member-navbar"

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
      <div className="fixed inset-0 pointer-events-none" style={{zIndex:0}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 65%)",animation:"aurora-pulse 18s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"40%",right:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 65%)",animation:"aurora-pulse 22s ease-in-out infinite 2s"}}/>
        <div style={{position:"absolute",bottom:"-10%",left:"30%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 65%)",animation:"aurora-pulse 16s ease-in-out infinite 4s"}}/>
        <div className="absolute inset-0 grid-overlay"/>
      </div>
      <div className="relative" style={{zIndex:1}}>
        <MemberNavbar />
        {children}
      </div>
    </div>
  )
}
