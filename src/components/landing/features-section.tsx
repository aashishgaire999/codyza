"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code2,
  Brain,
  Rocket,
  Users,
  GitBranch,
  Star,
  Layers,
  Award,
  Trophy,
  Calendar,
  Bot,
  Building2,
  Sparkles,
} from "lucide-react"

const FEATURES = [
  {
    icon: Code2,
    color: "#8b5cf6",
    title: "Real Projects",
    desc: "Ship code to live users. No tutorials, no throwaway demos.",
    detail:
      "Work on production codebases with real users, real bugs, and real deadlines. Every PR you merge ships to the internet.",
    stat: "6 active projects",
  },
  {
    icon: Brain,
    color: "#3b82f6",
    title: "AI Systems",
    desc: "Build with Claude, OpenAI, and modern AI workflows.",
    detail:
      "Get hands-on experience integrating LLMs, AI APIs, automation systems, and production-ready AI features.",
    stat: "Claude + OpenAI APIs",
  },
  {
    icon: Rocket,
    color: "#06b6d4",
    title: "SaaS Deployment",
    desc: "Deploy to Vercel and modern production environments.",
    detail:
      "Learn GitHub workflows, CI/CD, domains, hosting, environment variables, and real deployment systems.",
    stat: "Vercel + Production",
  },
  {
    icon: Users,
    color: "#22c55e",
    title: "Team Collaboration",
    desc: "Startup-style teamwork and real contributor systems.",
    detail:
      "Work with developers, designers, and contributors using real collaboration workflows and code reviews.",
    stat: "Global contributors",
  },
  {
    icon: GitBranch,
    color: "#8b5cf6",
    title: "GitHub Integration",
    desc: "Every commit and project tied to your public profile.",
    detail:
      "Build a verified technical portfolio using GitHub repositories, pull requests, deployments, and contributions.",
    stat: "Public contribution history",
  },
  {
    icon: Star,
    color: "#3b82f6",
    title: "Contributor Recognition",
    desc: "Your impact becomes visible and publicly recognized.",
    detail:
      "Get featured through leaderboards, contributor credits, project showcases, and community recognition.",
    stat: "Leaderboard system",
  },
  {
    icon: Layers,
    color: "#06b6d4",
    title: "XP & Ranking System",
    desc: "Earn recognition through deployments and contributions.",
    detail:
      "Gain XP from shipped projects, deployments, teamwork, and technical contribution milestones.",
    stat: "Contributor rankings",
  },
  {
    icon: Award,
    color: "#22c55e",
    title: "Developer Certificates",
    desc: "Certificates based on real contributions and deployments.",
    detail:
      "Receive contributor certificates tied to actual work, deployments, and public GitHub activity.",
    stat: "Certificate eligible",
  },
  {
    icon: Trophy,
    color: "#8b5cf6",
    title: "Leaderboards",
    desc: "Compete and grow alongside the Codyza community.",
    detail:
      "Track active contributors, deployments, and shipped projects through public leaderboard systems.",
    stat: "Monthly rankings",
  },
  {
    icon: Calendar,
    color: "#3b82f6",
    title: "Hackathons & Events",
    desc: "Build projects through community challenges and events.",
    detail:
      "Participate in collaborative build sessions, coding events, and deployment-focused technical activities.",
    stat: "Community events",
  },
  {
    icon: Bot,
    color: "#06b6d4",
    title: "AI Mentors",
    desc: "Get support with debugging and development workflows.",
    detail:
      "Use AI-powered assistance for coding, debugging, project structuring, and learning modern tools.",
    stat: "24/7 support",
  },
  {
    icon: Building2,
    color: "#22c55e",
    title: "Real Deployment Experience",
    desc: "Deploy real websites and applications under Codyza.",
    detail:
      "Contributors gain hands-on deployment experience using GitHub, Vercel, domains, production environments, and real collaboration workflows.",
    stat: "Production-ready workflow",
  },
]

export function FeaturesSection() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section
      id="features"
      className="relative scroll-mt-32 border-t border-white/[0.04] bg-background py-32"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#8b5cf6]" />
            The Platform
          </div>

          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-black tracking-tight text-white md:text-6xl">
            Build real products.
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Gain real experience.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            Codyza is a modern contributor ecosystem where developers
            collaborate, build production-ready applications, deploy
            real-world projects, and grow through practical technical
            experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: (i % 3) * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(300px circle at 50% 0%, ${f.color}18, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.06]"
                  style={{ background: f.color + "15" }}
                >
                  <f.icon
                    className="h-5 w-5"
                    style={{ color: f.color }}
                  />
                </div>

                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                  {f.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {f.desc}
                </p>

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
                        <p className="text-xs leading-relaxed text-zinc-300">
                          {f.detail}
                        </p>

                        <div
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest"
                          style={{
                            background: f.color + "15",
                            color: f.color,
                            border: "1px solid " + f.color + "30",
                          }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ background: f.color }}
                          />

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