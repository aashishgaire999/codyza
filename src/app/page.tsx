"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { TerminalAnimation } from "@/components/effects/terminal-animation"
import { AboutSection } from "@/components/landing/about-section"
import { CurrentlyShippingSection } from "@/components/landing/currently-shipping-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { Footer } from "@/components/landing/footer"
import { GlowOrb } from "@/components/effects/glow-orb"
import { SITE_CONFIG } from "@/constants/site"

export default function HomePage() {
  const router = useRouter()

  // Auto-redirect to /set-password if Supabase magic link landed here with auth tokens in the hash
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (
      hash &&
      hash.includes("access_token=") &&
      (hash.includes("type=invite") || hash.includes("type=recovery"))
    ) {
      router.replace(`/set-password${hash}`)
    }
  }, [router])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508]">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay" aria-hidden />
        <GlowOrb color="purple" size={700} className="-top-40 -left-40" duration={14} />
        <GlowOrb color="blue" size={600} className="top-1/3 -right-32" duration={16} />
        <GlowOrb color="cyan" size={500} className="bottom-0 left-1/3" duration={12} />
        <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            <span className="font-mono uppercase tracking-widest text-zinc-400">Now Onboarding Founding Contributors</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="mb-6 max-w-5xl font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Building alone
            <br />
            <span className="text-gradient-codyza">gets lonely.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="mb-10 max-w-2xl text-base text-zinc-400 md:text-lg">
            Codyza is a community of devs, designers, and dreamers shipping real projects together. Not a bootcamp. Not another chat server. Free to join, built to last.
          </motion.p>

          {/* SIGNATURE: Live shipping terminal */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="w-full max-w-2xl"
          >
            <TerminalAnimation />
          </motion.div>
        </div>
      </section>
      <AboutSection />
      <CurrentlyShippingSection />
      <ProjectsSection />
      {/* JOIN CTA */}
      <section id="apply" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Now onboarding
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
            Ready to join <span className="text-gradient-codyza">the crew?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Applications take ~3 minutes. We review every one within 48 hours.
          </p>
          <Link
            href="/apply"
            className="group mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Apply to join
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
