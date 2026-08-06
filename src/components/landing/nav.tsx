"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { NAV_LINKS } from "@/constants/site"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "cz-nav-scrolled" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[4.25rem] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2.5">
            <CodyzaLogo variant="mark" size={32} priority className="shrink-0" />
            <span className="cz-micro tracking-[0.18em]">codyza</span>
          </Link>

          <div className="hidden items-center gap-8 lg:gap-10 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="cz-nav-link">
                {l.label.toLowerCase()}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="cz-pill hidden !min-h-10 !px-5 !text-[11px] sm:inline-flex">
              login
            </Link>
            <Link href="/apply" className="cz-pill cz-pill-solid !min-h-10 !px-5 !text-[11px]">
              apply
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-[var(--cz-muted)] transition-colors hover:text-[var(--cz-ink)] md:hidden"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="cz-menu-drawer fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col px-8 py-8">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="ml-auto flex h-11 w-11 items-center justify-center text-[var(--cz-muted)] transition-colors hover:text-[var(--cz-ink)]"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="mt-10 flex flex-col gap-7">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="cz-display text-[2.25rem] transition-colors hover:opacity-60"
                >
                  {l.label.toLowerCase()}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="cz-display text-[2.25rem] cz-headline-muted transition-colors hover:text-[var(--cz-ink)]"
              >
                login
              </Link>
              <Link href="/apply" onClick={() => setMenuOpen(false)} className="cz-pill cz-pill-solid mt-4 self-start">
                apply to join
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
