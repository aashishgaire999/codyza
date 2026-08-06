"use client"

import { useEffect, useState } from "react"

export function SofiScrollProgress() {
  const [pct, setPct] = useState(0)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-sofi-theme]")
    if (!sections.length) return

    const updateTheme = () => {
      const probe = window.scrollY + 4
      let theme: "dark" | "light" = "light"

      for (const section of sections) {
        const top = section.offsetTop
        const bottom = top + section.offsetHeight
        if (probe >= top && probe < bottom) {
          theme = section.dataset.sofiTheme === "dark" ? "dark" : "light"
          break
        }
      }

      setIsDark(theme === "dark")
    }

    updateTheme()
    window.addEventListener("scroll", updateTheme, { passive: true })
    window.addEventListener("resize", updateTheme)
    return () => {
      window.removeEventListener("scroll", updateTheme)
      window.removeEventListener("resize", updateTheme)
    }
  }, [])

  return (
    <>
      <div
        className="sofi-scroll-bar"
        style={{
          width: `${pct}%`,
          ["--progress-color" as string]: isDark
            ? "rgba(255, 255, 255, 0.8)"
            : "#000000",
        }}
        aria-hidden
      />
      <div
        className={`fixed bottom-4 right-4 z-[90] sofi-micro ${isDark ? "text-white/50" : "text-black/50"}`}
        aria-live="polite"
      >
        {pct}%
      </div>
    </>
  )
}
