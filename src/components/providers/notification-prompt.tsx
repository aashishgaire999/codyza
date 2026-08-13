"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"

const DISMISS_KEY = "codyza-notification-prompt-dismissed"
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    if (Notification.permission !== "default") return
    const dismissed = Number(window.localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissed && Date.now() - dismissed < DISMISS_FOR_MS) return
    const timer = window.setTimeout(() => setVisible(true), 4200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  const enable = async () => {
    setWorking(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        await navigator.serviceWorker.ready
        setMessage("You’re in — Codyza will keep you posted.")
        window.setTimeout(() => setVisible(false), 2200)
      } else {
        setMessage("No problem. You can enable this later in browser settings.")
        window.setTimeout(() => setVisible(false), 2600)
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-[120] mx-auto max-w-md sm:inset-x-auto sm:right-6">
      <div className="rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11111a]/95">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#302bfb]/10 text-[#302bfb] dark:bg-[#8b5cf6]/15 dark:text-[#a78bfa]">
            <Bell className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Stay in the loop</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Get Codyza announcements, meeting reminders, and crew updates.
            </p>
            {message ? <p className="mt-2 text-xs font-medium text-[#302bfb] dark:text-[#a78bfa]">{message}</p> : null}
            {!message ? (
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={enable} disabled={working} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  {working ? "Enabling…" : "Enable notifications"}
                </button>
                <button type="button" onClick={dismiss} className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
                  Not now
                </button>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={dismiss} aria-label="Close notification prompt" className="rounded-full p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
