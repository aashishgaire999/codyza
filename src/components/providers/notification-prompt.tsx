"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Sparkles } from "lucide-react"

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    if (Notification.permission === "granted") return
    const timer = window.setTimeout(() => {
      if (Notification.permission === "denied") {
        setBlocked(true)
        setMessage("Notifications are blocked. Open this site’s browser settings, allow notifications for Codyza, then refresh.")
      }
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
        setDone(true)
        setMessage("You’re in. Codyza will keep you posted.")
      } else {
        setMessage("No worries — you can turn notifications on later from your browser settings.")
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/20 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="notification-prompt-title" className="w-full max-w-md rounded-2xl border border-black/10 bg-white/95 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11111a]/95">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${done ? "bg-emerald-500/15 text-emerald-600" : "bg-[#302bfb]/10 text-[#302bfb] dark:bg-[#8b5cf6]/15 dark:text-[#a78bfa]"}`}>
            {done ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p id="notification-prompt-title" className="text-sm font-semibold text-slate-950 dark:text-white">{done ? "You’re part of the signal" : "Stay in the loop"}</p>{!done ? <Sparkles className="h-3.5 w-3.5 text-[#302bfb]" /> : null}</div>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {done ? "Announcements, crew updates, and meeting reminders will find you here." : "Get the moments that matter: new crew, fresh bounties, launches, and meeting reminders."}
            </p>
            {message ? <p className="mt-2 text-xs font-medium text-[#302bfb] dark:text-[#a78bfa]">{message}</p> : null}
            {!message && !blocked ? (
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={enable} disabled={working} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  {working ? "Enabling…" : "Enable notifications"}
                </button>
                <button type="button" onClick={() => setVisible(false)} className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">Maybe later</button>
              </div>
            ) : null}
            {message ? <button type="button" onClick={() => setVisible(false)} className="mt-3 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10">Continue exploring</button> : null}
            {message ? <button type="button" onClick={() => setVisible(false)} className="mt-3 ml-2 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-black/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">Maybe later</button> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
