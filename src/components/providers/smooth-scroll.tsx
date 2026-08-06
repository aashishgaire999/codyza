"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Lenis smooth scrolling — public pages only (member/admin keep native scroll).
 * No-ops when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    })

    // Lenis drives the real scroll position via its own rAF loop but doesn't
    // reliably fire native "scroll" events — anything listening for those
    // (e.g. framer-motion's useScroll, used by the pinned Chapters section)
    // never re-runs. Re-dispatch on every Lenis tick so those listeners fire.
    lenis.on("scroll", () => window.dispatchEvent(new Event("scroll")))

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
