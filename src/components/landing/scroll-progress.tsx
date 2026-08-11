"use client"

import { useEffect, useRef, useState } from "react"

export function ScrollProgress() {
  const [pct, setPct] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0)
        frame.current = null
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <>
      <div className="cz-scroll-bar" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden />
      <div className="cz-micro fixed bottom-4 right-4 z-[90]" aria-hidden>
        {pct}%
      </div>
    </>
  )
}
