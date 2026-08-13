"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bell, BellRing, Check, LockKeyhole, X } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

type PromptState = "invite" | "blocked" | "success"

export function NotificationPrompt() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [state, setState] = useState<PromptState>("invite")

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    if (Notification.permission === "granted") return

    const timer = window.setTimeout(() => {
      setState(Notification.permission === "denied" ? "blocked" : "invite")
      setVisible(true)
    }, 3600)

    return () => window.clearTimeout(timer)
  }, [])

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

  const title = state === "success"
    ? "You’re in the loop."
    : state === "blocked"
      ? "Notifications are off."
      : "Stay close to the crew."

  const description = state === "success"
    ? "Codyza can now keep you posted when something worth seeing happens."
    : state === "blocked"
      ? "Your browser has notifications blocked for Codyza. You can allow them later in this site’s browser settings."
      : "Get launches, new bounties, crew updates, and meeting reminders—without opening the site to check."

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/25 p-4 backdrop-blur-[10px] dark:bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.25, ease: "easeOut" }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-prompt-title"
            aria-describedby="notification-prompt-description"
            className="relative w-full max-w-[410px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 p-5 text-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.28)] backdrop-blur-[32px] backdrop-saturate-150 dark:border-white/12 dark:bg-[#17171c]/88 dark:text-white sm:p-6"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
            transition={reduceMotion
              ? { duration: 0.15 }
              : { type: "spring", bounce: 0, duration: 0.4 }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-[#4f46ff]/12 blur-3xl dark:bg-[#8b5cf6]/16" />

            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.055] text-slate-500 transition-colors hover:bg-black/10 hover:text-slate-950 dark:bg-white/[0.08] dark:text-white/55 dark:hover:bg-white/15 dark:hover:text-white"
              aria-label="Close notification invitation"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <motion.div
                className={`mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.35rem] shadow-[0_16px_36px_rgba(48,43,251,0.2)] ${state === "success" ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-[#5146ff] to-[#2118d8] text-white"}`}
                key={state}
                initial={reduceMotion ? false : { scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.38, delay: 0.05 }}
              >
                {state === "success" ? <Check className="h-8 w-8" strokeWidth={2.4} /> : state === "blocked" ? <LockKeyhole className="h-7 w-7" /> : <BellRing className="h-8 w-8" />}
              </motion.div>

              <div className="mx-auto mt-5 max-w-[20rem] text-center">
                <h2 id="notification-prompt-title" className="text-[1.55rem] font-semibold leading-tight tracking-[-0.035em]">
                  {title}
                </h2>
                <p id="notification-prompt-description" className="mt-2 text-[0.9rem] font-medium leading-6 text-slate-600 dark:text-white/62">
                  {description}
                </p>
              </div>

              {state === "invite" ? (
                <div className="relative mx-auto mt-5 max-w-[21rem]">
                  <div className="absolute inset-x-5 top-3 h-full rounded-[1.35rem] bg-white/45 shadow-sm dark:bg-white/[0.05]" />
                  <motion.div
                    className="relative flex items-start gap-3 rounded-[1.35rem] border border-black/[0.06] bg-white/88 p-3.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#2b2b31]/90"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.13, duration: 0.3 }}
                  >
                    <CodyzaLogo size={36} variant="mark" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.78rem] font-semibold">Codyza</p>
                        <span className="text-[0.68rem] font-medium text-slate-400 dark:text-white/40">now</span>
                      </div>
                      <p className="mt-0.5 text-[0.78rem] font-semibold leading-4">A new bounty just opened</p>
                      <p className="mt-0.5 text-[0.72rem] leading-4 text-slate-500 dark:text-white/50">Your next build might be waiting.</p>
                    </div>
                  </motion.div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-2.5">
                {state === "invite" ? (
                  <motion.button
                    type="button"
                    onClick={enable}
                    disabled={working}
                    whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#302bfb] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(48,43,251,0.25)] transition-colors hover:bg-[#2520df] disabled:cursor-wait disabled:opacity-65"
                  >
                    <Bell className="h-4 w-4" />
                    {working ? "Asking your browser…" : "Allow notifications"}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={close}
                    whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                    className="min-h-12 w-full rounded-2xl bg-[#302bfb] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2520df]"
                  >
                    {state === "success" ? "Done" : "Continue without notifications"}
                  </motion.button>
                )}

                {state === "invite" ? (
                  <motion.button
                    type="button"
                    onClick={close}
                    whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                    className="min-h-11 w-full rounded-2xl text-sm font-semibold text-slate-500 transition-colors hover:bg-black/[0.045] hover:text-slate-950 dark:text-white/48 dark:hover:bg-white/[0.07] dark:hover:text-white"
                  >
                    Not now
                  </motion.button>
                ) : null}
              </div>

              {state === "invite" ? (
                <p className="mt-4 text-center text-[0.66rem] font-medium leading-4 text-slate-400 dark:text-white/35">
                  You’re always in control. Change this anytime in browser settings.
                </p>
              ) : null}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
