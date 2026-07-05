"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ArrowDown } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { TerminalAnimation } from "@/components/effects/terminal-animation"
import { AboutSection } from "@/components/landing/about-section"
import { CurrentlyShippingSection } from "@/components/landing/currently-shipping-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { Footer } from "@/components/landing/footer"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function HomePage() {
  const router = useRouter()

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
    <main className="page-cosmic min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative">
        <div className="absolute inset-0 grid-overlay pointer-events-none" aria-hidden />

        <div className="section-shell relative flex min-h-[92vh] flex-col justify-center pt-28 pb-16 md:pt-32 md:pb-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            {/* Copy */}
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="section-label section-label--accent mb-8 lg:mb-10"
              >
                <span className="status-dot" aria-hidden />
                Now Onboarding Founding Contributors
              </motion.div>

              <motion.h1
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="text-display text-white"
              >
                Building alone
                <br />
                <span className="text-gradient-soft">gets lonely.</span>
              </motion.h1>

              <motion.p
                {...fadeUp}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="text-subhead mx-auto mt-8 max-w-xl lg:mx-0 lg:mb-0"
              >
                Codyza is a community of devs, designers, and dreamers shipping real
                projects together. Not a bootcamp. Not another chat server. Free to join,
                built to last.
              </motion.p>
            </div>

            {/* Terminal showcase */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-xl lg:max-w-none"
            >
              <div className="surface-elevated overflow-hidden p-1">
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-white/30">
                    codyza — terminal
                  </span>
                </div>
                <div className="p-4 md:p-5">
                  <TerminalAnimation />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 flex justify-center lg:mt-24"
            aria-hidden
          >
            <div className="flex flex-col items-center gap-2 text-white/25">
              <span className="text-eyebrow">Scroll</span>
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      <AboutSection />
      <CurrentlyShippingSection />
      <ProjectsSection />

      {/* ── JOIN CTA ── */}
      <section id="apply" className="section-divider section-padding scroll-mt-32">
        <div className="section-shell">
          <div className="relative mx-auto max-w-3xl text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-24 h-64"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(139,124,246,0.07) 0%, transparent 70%)",
              }}
            />

            <div className="section-label section-label--accent mb-8">
              <span className="status-dot" aria-hidden />
              Now onboarding
            </div>

            <h2 className="text-headline text-white">
              Ready to join{" "}
              <span className="text-gradient-soft">the crew?</span>
            </h2>

            <p className="text-subhead mx-auto mt-6 max-w-md">
              Applications take ~3 minutes. We review every one within 48 hours.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="btn-primary group px-8 py-4 text-sm"
              >
                Apply to join
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/projects"
                className="btn-ghost px-8 py-4 text-sm"
              >
                See what we&apos;re building →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
