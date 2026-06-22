"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { NAV_LINKS, SITE_CONFIG } from "@/constants/site"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    ;(async () => {
      const { createClient } = await import("@/lib/supabase")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      const { data: subscription } = supabase.auth.onAuthStateChange((_e, session) => {
        setIsLoggedIn(!!session?.user)
      })
      unsubscribe = () => subscription.subscription.unsubscribe()
    })()
    return () => unsubscribe?.()
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-border bg-background/90 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Codyza home">
          <CodyzaLogo size={32} withGlow={false} />
          <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase tracking-tight">
            {SITE_CONFIG.name.toLowerCase()}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={isLoggedIn ? "/member" : "/login"}
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-block"
          >
            {isLoggedIn ? "Dashboard" : "Login"}
          </Link>
          <Link
            href="/apply"
            className="btn-primary hidden items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium md:inline-flex"
          >
            Apply
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-muted-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link href={isLoggedIn ? "/member" : "/login"} className="block py-2 text-sm">
                {isLoggedIn ? "Dashboard" : "Login"}
              </Link>
              <Link href="/apply" className="btn-primary mt-2 inline-flex rounded-full px-5 py-2 text-xs">
                Apply
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
