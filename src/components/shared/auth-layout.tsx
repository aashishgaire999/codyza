"use client"

import Link from "next/link"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { SiteShell } from "@/components/shared/site-shell"
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
    <SiteShell className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <FadeIn className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <CodyzaLogo size={48} withGlow={false} />
            </Link>
            <h1 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-bold lowercase tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="surface-card p-8">{children}</div>
          <Link href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
            ← back to codyza
          </Link>
        </FadeIn>
      </div>
    </SiteShell>
  )
}
