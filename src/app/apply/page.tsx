"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { ApplySection } from "@/components/landing/apply-section"
import { SmartNavbar } from "@/components/shared/smart-navbar"
import { SITE_CONFIG } from "@/constants/site"

export default function ApplyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508]">
      <SmartNavbar />

      {/* AMBIENT GLOW ORBS — dim, brand-tying */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
        }}
      />

      {/* TOP BAR — logo + terminal flourish + back link */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <CodyzaLogo size={32} withGlow={false} />
          <span className="text-base font-bold tracking-tight text-white">
            Codyza
          </span>
          <span className="ml-1 hidden font-mono text-xs text-zinc-600 sm:inline">
            ~ apply
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </header>

      {/* APPLY FORM (existing component, reused) */}
      <div className="relative z-10 pb-16">
        <ApplySection />
      </div>

      {/* STATUS STRIP — concrete commitments */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-black/40 px-6 py-3 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              </span>
              Next standup &middot; {SITE_CONFIG.standupDay} {SITE_CONFIG.standupTime}
            </span>
            <span className="text-zinc-700">|</span>
            <span>Review cycle &middot; {SITE_CONFIG.reviewCycle}</span>
          </div>
          <span className="text-zinc-700">codyza.com</span>
        </div>
      </footer>
    </main>
  )
}
