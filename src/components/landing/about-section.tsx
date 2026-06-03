"use client"

import { motion } from "framer-motion"
import { Sparkles, Code2, Rocket } from "lucide-react"
import { TerminalAnimation } from "@/components/effects/terminal-animation"


export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-32 border-t border-white/[0.04] bg-transparent py-20">
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
            What Is Codyza
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
            You don&rsquo;t need another course.
            <br />
            You need a <span className="text-gradient-codyza">crew.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col justify-center space-y-6"
          >
            <p className="text-lg leading-relaxed text-zinc-300">
              Tutorials end. Courses finish. Bootcamps cost money. And after all of it, you&rsquo;re often still on your own &mdash; wondering if anyone will ever see what you build.
            </p>
            <p className="text-base leading-relaxed text-zinc-400">
              Codyza is the crew that gathers around your first real project. We do standups together. We review code together. We deploy together. Free to join, and a place worth staying.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#8b5cf6]/20 bg-[#8b5cf6]/10">
                  <Code2 className="h-3.5 w-3.5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="font-medium text-white">Real projects</div>
                  <div className="text-sm text-zinc-500">Things people actually use, not tutorial clones</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#3b82f6]/20 bg-[#3b82f6]/10">
                  <Rocket className="h-3.5 w-3.5 text-[#3b82f6]" />
                </div>
                <div>
                  <div className="font-medium text-white">Real teammates</div>
                  <div className="text-sm text-zinc-500">Devs, designers, students from everywhere</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-[#22c55e]/20 bg-[#22c55e]/10">
                  <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="font-medium text-white">Real momentum</div>
                  <div className="text-sm text-zinc-500">Standups, reviews, deploys &mdash; the rhythm of shipping</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            {/* CODYZA ID CARD */}
            <div className="id-card-glow w-full max-w-sm">
              <div className="id-card-inner">
                {/* Top: logo + status */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                    />
                    <span className="text-xs font-semibold text-white">Codyza</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Active</span>
                  </div>
                </div>

                {/* Middle: ID */}
                <div className="relative my-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    Contributor ID
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold tracking-wider text-white">
                    CZX-<span className="text-gradient-codyza">0042</span>
                  </div>
                </div>

                {/* Bottom: details grid */}
                <div className="relative grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Name</div>
                    <div className="mt-0.5 text-sm font-medium text-zinc-200">Sample Member</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Rank</div>
                    <div className="mt-0.5 text-sm font-medium text-zinc-200">Software Engineer</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">XP</div>
                    <div className="mt-0.5 text-sm font-medium text-zinc-200">2,140 / 3,500</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Joined</div>
                    <div className="mt-0.5 text-sm font-medium text-zinc-200">Mar 2026</div>
                  </div>
                </div>

                {/* Ambient corner glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

      </div>
      <style jsx>{`
        .id-card-glow {
          position: relative;
          border-radius: 18px;
          padding: 1.5px;
          overflow: hidden;
          isolation: isolate;
        }
        .id-card-glow::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            #8b5cf6,
            #3b82f6,
            #06b6d4,
            #22c55e,
            #8b5cf6
          );
          transform: translate(-50%, -50%) rotate(0deg);
          animation: spin-id-card 8s linear infinite;
          z-index: -1;
        }
        .id-card-inner {
          position: relative;
          border-radius: 16.5px;
          background: linear-gradient(135deg, #0a0a14 0%, #050508 100%);
          padding: 24px;
          overflow: hidden;
          z-index: 1;
        }
        @keyframes spin-id-card {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </section>
  )
}
