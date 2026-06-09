"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { NAV_LINKS, SITE_CONFIG } from "@/constants/site"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.05] bg-[#050508]/80 backdrop-blur-2xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Codyza home">
          <CodyzaLogo size={32} withGlow={false} />
          <span className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight sm:text-lg">
            {SITE_CONFIG.name}
          </span>
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => {
            return (
              <a
                key={link.href}
                href={link.href}
                className="group relative rounded-md px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-[#7c3aed] via-[#2563eb] to-[#06b6d4] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-zinc-500 transition-all hover:bg-white/[0.06] hover:text-white md:inline-flex"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <LogIn className="h-3 w-3" />
            Login
          </a>
          <Link href="/apply" className="hidden md:inline-flex">
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-semibold text-white rounded-lg border-none"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
            >
              Apply
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden md:hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,5,8,0.97)", backdropFilter: "blur(24px)" }}
          >
            <div className="space-y-0.5 px-4 py-3">
              {NAV_LINKS.map((link, i) => {
                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="block rounded-lg px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    {link.label}
                  </motion.a>
                )
              })}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.03 }}
                className="pt-1"
              >
                {isLoggedIn ? (
                  <Link
                    href="/member"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-purple-300 transition-colors hover:bg-purple-500/20"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Member Login
                  </Link>
                )}
              </motion.div>
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                <Button
                  size="sm"
                  className="mt-1.5 w-full text-white text-xs font-semibold rounded-lg border-none"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
                >
                  Apply
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}