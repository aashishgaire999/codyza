"use client"

import { motion } from "framer-motion"
import { ArrowRight, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { AboutSection } from "@/components/landing/about-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ApplySection } from "@/components/landing/apply-section"
import { Footer } from "@/components/landing/footer"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { GlowOrb } from "@/components/effects/glow-orb"
import { SITE_CONFIG } from "@/constants/site"

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508]">
      <Navbar />
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 grid-overlay" aria-hidden />
        <GlowOrb color="purple" size={700} className="-top-40 -left-40" duration={14} />
        <GlowOrb color="blue" size={600} className="top-1/3 -right-32" duration={16} />
        <GlowOrb color="cyan" size={500} className="bottom-0 left-1/3" duration={12} />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
          <motion.div initial={{ opacity: 0, y: -30, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-10">
            <CodyzaLogo size={120} priority />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            <span className="font-mono uppercase tracking-widest text-zinc-400">Now Onboarding Founding Contributors</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mb-6 max-w-5xl font-[family-name:var(--font-heading)] text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Build The Future<br />
            With <span className="text-gradient-codyza">Codyza</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-10 max-w-2xl text-base text-zinc-400 md:text-lg">
            {SITE_CONFIG.tagline} A developer ecosystem where you ship real products, earn recognition, and grow inside a startup-style team.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex flex-col gap-4 sm:flex-row">
            <a href="#apply">
              <Button size="lg" className="group h-12 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-8 text-base font-medium text-white hover:opacity-90">
                Apply To Join
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#projects">
              <Button size="lg" variant="outline" className="h-12 border-white/10 bg-white/[0.02] px-8 text-base font-medium backdrop-blur-md hover:bg-white/[0.05]">
                <Code2 className="mr-2 h-4 w-4" />
                View Projects
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
      <AboutSection />
      <FeaturesSection />
      <ProjectsSection />
      <HowItWorksSection />
      <ApplySection />
      <Footer />
    </main>
  )
}
