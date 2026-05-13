"use client"

import { motion } from "framer-motion"
import { Sparkles, Code2, Rocket, GitBranch, Users, Award, Zap } from "lucide-react"
import { TerminalAnimation } from "@/components/effects/terminal-animation"

const VALUE_PROPS = [
  { icon: GitBranch, color: "#8b5cf6", title: "Real Codebases", desc: "Contribute to production repos, not toy projects" },
  { icon: Users,     color: "#3b82f6", title: "Startup Teams",  desc: "Work alongside builders, mentors, and reviewers" },
  { icon: Zap,       color: "#06b6d4", title: "Ship Velocity",  desc: "Standups, sprints, real PR reviews" },
  { icon: Award,     color: "#22c55e", title: "Public Profile", desc: "Earn XP, badges, and a portfolio of shipped work" },
]

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-32 border-t border-white/[0.04] bg-[#050508] py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-[#8b5cf6]" />
            What Is Codyza
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            A startup-style team where
            <br />
            <span className="text-gradient-codyza">developers actually ship.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center space-y-6"
          >
            <p className="text-lg leading-relaxed text-zinc-300">
              Most developer communities are <span className="text-white">just chat</span>. Codyza is different &mdash; a working ecosystem where contributors join real teams, build real products, and ship to real users.
            </p>
            <p className="text-base leading-relaxed text-zinc-400">
              No tutorials. No coursework. Just production code, code reviews, and the experience of shipping inside a startup-style team. You walk away with a portfolio of SaaS and AI tools that actually exist on the internet.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#8b5cf6]/20 bg-[#8b5cf6]/10">
                  <Code2 className="h-3.5 w-3.5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="font-medium text-white">Real production code</div>
                  <div className="text-sm text-zinc-500">Ship to live users from day one</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#3b82f6]/20 bg-[#3b82f6]/10">
                  <Rocket className="h-3.5 w-3.5 text-[#3b82f6]" />
                </div>
                <div>
                  <div className="font-medium text-white">Startup-style velocity</div>
                  <div className="text-sm text-zinc-500">Standups, sprints, and PR reviews</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#22c55e]/20 bg-[#22c55e]/10">
                  <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="font-medium text-white">Gamified growth</div>
                  <div className="text-sm text-zinc-500">XP, badges, public profile, certificates</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <TerminalAnimation />
          </motion.div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-4 border-t border-white/[0.04] pt-16 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.04]"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: prop.color + "1a", border: "1px solid " + prop.color + "33" }}
              >
                <prop.icon className="h-5 w-5" style={{ color: prop.color }} />
              </div>
              <div className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                {prop.title}
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                {prop.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
