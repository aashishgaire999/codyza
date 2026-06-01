"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  message: string
  link: string
  read: boolean
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  submission_approved: "✅",
  submission_rejected: "❌",
  rank_up: "🏆",
  streak_milestone: "🔥",
  new_member: "👋",
  reaction: "💜",
  default: "🔔",
}

export function NotificationBell({ codyzaId }: { codyzaId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [codyzaId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const loadNotifications = async () => {
    const res = await fetch(`/api/notifications?codyza_id=${codyzaId}`)
    const data = await res.json()
    setNotifications(data)
  }

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codyza_id: codyzaId }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        style={{
          position: "relative", padding: "8px", borderRadius: 8,
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: "1px solid transparent",
          cursor: "pointer", color: unread > 0 ? "#a78bfa" : "#94a3b8",
          transition: "all 0.2s",
        }}
        className="hover:bg-white/5 hover:text-white"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 16, height: 16, borderRadius: "50%",
            background: "#8b5cf6", border: "2px solid #050508",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#fff",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 320, maxHeight: 420, overflowY: "auto",
          background: "#0d0d1a", border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          zIndex: 100,
        }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead}
                style={{ fontSize: 11, color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read ? "transparent" : "rgba(139,92,246,0.06)",
                  cursor: "pointer", transition: "background 0.2s",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}
                className="hover:bg-white/[0.03]"
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                  {TYPE_ICONS[n.type] || TYPE_ICONS.default}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: n.read ? "rgba(255,255,255,0.6)" : "#f8fafc", lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3, fontFamily: "monospace" }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
