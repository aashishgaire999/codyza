"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bell, Check, LockKeyhole, X } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

type PromptState = "invite" | "blocked" | "success"

const VISIBLE_TIME = 5000
const toastSpring = { type: "spring", bounce: 0, duration: 0.38 } as const

export function NotificationPrompt() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [state, setState] = useState<PromptState>("invite")

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    if (Notification.permission === "granted") return

    const showTimer = window.setTimeout(() => {
      setState(Notification.permission === "denied" ? "blocked" : "invite")
      setVisible(true)
    }, 3200)

    return () => window.clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!visible || working) return
    const hideTimer = window.setTimeout(() => setVisible(false), VISIBLE_TIME)
    return () => window.clearTimeout(hideTimer)
  }, [visible, state, working])

  const close = () => setVisible(false)

  const enable = async () => {
    setWorking(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        await navigator.serviceWorker.ready
        setState("success")
      } else {
        setState("blocked")
      }
    } finally {
      setWorking(false)
    }
  }

  const isInvite = state === "invite"
  const isSuccess = state === "success"
  const title = isSuccess ? "Notifications are on" : state === "blocked" ? "Notifications are off" : "Stay in the loop"
  const description = isSuccess
    ? "We’ll only send the Codyza updates that matter."
    : state === "blocked"
      ? "You can allow Codyza later from your browser settings."
      : "New bounties, crew updates, launches, and reminders."

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          role="region"
          aria-live="polite"
          aria-labelledby="notification-toast-title"
          aria-describedby="notification-toast-description"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] left-3 right-3 z-[120] overflow-hidden rounded-[1.4rem] border border-white/90 bg-white/[0.92] text-[#111113] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] backdrop-saturate-[180%] sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 14, y: 18, scale: 0.975 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 10, y: 12, scale: 0.985 }}
          transition={reduceMotion ? { duration: 0.14 } : toastSpring}
        >
          <div className="flex items-start gap-3.5 px-4 pb-3.5 pt-4">
            <motion.div
              key={state}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_5px_16px_rgba(0,0,0,0.08)] ${isSuccess ? "bg-[#34c759] text-white" : "bg-white/80 text-[#111113] ring-1 ring-black/[0.055]"}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : toastSpring}
              aria-hidden="true"
            >
              {isSuccess ? (
                <Check className="h-5 w-5" strokeWidth={2.25} />
              ) : state === "blocked" ? (
                <LockKeyhole className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
              ) : (
                <Bell className="h-5 w-5" strokeWidth={1.8} />
              )}
            </motion.div>

            <div className="min-w-0 flex-1 pr-7 font-sans">
              <div className="flex items-center gap-2">
                <CodyzaLogo size={17} variant="mark" />
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-black/42">Codyza</p>
              </div>
              <h2 id="notification-toast-title" className="mt-1.5 text-[0.98rem] font-semibold leading-tight tracking-[-0.025em]">
                {title}
              </h2>
              <p id="notification-toast-description" className="mt-1 text-[0.8rem] leading-[1.4] tracking-[-0.005em] text-black/52">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-black/35 transition-colors hover:bg-black/[0.055] hover:text-black/65 active:bg-black/[0.09]"
              aria-label="Dismiss notification invitation"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="flex items-center gap-2.5 border-t border-black/[0.055] bg-white/35 px-3 py-2.5">
            {isInvite ? (
              <motion.button
                type="button"
                onClick={enable}
                disabled={working}
                whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                className="cz-liquid-button flex min-h-10 flex-1 items-center justify-center rounded-[0.85rem] px-4 font-sans text-[0.82rem] font-semibold text-[#111113] outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-wait disabled:opacity-55"
              >
                {working ? "Waiting…" : "Enable notifications"}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={close}
                whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                className="cz-liquid-button min-h-10 flex-1 rounded-[0.85rem] px-4 font-sans text-[0.82rem] font-semibold text-[#111113] outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                {isSuccess ? "Done" : "Got it"}
              </motion.button>
            )}
            {isInvite ? (
              <motion.button
                type="button"
                onClick={close}
                whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                className="min-h-10 rounded-[0.85rem] px-3.5 font-sans text-[0.8rem] font-medium text-black/45 outline-none transition-colors hover:bg-black/[0.04] hover:text-black/70 focus-visible:ring-2 focus-visible:ring-black/20"
              >
                Later
              </motion.button>
            ) : null}
          </div>

          <div className="h-[3px] bg-black/[0.055]" aria-hidden="true">
            <motion.div
              key={`${state}-${visible}-${working}`}
              className="h-full origin-left rounded-r-full bg-black/35"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: working ? 1 : 0 }}
              transition={{ duration: working ? 0 : VISIBLE_TIME / 1000, ease: "linear" }}
            />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
