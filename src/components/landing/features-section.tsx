"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Brain, Rocket, Users, GitBranch, Star, Layers, Award, Trophy, Calendar, Bot, Building2, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Code2, color: "#8b5cf6", title: "Real Projects",
    desc: "Ship code to live users. No tutorials, no throwaway demos.",
    detail: "Work on production codebases with real users, real bugs, and real deadlines. Every PR you merge ships to the internet.",
    stat: "6 active projects",
  },
  {
    icon: Brain, color: "#3b82f6", title: "AI Systems",
    desc: "Build with Claude, OpenAI, and modern vector pipelines.",
    detail: "Get hands-on experience integrating LLMs, building RAG pipelines, and deploying AI features inside real products.",
    stat: "Claude + OpenAI APIs",
  },
  {
    icon: Rocket, color: "#06b6d4", title: "SaaS Deployment",
    desc: "Deploy to Vercel, Cloudflare. Real production environments.",
    detail: "Learn CI/CD, environment variables, edge functions, and production monitoring — the full deployment lifecycle.",
    stat: "Vercel + Cloudflare",
  },
  {
    icon: Users, color: "#22c55e", title: "Team Collaboration",
    desc: "Standups, sprints, code reviews. Startup-style teamwork.",
    detail: "Daily async standups, weekly sprint planning, and structured code reviews — just like a real engineering team.",
    stat: "4–10 per team",
  },
  {
    icon: GitBranch, color: "#8b5cf6", title: "GitHub Integration",
    desc: "Every commit, PR, and review tracked to your profile.",
    detail: "Your GitHub becomes your verified portfolio. Every contribution is public, permanent, and timestamped.",
    stat: "100% public record",
  },
  {
    icon: Star, color: "#3b82f6", title: "Contributor Recognition",
    desc: "Your impact made public. Visible, verifiable, permanent.",
    detail: "Get a public Codyza profile with your shipped products, XP rank, badges, and contribution history.",
    stat: "Public profile page",
  },
  {
    icon: Layers, color: "#06b6d4", title: "XP System",
    desc: "Earn XP from PRs, deploys, mentoring. Climb the ranks.",
    detail: "XP earned from code reviews, merged PRs, deployments, and mentoring. Ranks from Newcomer to Core Architect.",
    stat: "8 contributor ranks",
  },
  {
    icon: Award, color: "#22c55e", title: "Developer Certificates",
    desc: "Verifiable certificates for shipped products and milestones.",
    detail: "Certificates tied to real GitHub commits — not just completion. Share on LinkedIn with a verification link.",
    stat: "LinkedIn-shareable",
  },
  {
    icon: Trophy, color: "#8b5cf6", title: "Leaderboards",
    desc: "See where you stand. Compete with the global cohort.",
    detail: "Weekly and all-time leaderboards by XP, PRs merged, and products shipped. Top contributors get featured.",
    stat: "Weekly resets",
  },
  {
    icon: Calendar, color: "#3b82f6", title: "Hackathons",
    desc: "Weekend builds with prizes, mentors, and shipped apps.",
    detail: "48-hour weekend sprints with a theme, mentors on call, and prizes. Every hackathon ships a real product.",
    stat: "Monthly events",
  },
  {
    icon: Bot, color: "#06b6d4", title: "AI Mentors",
    desc: "On-demand AI code review, debugging, and pair programming.",
    detail: "AI-powered code review trained on best practices. Get instant feedback on your PRs, architecture, and debugging.",
    stat: "24/7 available",
  },
  {
    icon: Building2, color: "#22c55e", title: "Startup Incubator",
    desc: "Pitch ideas. Top projects spin out as funded startups.",
    detail: "The best Codyza projects get incubated — legal setup, co-founder matching, intro to investors, and seed funding.",
    stat: "Equity + funding",
  },
]

export function FeaturesSection() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="features" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#8b5cf6]" />
            The Platform
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            Everything contributors need
            <br />
            <span className="text-gradient-codyza">to ship and grow.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">A complete ecosystem of tools, systems, and recognition built around how modern developers actually work.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
            >
              <div aria-hidden className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(300px circle at 50% 0%, ${f.color}18, transparent 60%)` }} />

              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.06]" style={{ background: f.color + "15" }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>

                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 8, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="text-xs leading-relaxed text-zinc-300">{f.detail}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest" style={{ background: f.color + "15", color: f.color, border: "1px solid " + f.color + "30" }}>
                          <span className="h-1 w-1 rounded-full" style={{ background: f.color }} />
                          {f.stat}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
