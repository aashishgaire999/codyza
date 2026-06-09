"use client"

import { motion } from "framer-motion"
import { Sparkles, FileText, Mail, Users, Code2, TrendingUp, Rocket, Award, GraduationCap } from "lucide-react"

const STEPS = [
  { icon: FileText, title: "Apply", desc: "Submit a short application with your skills and interests." },
  { icon: Mail, title: "Get Invited", desc: "Cohort lead reviews and sends an invite within 48 hours." },
  { icon: Users, title: "Join A Team", desc: "Get matched to a project team aligned with your goals." },
  { icon: Code2, title: "Build & Ship", desc: "Write production code, review PRs, ship to live users." },
  { icon: TrendingUp, title: "Earn XP", desc: "Every contribution earns XP. Level up your contributor rank." },
  { icon: Rocket, title: "Deploy Products", desc: "Push to Vercel, Cloudflare. Your work goes live on the internet." },
  { icon: Award, title: "Get Recognition", desc: "Public profile, badges, leaderboard placement, references." },
  { icon: GraduationCap, title: "Graduate", desc: "Walk away with a real portfolio, network, and shipped products." },
]

export function HowItWorksSection() {
  return (
    <section id="how" className="relative scroll-mt-32 border-t border-white/[0.04] bg-background py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.35 }} className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#3b82f6]" />
            How It Works
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            From application<br />
            <span className="text-gradient-codyza">to shipped product.</span>
          </h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-7 top-0 h-full w-px bg-gradient-to-b from-[#8b5cf6]/30 via-[#06b6d4]/20 to-transparent md:left-1/2 md:-translate-x-1/2" aria-hidden />
          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.3 }} className={`relative flex items-start gap-6 md:items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="absolute left-7 z-10 -translate-x-1/2 md:left-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a12] shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <step.icon className="h-5 w-5 text-[#8b5cf6]" />
                  </div>
                </div>
                <div className={`ml-20 flex-1 md:ml-0 ${i % 2 === 0 ? "md:pr-24 md:text-right" : "md:pl-24"}`}>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Step {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                </div>
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
