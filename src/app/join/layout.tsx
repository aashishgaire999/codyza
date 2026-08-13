import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata("Join", "Apply to join Codyza — five questions, reviewed within 48 hours.", "/join")

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children
}
