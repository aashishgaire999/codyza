"use client"

import { useEffect, useState } from "react"
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
import { FloatingCode } from "@/components/effects/floating-code"
import { GalaxyBackground } from "@/components/effects/galaxy-background"
import { SITE_CONFIG } from "@/constants/site"

export default function HomePage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
    <main className="relative min-h-screen overflow-hidden bg-background">
      <GalaxyBackground scrollY={scrollY} />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay" aria-hidden />
        <FloatingCode />

        <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
            style={{
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            <span className="font-mono uppercase tracking-widest text-zinc-400">Now Onboarding Founding Contributors</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mb-6 max-w-5xl font-[family-name:var(--font-heading)]"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Building alone
            <br />
            <span className="text-gradient-aurora">gets lonely.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mb-14 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Codyza is a community of devs, designers, and dreamers shipping real projects together. Not a bootcamp. Not another chat server. Free to join, built to last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
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
      <section
        id="apply"
        className="relative scroll-mt-32 py-36"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-8">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest"
            style={{
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.15)",
              backdropFilter: "blur(8px)",
              color: "#a78bfa",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Now onboarding
          </div>

          <h2
            className="font-[family-name:var(--font-heading)] font-bold tracking-tight text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            Ready to join{" "}
            <span className="text-gradient-aurora">the crew?</span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-md text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Applications take ~3 minutes. We review every one within 48 hours.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/apply"
              className="btn-primary group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
            >
              Apply to join
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/projects"
              className="btn-ghost inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-medium"
            >
              See what we&apos;re building →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
