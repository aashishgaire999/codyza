"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Bell, Check, LockKeyhole, X } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"

type PromptState = "invite" | "blocked" | "success"

const sheetSpring = { type: "spring", bounce: 0, duration: 0.38 } as const

export function NotificationPrompt() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [working, setWorking] = useState(false)
  const [state, setState] = useState<PromptState>("invite")
  const primaryActionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return
    if (Notification.permission === "granted") return

    const timer = window.setTimeout(() => {
      setState(Notification.permission === "denied" ? "blocked" : "invite")
      setVisible(true)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return

    const focusTimer = window.setTimeout(() => primaryActionRef.current?.focus(), 420)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [visible, state])

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
  const title = isSuccess ? "You’re all set." : state === "blocked" ? "Notifications are off." : "Don’t miss what’s next."
  const description = isSuccess
    ? "Codyza will let you know when something important happens."
    : state === "blocked"
      ? "Allow notifications for Codyza from this site’s browser settings whenever you’re ready."
      : "Get a quiet heads-up for new bounties, crew updates, launches, and meeting reminders."

  const icon = isSuccess
    ? <Check className="h-6 w-6" strokeWidth={2.25} />
    : state === "blocked"
      ? <LockKeyhole className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.8} />
      : <Bell className="h-[1.4rem] w-[1.4rem]" strokeWidth={1.8} />

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-8 dark:bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-prompt-title"
            aria-describedby="notification-prompt-description"
            className="relative w-full max-w-[390px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#f7f7f7]/[0.98] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_28px_80px_rgba(0,0,0,0.28)] dark:border-white/[0.12] dark:bg-[#1c1c1e]/[0.98] dark:text-[#f5f5f7]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.975, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 6 }}
            transition={reduceMotion ? { duration: 0.14 } : sheetSpring}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.055] text-black/45 transition-colors hover:bg-black/[0.09] hover:text-black/75 active:bg-black/[0.13] dark:bg-white/[0.08] dark:text-white/45 dark:hover:bg-white/[0.13] dark:hover:text-white/75"
              aria-label="Close notification invitation"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>

            <div className="px-7 pb-6 pt-8 sm:px-8 sm:pb-7">
              <motion.div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[1.05rem] ${isSuccess ? "bg-[#34c759] text-white" : "bg-[#111113] text-white dark:bg-[#f5f5f7] dark:text-[#111113]"}`}
                key={state}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { ...sheetSpring, delay: 0.04 }}
              >
                {icon}
              </motion.div>

              <motion.div
                className="mx-auto mt-5 max-w-[19rem] text-center"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.08 }}
              >
                <h2
                  id="notification-prompt-title"
                  className="font-sans text-[1.42rem] font-semibold leading-[1.15] tracking-[-0.035em]"
                >
                  {title}
                </h2>
                <p
                  id="notification-prompt-description"
                  className="mt-2.5 font-sans text-[0.92rem] font-normal leading-[1.45] tracking-[-0.01em] text-black/55 dark:text-white/55"
                >
                  {description}
                </p>
              </motion.div>

              {isInvite ? (
                <motion.div
                  className="mt-6 flex items-center gap-3 rounded-[1.15rem] border border-black/[0.055] bg-white/75 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-white/[0.07] dark:bg-white/[0.055]"
                  initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.12 }}
                >
                  <CodyzaLogo size={34} variant="mark" />
                  <div className="min-w-0 flex-1 font-sans">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[0.78rem] font-semibold leading-4">Codyza</p>
                      <span className="text-[0.68rem] text-black/35 dark:text-white/35">now</span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.77rem] leading-4 text-black/60 dark:text-white/58">
                      A new bounty is ready to build.
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="border-t border-black/[0.07] bg-white/55 p-3 dark:border-white/[0.08] dark:bg-black/10">
              {isInvite ? (
                <div className="grid gap-2">
                  <motion.button
                    ref={primaryActionRef}
                    type="button"
                    onClick={enable}
                    disabled={working}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    className="min-h-12 w-full rounded-[0.95rem] bg-[#111113] px-5 font-sans text-[0.91rem] font-semibold text-white outline-none transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55 dark:bg-[#f5f5f7] dark:text-[#111113] dark:hover:bg-white/85 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#1c1c1e]"
                  >
                    {working ? "Waiting for your browser…" : "Turn on notifications"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={close}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    className="min-h-11 w-full rounded-[0.95rem] font-sans text-[0.9rem] font-medium text-black/48 outline-none transition-colors hover:bg-black/[0.045] hover:text-black/75 focus-visible:ring-2 focus-visible:ring-black/20 dark:text-white/42 dark:hover:bg-white/[0.06] dark:hover:text-white/72 dark:focus-visible:ring-white/25"
                  >
                    Maybe later
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  ref={primaryActionRef}
                  type="button"
                  onClick={close}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  className="min-h-12 w-full rounded-[0.95rem] bg-[#111113] px-5 font-sans text-[0.91rem] font-semibold text-white outline-none transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#111113] dark:hover:bg-white/85 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#1c1c1e]"
                >
                  {isSuccess ? "Done" : "Continue"}
                </motion.button>
              )}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
