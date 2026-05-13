"use client"

import { motion } from "framer-motion"
import { Sparkles, ExternalLink, GitBranch as Github, Users as UsersIcon } from "lucide-react"

const PROJECTS = [
  {
    name: "Linkly",
    tag: "SaaS",
    color: "#8b5cf6",
    desc: "Short-link analytics platform with team workspaces and click-level insights.",
    stack: ["Next.js", "Supabase", "Tailwind"],
    contributors: 6,
    status: "live",
  },
  {
    name: "Mira AI",
    tag: "AI Tool",
    color: "#3b82f6",
    desc: "Open-source coding agent that opens PRs from natural language prompts.",
    stack: ["Claude API", "TypeScript", "GitHub API"],
    contributors: 9,
    status: "live",
  },
  {
    name: "Studyloop",
    tag: "EdTech",
    color: "#06b6d4",
    desc: "Spaced-repetition flashcard system for serious learners. Mobile-first.",
    stack: ["React Native", "Supabase", "Expo"],
    contributors: 4,
    status: "beta",
  },
  {
    name: "Pulsegrid",
    tag: "DevOps",
    color: "#22c55e",
    desc: "Visual dashboard for monitoring uptime across small SaaS deployments.",
    stack: ["Next.js", "Cloudflare", "D3"],
    contributors: 5,
    status: "live",
  },
  {
    name: "Vaulta",
    tag: "Security",
    color: "#8b5cf6",
    desc: "End-to-end encrypted notes for engineering teams. Self-hostable.",
    stack: ["Rust", "WASM", "React"],
    contributors: 7,
    status: "beta",
  },
  {
    name: "Routenext",
    tag: "Travel",
    color: "#3b82f6",
    desc: "Multi-city trip planner with real-time price comparison across carriers.",
    stack: ["Next.js", "Postgres", "Stripe"],
    contributors: 8,
    status: "live",
  },
]

export function ProjectsSection() {
  return (
    <section id="projects" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#22c55e]" />
            Shipped By Contributors
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            Real products,
            <br />
            <span className="text-gradient-codyza">built by real teams.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(400px circle at 50% 0%, ${p.color}22, transparent 60%)` }}
              />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
                    style={{ background: p.color + "1a", color: p.color, border: "1px solid " + p.color + "33" }}
                  >
                    {p.tag}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: p.status === "live" ? "#22c55e" : "#f59e0b" }}
                    />
                    {p.status}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.stack.map((tech) => (
                    <span key={tech} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <UsersIcon className="h-3.5 w-3.5" />
                    {p.contributors} contributors
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                      <Github className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
