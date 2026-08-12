"use client"

import Link from "next/link"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { PublicShell } from "@/components/shared/public-shell"
import { FadeIn } from "@/components/motion/fade-in"

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <PublicShell footer={false}>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-24">
        <FadeIn className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <CodyzaLogo size={48} variant="full" />
            </Link>
            <h1 className="sofi-display-section mt-6 text-black">{title}</h1>
            {subtitle && <p className="sofi-body mt-3 text-black/55">{subtitle}</p>}
          </div>
          <div className="auth-journal-card">{children}</div>
          <Link href="/" className="sofi-body mt-6 flex min-h-11 items-center justify-center text-center text-black/45 hover:text-black">
            back home
          </Link>
        </FadeIn>
      </div>
    </PublicShell>
  )
}
