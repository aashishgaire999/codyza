"use client"

import { useEffect, useRef, useState } from "react"
import { SITE_CONFIG } from "@/constants/site"
import { cn } from "@/lib/utils"

export function SlackGateButton({ mode }: { mode: "text" | "icon" | "footer" }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [open])

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-describedby={open ? "slack-gate-tooltip" : undefined}
        className={cn(
          "cursor-pointer border-none bg-transparent p-0",
          mode === "footer" &&
            "text-[15px] font-medium lowercase text-black/70 transition-colors hover:text-black",
          mode === "text" &&
            "text-[13px] lowercase text-black/60 transition-colors hover:text-black",
          mode === "icon" &&
            "flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/50 transition-colors hover:text-black",
        )}
      >
        {mode === "icon" ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
          </svg>
        ) : (
          "slack"
        )}
      </button>

      {open && (
        <span
          id="slack-gate-tooltip"
          role="tooltip"
          className="absolute bottom-[calc(100%+10px)] left-1/2 z-50 w-[270px] -translate-x-1/2 rounded-xl border border-black/10 bg-white px-3.5 py-3 text-left text-[11px] leading-relaxed text-black/65 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        >
          <span className="font-medium text-[var(--journal-sage)]">Members only</span>
          <br />
          Apply first and become a contributor — Slack access arrives by email from{" "}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="font-medium text-black transition-opacity hover:opacity-70"
          >
            {SITE_CONFIG.email}
          </a>{" "}
          once accepted.
        </span>
      )}
    </span>
  )
}
