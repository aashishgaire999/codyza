"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  Code2,
  Brain,
  Rocket,
  Users,
  GitBranch as GitHubIcon,
  Award,
  Trophy,
  Calendar,
  Bot,
  Building2,
  Star,
  Layers,
} from "lucide-react"

const FEATURES = [
  { icon: Code2,      color: "#8b5cf6", title: "Real Projects",         desc: "Ship code to live users. No tutorials, no throwaway demos." },
  { icon: Brain,      color: "#3b82f6", title: "AI Systems",            desc: "Build with Claude, OpenAI, and modern vector pipelines." },
  { icon: Rocket,     color: "#06b6d4", title: "SaaS Deployment",       desc: "Deploy to Vercel, Cloudflare. Real production environments." },
  { icon: Users,      color: "#22c55e", title: "Team Collaboration",    desc: "Standups, sprints, code reviews. Startup-style teamwork." },
  { icon: GitHubIcon,     color: "#8b5cf6", title: "GitHub Integration",    desc: "Every commit, PR, and review tracked to your profile." },
  { icon: Star,       color: "#3b82f6", title: "Contributor Recognition", desc: "Your impact made public. Visible, verifiable, permanent." },
  { icon: Layers,     color: "#06b6d4", title: "XP System",             desc: "Earn XP from PRs, deploys, mentoring. Climb the ranks." },
  { icon: Award,      color: "#22c55e", title: "Developer Certificates", desc: "Verifiable certificates for shipped products and milestones." },
  { icon: Trophy,     color: "#8b5cf6", title: "Leaderboards",          desc: "See where you stand. Compete with the global cohort." },
  { icon: Calendar,   color: "#3b82f6", title: "Hackathons",            desc: "Weekend builds with prizes, mentors, and shipped apps." },
  { icon: Bot,        color: "#06b6d4", title: "AI Mentors",            desc: "On-demand AI code review, debugging, and pair programming." },
  { icon: Building2,  color: "#22c55e", title: "Startup Incubator",     desc: "Pitch ideas. Top projects spin out as funded startups." },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#06b6d4]" />
            The Platform
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            Everything contributors need
            <br />
            <span className="text-gradient-codyza">to ship and grow.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400">
            A complete ecosystem of tools, systems, and recognition built around how modern developers actually work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.05 }}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(400px circle at 50% 0%, ${feature.color}22, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: feature.color + "1a",
                    border: "1px solid " + feature.color + "33",
                  }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
