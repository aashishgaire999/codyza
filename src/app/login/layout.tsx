import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata(
  "Member Login",
  "Sign in to Codyza to access your projects, bounties, groups, progress, and member workspace.",
  "/login"
)

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
