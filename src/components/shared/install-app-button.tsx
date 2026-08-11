"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Download, Share, SquarePlus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

export function InstallAppButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || Boolean((navigator as NavigatorWithStandalone).standalone)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const mountTimeout = window.setTimeout(() => {
      setInstalled(standalone)
      setIsIOS(ios)
      setMounted(true)
    }, 0)

    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
      setInstructionsOpen(false)
    }

    window.addEventListener("beforeinstallprompt", capturePrompt)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.clearTimeout(mountTimeout)
      window.removeEventListener("beforeinstallprompt", capturePrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === "accepted") setInstalled(true)
      setPromptEvent(null)
      return
    }
    setInstructionsOpen(true)
  }

  if (!mounted || installed) return null

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
        transition: { type: "spring" as const, bounce: 0, duration: 0.35 },
      }

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className={cn(
          compact
            ? "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground active:scale-[0.96]"
            : "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--journal-rule)] px-4 py-2 text-sm text-[var(--journal-sage)] transition-colors hover:bg-[var(--journal-sage)]/5 active:scale-[0.98]",
          className
        )}
        aria-label="Install Codyza app"
      >
        <Download className="h-4 w-4" aria-hidden />
        {!compact && <span>install Codyza app</span>}
      </button>

      <AnimatePresence>
        {instructionsOpen && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInstructionsOpen(false) }}>
            <motion.section
              {...panelMotion}
              role="dialog"
              aria-modal="true"
              aria-labelledby="install-codyza-title"
              className="w-full max-w-sm rounded-[1.5rem] border border-white/10 bg-[#0d0d18] p-5 text-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b87ff]">free · no app store</p>
                  <h2 id="install-codyza-title" className="mt-2 text-xl font-semibold tracking-[-0.025em]">Add Codyza to your phone</h2>
                </div>
                <button type="button" onClick={() => setInstructionsOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/60 active:scale-[0.96]" aria-label="Close install instructions"><X className="h-4 w-4" /></button>
              </div>

              <ol className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b87ff]/12 text-[#8b87ff]"><Share className="h-4 w-4" /></span>
                  <div><p className="text-sm font-semibold">{isIOS ? "Tap Share in Safari" : "Open your browser menu"}</p><p className="mt-1 text-xs leading-5 text-white/55">{isIOS ? "Use the Share button at the bottom of the screen." : "Look for the menu beside the address bar."}</p></div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b87ff]/12 text-[#8b87ff]"><SquarePlus className="h-4 w-4" /></span>
                  <div><p className="text-sm font-semibold">Choose {isIOS ? "Add to Home Screen" : "Install app"}</p><p className="mt-1 text-xs leading-5 text-white/55">Codyza will open full-screen from its own icon.</p></div>
                </li>
              </ol>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
