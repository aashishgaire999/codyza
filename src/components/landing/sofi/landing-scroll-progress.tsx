"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function LandingScrollProgress() {
  const [pct, setPct] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop
      const max = doc.scrollHeight - doc.clientHeight
      setPct(max > 0 ? Math.round((scrollTop / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [reduced])

  return (
    <>
      <div
        className="landing-scroll-bar fixed bottom-0 left-0 z-[90] h-[2px] origin-left bg-[#c9c4b3]"
        style={{ width: `${pct}%`, mixBlendMode: "difference" }}
        aria-hidden
      />
      <div
        className="fixed bottom-4 right-6 z-[90] font-mono text-[10px] tracking-widest text-[#f4f2ec]"
        style={{ mixBlendMode: "difference" }}
        aria-live="polite"
      >
        {pct}%
      </div>
    </>
  )
}
