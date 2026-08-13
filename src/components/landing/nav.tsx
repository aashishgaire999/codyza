"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { NAV_LINKS } from "@/constants/site"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
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

  useEffect(() => {
    const destinations = [...NAV_LINKS.map((link) => link.href), "/login", "/join"]
    const warmRoutes = () => destinations.forEach((href) => router.prefetch(href))
    const timer = globalThis.setTimeout(warmRoutes, 250)
    return () => window.clearTimeout(timer)
  }, [router])

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

          <div className="hidden items-center gap-6 lg:flex xl:gap-9">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="cz-nav-link"
                aria-current={isActive(l.href) ? "page" : undefined}
              >
                {l.label.toLowerCase()}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="cz-pill hidden !min-h-10 !px-5 !text-[11px] sm:inline-flex">
              login
            </Link>
            <Link href="/join#join-top" className="cz-pill cz-pill-solid !min-h-11 !px-5 !text-[11px]">
              join
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-[var(--cz-muted)] transition-colors hover:text-[var(--cz-ink)] lg:hidden"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
          >
            <button
            type="button"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <motion.aside
            className="cz-menu-drawer absolute inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col px-8 py-8"
            initial={{ x: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 }}
            transition={{ type: "spring", bounce: 0, duration: reduceMotion ? 0.12 : 0.38 }}
          >
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
                  aria-current={isActive(l.href) ? "page" : undefined}
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
              <Link href="/join#join-top" onClick={() => setMenuOpen(false)} className="cz-pill cz-pill-solid mt-4 self-start">
                join the crew
              </Link>
            </nav>
          </motion.aside>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
