"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

const PROMPT = {
  user: "contributor@codyza",
  path: "~/core",
}

const TERMINAL_LINES = [
  { type: "cmd" as const, command: "git clone https://github.com/codyza-com/core.git" },
  { type: "out" as const, text: "Cloning into 'core'..." },
  { type: "cmd" as const, command: "git checkout -b feat/auth-flow" },
  { type: "out" as const, text: "Switched to a new branch 'feat/auth-flow'" },
  { type: "cmd" as const, command: 'git commit -m "add oauth login"' },
  { type: "out" as const, text: "[feat/auth-flow 8a2f9c1] add oauth login" },
  { type: "cmd" as const, command: "git push origin feat/auth-flow" },
  { type: "ok" as const, text: "pushed to github.com/codyza/core" },
  { type: "cmd" as const, command: "codyza deploy" },
  { type: "info" as const, text: "Building production bundle..." },
  { type: "ok" as const, text: "Deployed to codyza.com in 12.4s" },
  { type: "ok" as const, text: "+120 XP earned" },
]

function highlightCommand(command: string) {
  const parts = command.match(/^(\w+(?:\s+\w+)?)\s*(.*)$/)
  if (!parts) return <span className="text-[#e6edf3]">{command}</span>

  const [, head, rest] = parts
  const [bin, sub] = head.split(" ")

  return (
    <>
      <span className="text-[#ff7b72]">{bin}</span>
      {sub && <span className="text-[#e6edf3]"> {sub}</span>}
      {rest && (
        <span className="text-[#e6edf3]">
          {" "}
          {rest.split(/(\s+|https?:\/\/[^\s]+|"[^"]*"|'[^']*'|-\w+)/g).map((token, i) => {
            if (!token) return null
            if (token.startsWith("http")) return <span key={i} className="text-[#79c0ff] underline decoration-[#79c0ff]/30">{token}</span>
            if (token.startsWith('"') || token.startsWith("'")) return <span key={i} className="text-[#a5d6ff]">{token}</span>
            if (token.startsWith("-")) return <span key={i} className="text-[#d2a8ff]">{token}</span>
            return <span key={i}>{token}</span>
          })}
        </span>
      )}
    </>
  )
}

function TerminalPrompt() {
  return (
    <span className="mr-1.5 shrink-0">
      <span className="text-[#7ee787]">{PROMPT.user}</span>
      <span className="text-[#8b949e]">:</span>
      <span className="text-[#79c0ff]">{PROMPT.path}</span>
      <span className="text-[#e6edf3]">$ </span>
    </span>
  )
}

export function TerminalAnimation({ label = "codyza — mission control" }: { label?: string }) {
  const [visibleLines, setVisibleLines] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) {
      const reset = setTimeout(() => setVisibleLines(1), 4000)
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

  const showCursor = visibleLines < TERMINAL_LINES.length

  return (
    <div className="terminal-shell relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#161b22] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 text-center font-mono text-[11px] text-[#8b949e]">{label}</span>
        <span className="w-[52px]" aria-hidden />
      </div>

      <div
        ref={containerRef}
        className="terminal-body h-72 overflow-y-auto overflow-x-hidden bg-[#0d1117] p-4 font-mono text-[12.5px] leading-[1.65] sm:p-5 sm:text-[13px]"
      >
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="whitespace-pre-wrap break-all"
          >
            {line.type === "cmd" ? (
              <div className="flex flex-wrap items-baseline">
                <TerminalPrompt />
                {highlightCommand(line.command)}
              </div>
            ) : (
              <span
                className={
                  line.type === "out"
                    ? "text-[#8b949e]"
                    : line.type === "ok"
                      ? "text-[#7ee787]"
                      : line.type === "info"
                        ? "text-[#d2a8ff]"
                        : "text-[#8b949e]"
                }
              >
                {line.type === "ok" && <span className="text-[#7ee787]">✓ </span>}
                {line.type === "info" && <span className="text-[#d2a8ff]">• </span>}
                {line.text}
              </span>
            )}
          </motion.div>
        ))}

        {showCursor && (
          <span className="terminal-cursor ml-0.5 inline-block h-[1.1em] w-2 translate-y-[2px] bg-[#e6edf3]" />
        )}
      </div>
    </div>
  )
}
