"use client"

import Link from "next/link"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { FadeIn } from "@/components/motion/fade-in"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <FadeIn className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-[clamp(2.5rem,6vw,4rem)] font-bold lowercase leading-none tracking-tight">
              build together
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community of devs shipping real projects — not a bootcamp, not another chat server.
            </p>
          </div>
          <div className="flex flex-col gap-6 md:items-end">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/#about" className="text-muted-foreground hover:text-foreground">About</Link>
              <Link href="/apply" className="text-muted-foreground hover:text-foreground">Apply</Link>
              <Link href="/projects" className="text-muted-foreground hover:text-foreground">Projects</Link>
              <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground">Leaderboard</Link>
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">GitHub</a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              © {new Date().getFullYear()} {SITE_CONFIG.name}
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}
