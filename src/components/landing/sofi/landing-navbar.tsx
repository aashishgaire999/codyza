"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { NAV_LINKS } from "@/constants/site"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-[#f4f2ec]/10 bg-[#0a0a08]/90 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-[family-name:var(--font-fraunces)] text-sm font-light lowercase tracking-wide text-[#f4f2ec]">
          codyza
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="font-[family-name:var(--font-inter)] text-xs lowercase tracking-wide text-[#8a887e] hover:text-[#f4f2ec]">
              {l.label.toLowerCase()}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="border-[#f4f2ec]/15 bg-[#0a0a08]/50 text-[#f4f2ec]" />
          <Link href="/login" className="hidden text-xs lowercase text-[#8a887e] hover:text-[#f4f2ec] md:inline-block">
            login
          </Link>
          <Link href="/apply" className="rounded-full border border-[#c9c4b3]/30 px-4 py-1.5 font-[family-name:var(--font-inter)] text-xs lowercase text-[#f4f2ec]">
            apply
          </Link>
        </div>
      </nav>
    </header>
  )
}
