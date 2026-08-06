"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div className="cz-scroll-bar" style={{ width: `${pct}%` }} aria-hidden />
      <div className="cz-micro fixed bottom-4 right-4 z-[90]" aria-live="polite">
        {pct}%
      </div>
    </>
  )
}
