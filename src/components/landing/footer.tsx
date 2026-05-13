"use client"

import { motion } from "framer-motion"
import { GitBranch as Github, Send as Twitter, MessageCircle } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#050508] py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <CodyzaLogo size={40} withGlow={false} />
              <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">{SITE_CONFIG.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-zinc-400">{SITE_CONFIG.description}</p>
            <div className="mt-6 flex items-center gap-3">
              <a href={SOCIAL_LINKS.github} className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"><Github className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.twitter} className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"><Twitter className="h-4 w-4" /></a>
              <a href={SOCIAL_LINKS.discord} className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><a href="#about" className="transition-colors hover:text-white">About</a></li>
              <li><a href="#features" className="transition-colors hover:text-white">Features</a></li>
              <li><a href="#projects" className="transition-colors hover:text-white">Projects</a></li>
              <li><a href="#how" className="transition-colors hover:text-white">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Join</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><a href="#apply" className="transition-colors hover:text-white">Apply</a></li>
              <li><a href={SOCIAL_LINKS.discord} className="transition-colors hover:text-white">Discord</a></li>
              <li><a href={SOCIAL_LINKS.github} className="transition-colors hover:text-white">GitHub</a></li>
              <li><a href={`mailto:${SITE_CONFIG.email}`} className="transition-colors hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            <span className="font-mono uppercase tracking-widest">All systems operational</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            Code. Create. Impact. &mdash; &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
