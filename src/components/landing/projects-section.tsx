"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ExternalLink, GitBranch as Github, Users as UsersIcon, X, Code2 } from "lucide-react"

const PROJECTS = [
  { name: "Linkly", tag: "SaaS", color: "#8b5cf6", desc: "Short-link analytics platform with team workspaces and click-level insights.", longDesc: "Linkly is a full-stack SaaS product built by a 6-person Codyza team. Features custom short URLs, click analytics dashboards, team workspaces, and API access. Built in 6 weeks from idea to production.", stack: ["Next.js", "Supabase", "Tailwind", "Postgres", "Vercel"], contributors: 6, status: "live", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
  { name: "Mira AI", tag: "AI Tool", color: "#3b82f6", desc: "Open-source coding agent that opens PRs from natural language prompts.", longDesc: "Mira AI connects to your GitHub repos and opens pull requests from plain English. Powered by Claude API with a TypeScript backend and GitHub Actions integration.", stack: ["Claude API", "TypeScript", "GitHub API", "Node.js"], contributors: 9, status: "live", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
  { name: "Studyloop", tag: "EdTech", color: "#06b6d4", desc: "Spaced-repetition flashcard system for serious learners. Mobile-first.", longDesc: "Studyloop uses the SM-2 spaced repetition algorithm to help learners retain information. Mobile-first with offline support, streak tracking, and a shared deck marketplace.", stack: ["React Native", "Supabase", "Expo", "TypeScript"], contributors: 4, status: "beta", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
  { name: "Pulsegrid", tag: "DevOps", color: "#22c55e", desc: "Visual dashboard for monitoring uptime across small SaaS deployments.", longDesc: "Pulsegrid gives indie hackers beautiful uptime dashboards with real-time alerts, incident history, and public status pages. Deployed on Cloudflare Workers for global latency.", stack: ["Next.js", "Cloudflare", "D3", "WebSockets"], contributors: 5, status: "live", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
  { name: "Vaulta", tag: "Security", color: "#8b5cf6", desc: "End-to-end encrypted notes for engineering teams. Self-hostable.", longDesc: "Vaulta provides zero-knowledge encrypted notes and secrets storage for engineering teams. All encryption happens client-side using WebAssembly. Fully self-hostable with Docker.", stack: ["Rust", "WASM", "React", "Docker"], contributors: 7, status: "beta", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
  { name: "Routenext", tag: "Travel", color: "#3b82f6", desc: "Multi-city trip planner with real-time price comparison across carriers.", longDesc: "Routenext aggregates flight and train prices across carriers to help travelers plan multi-city trips with budget optimization. Integrated with Stripe for booking flows.", stack: ["Next.js", "Postgres", "Stripe", "Redis"], contributors: 8, status: "live", github: "https://github.com/aashishgaire999/codyza", preview: "https://codyza.vercel.app" },
]

type Project = typeof PROJECTS[0]

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent" />
        <div className="relative p-6 md:p-8">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Code2 className="h-5 w-5" style={{ color: project.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest" style={{ background: project.color + "1a", color: project.color, border: "1px solid " + project.color + "33" }}>{project.tag}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.status === "live" ? "#22c55e" : "#f59e0b" }} />
                  {project.status}
                </span>
              </div>
              <h3 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-white">{project.name}</h3>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-zinc-300">{project.longDesc}</p>
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono text-zinc-300">{tech}</span>
              ))}
            </div>
          </div>
          <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
            <UsersIcon className="h-4 w-4" />
            <span>{project.contributors} contributors on this project</span>
          </div>
          <div className="flex gap-3">
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.07]">
              <Github className="h-4 w-4" />
              View Repository
            </a>
            <a href={project.preview} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg, ${project.color}, #3b82f6)` }}>
              <ExternalLink className="h-4 w-4" />
              Live Preview
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function ProjectsSection() {
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <section id="projects" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#22c55e]" />
            Shipped By Contributors
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            Real products,<br />
            <span className="text-gradient-codyza">built by real teams.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">Click any project to see full details, tech stack, and team.</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              onClick={() => setSelected(p)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
            >
              <div aria-hidden className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(400px circle at 50% 0%, ${p.color}22, transparent 60%)` }} />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest" style={{ background: p.color + "1a", color: p.color, border: "1px solid " + p.color + "33" }}>{p.tag}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.status === "live" ? "#22c55e" : "#f59e0b" }} />
                    {p.status}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">{tech}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <UsersIcon className="h-3.5 w-3.5" />
                    {p.contributors} contributors
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 transition-colors group-hover:text-zinc-400">View details →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
