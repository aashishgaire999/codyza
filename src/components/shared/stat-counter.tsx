"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface StatCounterProps {
  value: number
  label?: string
  suffix?: string
  prefix?: string
  duration?: number
  inline?: boolean
}

export function StatCounter({
  value,
  label,
  suffix = "",
  prefix = "",
  duration = 1.8,
  inline = false,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration])

  if (inline) {
    return (
      <span ref={ref}>
        {prefix}{display.toLocaleString()}{suffix}
      </span>
    )
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <div className="font-[family-name:var(--font-heading)] text-5xl font-bold tracking-tight md:text-6xl">
        {prefix}{display.toLocaleString()}{suffix}
      </div>
      {label && (
        <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  )
}
