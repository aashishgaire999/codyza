import { MemberNavbar } from "@/components/member/member-navbar"

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <MemberNavbar />
      {children}
    </div>
  )
}
