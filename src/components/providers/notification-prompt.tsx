"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    // A denied permission can only be changed from browser/site settings. Do
    // not trap visitors in a modal they cannot resolve from the page.
    if (Notification.permission !== "default") return
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, 4200)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  const enable = async () => {
    setWorking(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        await navigator.serviceWorker.ready
        setMessage("You’re in — Codyza will keep you posted.")
        window.setTimeout(() => setVisible(false), 2200)
      } else {
        setVisible(false)
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/20 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="notification-prompt-title" className="w-full max-w-md rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11111a]/95">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#302bfb]/10 text-[#302bfb] dark:bg-[#8b5cf6]/15 dark:text-[#a78bfa]">
            <Bell className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p id="notification-prompt-title" className="text-sm font-semibold text-slate-950 dark:text-white">Stay in the loop</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Get Codyza announcements, meeting reminders, and crew updates.
            </p>
            {message ? <p className="mt-2 text-xs font-medium text-[#302bfb] dark:text-[#a78bfa]">{message}</p> : null}
            {!message ? (
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={enable} disabled={working} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  {working ? "Enabling…" : "Enable notifications"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
