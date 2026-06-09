"use client"

import { motion } from "framer-motion"
import { Sparkles, Code2, Rocket } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-32 py-32 md:py-40" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            <Sparkles className="h-3 w-3 text-[#7c3aed]" />
            What Is Codyza
          </div>
          <h2
            className="font-[family-name:var(--font-heading)] font-bold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em", lineHeight: 1.1 }}
          >
            You don&rsquo;t need another course.
            <br />
            You need a <span className="text-gradient-codyza">crew.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col justify-center space-y-6"
          >
            <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Tutorials end. Courses finish. Bootcamps cost money. And after all of it, you&rsquo;re often still on your own &mdash; wondering if anyone will ever see what you build.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
              Codyza is the crew that gathers around your first real project. We build together. We review code together. We deploy together. Free to join, and a place worth staying.
            </p>
            <div className="space-y-4 pt-4">
              {[
                { icon: Code2, color: "#7c3aed", title: "Real projects", sub: "Things people actually use, not tutorial clones" },
                { icon: Rocket, color: "#2563eb", title: "Real teammates", sub: "Devs, designers, students from everywhere" },
                { icon: Sparkles, color: "#22c55e", title: "Real momentum", sub: "Standups, reviews, deploys — the rhythm of shipping" },
              ].map(({ icon: Icon, color, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="id-card-glow w-full max-w-sm">
              <div className="id-card-inner">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }} />
                    <span className="text-xs font-semibold text-white">Codyza</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Active</span>
                  </div>
                </div>
                <div className="relative my-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>Contributor ID</div>
                  <div className="mt-1 font-mono text-3xl font-bold tracking-wider text-white">
                    CZX-<span className="text-gradient-codyza">0042</span>
                  </div>
                </div>
                <div className="relative grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Name", value: "Sample Member" },
                    { label: "Rank", value: "Software Engineer" },
                    { label: "XP", value: "2,140 / 3,500" },
                    { label: "Joined", value: "Mar 2026" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</div>
                      <div className="mt-0.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
                  style={{ background: "radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .id-card-glow {
          position: relative;
          border-radius: 18px;
          padding: 1px;
          overflow: hidden;
          isolation: isolate;
        }
        .id-card-glow::before {
          content: "";
          position: absolute;
          top: 50%; left: 50%;
          width: 200%; height: 200%;
          background: conic-gradient(from 0deg, #7c3aed, #2563eb, #06b6d4, #22c55e, #7c3aed);
          transform: translate(-50%, -50%) rotate(0deg);
          animation: spin-id-card 10s linear infinite;
          z-index: -1;
        }
        .id-card-inner {
          position: relative;
          border-radius: 17px;
          background: linear-gradient(135deg, #0a0a12 0%, #050508 100%);
          padding: 24px;
          overflow: hidden;
          z-index: 1;
        }
        @keyframes spin-id-card {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
