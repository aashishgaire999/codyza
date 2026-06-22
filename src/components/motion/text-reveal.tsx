"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function HeroHeadline({
  lines,
  className,
  accentIndex,
}: {
  lines: string[]
  className?: string
  accentIndex?: number
}) {
  return (
    <h1 className={cn("font-[family-name:var(--font-heading)] font-bold tracking-tight", className)}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "block text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] lowercase",
              accentIndex === i ? "text-accent" : "text-foreground"
            )}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

export function MarqueeWords({ words }: { words: string[] }) {
  const track = [...words, ...words]
  return (
    <div className="overflow-hidden border-y border-border py-4">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        className="flex w-max gap-12 whitespace-nowrap px-6"
      >
        {track.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="font-[family-name:var(--font-heading)] text-2xl font-medium lowercase text-muted-foreground md:text-4xl"
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
      <span>{num}</span>
      <span className="h-px flex-1 max-w-[60px] bg-border" />
      <span>{label}</span>
    </div>
  )
}
