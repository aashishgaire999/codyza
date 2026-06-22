"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

const TERMINAL_LINES = [
  { type: "cmd", text: "$ git clone https://github.com/codyza-com/core.git" },
  { type: "out", text: "Cloning into 'core'..." },
  { type: "cmd", text: "$ git checkout -b feat/auth-flow" },
  { type: "out", text: "Switched to a new branch 'feat/auth-flow'" },
  { type: "cmd", text: "$ git commit -m \"add oauth login\"" },
  { type: "out", text: "[feat/auth-flow 8a2f9c1] add oauth login" },
  { type: "cmd", text: "$ git push origin feat/auth-flow" },
  { type: "ok", text: "✓ pushed to github.com/codyza/core" },
  { type: "cmd", text: "$ codyza deploy" },
  { type: "info", text: "→ Building production bundle..." },
  { type: "ok", text: "✓ Deployed to codyza.com in 12.4s" },
  { type: "ok", text: "✓ +120 XP earned" },
]

export function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) {
      const reset = setTimeout(() => setVisibleLines(0), 4000)
      return () => clearTimeout(reset)
    }
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 600)
    return () => clearTimeout(t)
  }, [visibleLines])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleLines])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-black/[0.02] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-black/40">codyza — mission control</span>
      </div>
      <div
        ref={containerRef}
        className="h-72 overflow-hidden bg-[#fafafa] p-5 font-mono text-[13px] leading-relaxed"
      >
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={
              line.type === "cmd" ? "text-black/90"
              : line.type === "out" ? "text-black/40"
              : line.type === "ok" ? "text-[#5e7359]"
              : line.type === "info" ? "text-black/55"
              : "text-black/40"
            }
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-black/70" />
        )}
      </div>
    </div>
  )
}
