"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

const TERMINAL_LINES = [
  { type: "cmd", text: "$ git checkout -b feat/auth-flow" },
  { type: "out", text: "Switched to new branch 'feat/auth-flow'" },
  { type: "cmd", text: "$ git commit -m \"add oauth login\"" },
  { type: "out", text: "[feat/auth-flow 8a2f9c1] add oauth login" },
  { type: "out", text: " 4 files changed, 127 insertions(+)" },
  { type: "cmd", text: "$ npm test" },
  { type: "ok",  text: "✓ 24 tests passed in 1.8s" },
  { type: "cmd", text: "$ git push origin feat/auth-flow" },
  { type: "ok",  text: "✓ pushed to github.com/codyza/core" },
  { type: "cmd", text: "$ codyza deploy" },
  { type: "info",text: "→ Building production bundle..." },
  { type: "info",text: "→ Optimizing assets..." },
  { type: "ok",  text: "✓ Deployed to codyza.com in 12.4s" },
  { type: "info",text: "→ +120 XP earned" },
]

function getColor(type: string) {
  switch (type) {
    case "cmd":  return "text-zinc-100"
    case "out":  return "text-zinc-500"
    case "ok":   return "text-[#22c55e]"
    case "info": return "text-[#06b6d4]"
    default:     return "text-zinc-400"
  }
}

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
    <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a12]/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-zinc-500">codyza ~ contributor-cli</span>
      </div>
      <div
        ref={containerRef}
        className="h-72 overflow-hidden p-5 font-mono text-[13px] leading-relaxed"
      >
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={getColor(line.type)}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-[#8b5cf6]" />
        )}
      </div>
    </div>
  )
}
