"use client"

import Link from "next/link"
import { ApplySection } from "@/components/landing/apply-section"
import { SmartNavbar } from "@/components/shared/smart-navbar"
import { ParticleField } from "@/components/effects/particle-field"
import { GlowOrb } from "@/components/effects/glow-orb"

export default function ApplyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" className="bg-background">
      <SmartNavbar />
      <ParticleField />
      <GlowOrb color="purple" size={700} className="-top-40 -left-20" duration={18} />
      <GlowOrb color="blue" size={500} className="bottom-0 -right-20" duration={20} />

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



      {/* APPLY FORM (existing component, reused) */}
      <div className="relative z-10 pb-16">
        <ApplySection />
      </div>

      <footer className="relative z-10 border-t border-white/[0.05] bg-transparent px-6 py-3 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            </span>
            Applications reviewed within 48 hours
          </div>
          <span className="text-zinc-700">codyza.com</span>
        </div>
      </footer>
    </main>
  )
}
