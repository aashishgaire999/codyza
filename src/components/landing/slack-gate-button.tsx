"use client"

import { useState } from "react"

export function SlackGateButton({ mode }: { mode: "text" | "icon" }) {
  const [open, setOpen] = useState(false)

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        className={
          mode === "text"
            ? "text-sm text-zinc-300 transition-colors hover:text-white"
            : "flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        }
      >
        {mode === "text" ? "Slack" : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
          </svg>
        )}
      </button>

      {open && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 270,
          padding: "12px 14px",
          background: "#0d0d1a",
          border: "1px solid rgba(139,92,246,0.4)",
          borderRadius: 10,
          fontSize: 11,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.7)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          zIndex: 50,
          whiteSpace: "normal",
          textAlign: "left",
          pointerEvents: "none",
        }}>
          <span style={{ color: "#a855f7", fontWeight: 700 }}>🔒 Members only</span><br />
          Apply first and become a contributor — you will receive Slack access
          via email from{" "}
          <span style={{ color: "#67e8f9", fontWeight: 600 }}>team@codyza.com</span>{" "}
          once accepted.
        </span>
      )}
    </span>
  )
}
