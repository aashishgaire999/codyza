"use client"

import Link from "next/link"
import { useState } from "react"
import { NAV_LINKS } from "@/constants/site"

export function SofiNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#f7f7f7]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 md:px-8">
        <Link href="/" className="sofi-micro text-black">
          codyza
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="sofi-body text-[13px] text-black/60 hover:text-black">
              {l.label.toLowerCase()}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="sofi-micro text-black md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? "close" : "* menu"}
          </button>
          <Link href="/login" className="sofi-body hidden text-[13px] text-black/60 hover:text-black sm:inline">
            login
          </Link>
          <Link href="/apply" className="sofi-pill sofi-pill-fill text-[12px]">
            apply
          </Link>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-black/10 px-6 py-4 md:hidden">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2 sofi-body text-black/70">
              {l.label.toLowerCase()}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
