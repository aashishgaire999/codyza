"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { NAV_LINKS } from "@/constants/site"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

type SofiNavProps = {
  variant?: "landing" | "default"
}

export function SofiNav({ variant = "default" }: SofiNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const isLanding = variant === "landing"

  useEffect(() => {
    if (!isLanding) return

    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isLanding])

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
        ref={navRef}
        className={`sofi-nav fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          isLanding
            ? scrolled
              ? "sofi-nav-scrolled bg-[rgba(8,8,8,0.85)] backdrop-blur-md"
              : "bg-transparent"
            : "bg-[#f7f7f7]/80 backdrop-blur-md"
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 md:px-8">
          <Link
            href="/"
            className={`inline-flex min-h-10 items-center gap-2.5 ${isLanding ? "ml-4 sm:ml-6" : "ml-8 sm:ml-10 md:ml-14"}`}
          >
            <CodyzaLogo variant="mark" size={38} priority className="shrink-0 translate-y-[0.5px]" />
            <span
              className={`sofi-micro sofi-nav-wordmark leading-none ${
                isLanding ? "text-white" : ""
              }`}
            >
              codyza
            </span>
          </Link>

          {!isLanding && (
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="sofi-body text-[13px] text-black/60 hover:text-black">
                  {l.label.toLowerCase()}
                </Link>
              ))}
            </div>
          )}

          <div
            className={`flex items-center gap-4 sm:gap-5 ${
              isLanding ? "mr-2 sm:mr-4" : "-translate-x-6 sm:-translate-x-10 md:-translate-x-14"
            }`}
          >
            {isLanding && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="sofi-nav-menu-btn flex h-10 w-10 items-center justify-center text-xl text-white"
                aria-expanded={menuOpen}
                aria-label="Open menu"
              >
                ☰
              </button>
            )}

            {!isLanding && (
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="sofi-micro text-black md:hidden"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? "close" : "* menu"}
              </button>
            )}

            {!isLanding && (
              <Link href="/login" className="sofi-pill hidden text-[12px] sm:inline-flex">
                login
              </Link>
            )}

            <Link
              href="/apply"
              className={`sofi-pill sofi-pill-fill text-[12px] ${
                isLanding ? "border-white bg-white text-black hover:bg-white/90 hover:text-black" : ""
              }`}
            >
              apply
            </Link>
          </div>
        </nav>

        {!isLanding && menuOpen && (
          <div className="border-t border-black/10 px-6 py-4 md:hidden">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 sofi-body text-black/70"
              >
                {l.label.toLowerCase()}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block py-2 sofi-body text-black/70"
            >
              login
            </Link>
          </div>
        )}
      </header>

      {isLanding && menuOpen && (
        <>
          <button
            type="button"
            className="sofi-nav-drawer-overlay fixed inset-0 z-[60] bg-black/60"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="sofi-nav-drawer fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-[#0d0d0d] px-8 py-8">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="sofi-nav-drawer-close ml-auto text-3xl leading-none text-white/70 hover:text-white"
              aria-label="Close menu"
            >
              ×
            </button>
            <nav className="mt-12 flex flex-col gap-6">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="sofi-display-section text-white hover:text-white/70"
                >
                  {l.label.toLowerCase()}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="sofi-display-section text-white/60 hover:text-white"
              >
                login
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
