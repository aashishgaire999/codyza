import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Member login",
  description: "Sign in to the private Codyza member workspace.",
  alternates: { canonical: "https://codyza.com/login" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
