import { MemberNavbar } from "@/components/member/member-navbar"

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{background:"linear-gradient(135deg,#0f0c1a 0%,#130d24 50%,#0c1220 100%)"}}>
      <div className="fixed inset-0 pointer-events-none" style={{zIndex:0}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 65%)",animation:"aurora-pulse 14s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"40%",right:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 65%)",animation:"aurora-pulse 18s ease-in-out infinite 2s"}}/>
        <div style={{position:"absolute",bottom:"-10%",left:"30%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(103,232,249,0.08) 0%,transparent 65%)",animation:"aurora-pulse 12s ease-in-out infinite 4s"}}/>
        <div className="absolute inset-0 grid-overlay"/>
      </div>
      <div className="relative" style={{zIndex:1}}>
        <MemberNavbar />
        {children}
      </div>
    </div>
  )
}
