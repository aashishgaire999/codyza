"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Calendar, Users, Flame } from "lucide-react"

function getThisWeekDate() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split("T")[0]
}

function formatWeek(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function StandupPage() {
  const router = useRouter()
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [crewStandups, setCrewStandups] = useState<any[]>([])
  const [thisWeek, setThisWeek] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"submit"|"crew">("submit")

  const [shipped, setShipped] = useState("")
  const [building, setBuilding] = useState("")
  const [blockers, setBlockers] = useState("")

  const weekDate = getThisWeekDate()

  useEffect(() => { loadUser() }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    const { data: contrib } = await supabase.from("contributors").select("*").eq("email", user.email).single()
    if (!contrib) { router.push("/login"); return }
    setContributor(contrib)

    // Load personal standup history
    const res = await fetch(`/api/standup?codyza_id=${contrib.codyza_id}`)
    const hist = await res.json()
    setHistory(hist)

    // Check if already submitted this week
    const thisWeekEntry = hist.find((h: any) => h.week_date === weekDate)
    if (thisWeekEntry) {
      setThisWeek(thisWeekEntry)
      setShipped(thisWeekEntry.shipped)
      setBuilding(thisWeekEntry.building)
      setBlockers(thisWeekEntry.blockers || "")
    }

    // Load crew standups for this week
    const { data: crew } = await supabase
      .from("standups")
      .select("*, contributors(name, codyza_id, rank)")
      .eq("week_date", weekDate)
      .order("created_at", { ascending: false })
    setCrewStandups(crew || [])

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codyza_id: contributor.codyza_id, shipped, building, blockers }),
      })
      if (res.ok) {
        setSubmitted(true)
        setThisWeek({ shipped, building, blockers, week_date: weekDate })
        loadUser()
      }
    } catch {}
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  const weeksSubmitted = history.length
  const streak = (() => {
    let s = 0
    const sorted = [...history].sort((a, b) => b.week_date.localeCompare(a.week_date))
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(weekDate)
      expected.setDate(expected.getDate() - i * 7)
      const exp = expected.toISOString().split("T")[0]
      if (sorted[i]?.week_date === exp) s++
      else break
    }
    return s
  })()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/member" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Weekly Standup</h1>
          <p className="text-gray-400 text-sm">Week of {formatWeek(weekDate)} · Every Tuesday 6pm UTC</p>
        </div>
        <div className="flex gap-3">
          <div style={{ textAlign:"center", padding:"10px 16px", borderRadius:10, background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"center" }}>
              <Flame size={14} style={{ color:"#f97316" }}/>
              <span style={{ fontSize:18, fontWeight:900, color:"#f97316" }}>{streak}</span>
            </div>
            <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"monospace" }}>Streak</p>
          </div>
          <div style={{ textAlign:"center", padding:"10px 16px", borderRadius:10, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)" }}>
            <span style={{ fontSize:18, fontWeight:900, color:"#a78bfa" }}>{weeksSubmitted}</span>
            <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"monospace" }}>Total</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        <button onClick={() => setActiveTab("submit")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "submit" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}>
          This Week
        </button>
        <button onClick={() => setActiveTab("crew")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "crew" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}>
          Crew ({crewStandups.length})
        </button>
      </div>

      {/* Submit tab */}
      {activeTab === "submit" && (
        <div>
          {(submitted || thisWeek) && (
            <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <CheckCircle size={16} style={{ color:"#22c55e", flexShrink:0 }}/>
              <p style={{ fontSize:12, color:"#22c55e" }}>Standup submitted for week of {formatWeek(weekDate)}. You can update it anytime.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px 22px" }}>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-green-400 mb-2">✓ What did you ship this week?</label>
                  <textarea required value={shipped} onChange={e => setShipped(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
                    placeholder="Shipped the auth system, fixed the leaderboard bug..."/>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">→ What are you building next?</label>
                  <textarea required value={building} onChange={e => setBuilding(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Working on the notification system, profile page improvements..."/>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">⚠ Any blockers? <span className="text-gray-500 normal-case">(optional)</span></label>
                  <textarea value={blockers} onChange={e => setBlockers(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Stuck on the Supabase RLS policies..."/>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Submitting..." : thisWeek ? "Update Standup" : "Submit Standup"}
            </button>
          </form>

          {/* Personal history */}
          {history.length > 1 && (
            <div className="mt-8">
              <h3 className="text-sm font-mono uppercase tracking-wider text-gray-500 mb-4">Your History</h3>
              <div className="space-y-3">
                {history.slice(1, 5).map((h: any) => (
                  <div key={h.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 16px" }}>
                    <p style={{ fontSize:10, fontFamily:"monospace", color:"rgba(255,255,255,0.3)", marginBottom:6 }}>Week of {formatWeek(h.week_date)}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}><span style={{ color:"#22c55e" }}>✓</span> {h.shipped}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Crew tab */}
      {activeTab === "crew" && (
        <div className="space-y-4">
          {crewStandups.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}>
              <Calendar size={32} style={{ margin:"0 auto 12px", opacity:0.4 }}/>
              <p>No standups submitted yet this week.</p>
              <p style={{ fontSize:12, marginTop:6, color:"rgba(255,255,255,0.2)" }}>Be the first — submit yours!</p>
            </div>
          ) : (
            crewStandups.map((s: any) => (
              <div key={s.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#8b5cf6,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>
                    {s.contributors?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700 }}>{s.contributors?.name || s.codyza_id}</p>
                    <p style={{ fontSize:10, fontFamily:"monospace", color:"rgba(255,255,255,0.3)" }}>{s.codyza_id}</p>
                  </div>
                  {s.codyza_id === contributor?.codyza_id && (
                    <span style={{ marginLeft:"auto", fontSize:10, padding:"2px 8px", borderRadius:6, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#a78bfa" }}>you</span>
                  )}
                </div>
                <div className="space-y-2">
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>
                    <span style={{ color:"#22c55e", fontWeight:700 }}>✓ </span>{s.shipped}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>
                    <span style={{ color:"#60a5fa", fontWeight:700 }}>→ </span>{s.building}
                  </div>
                  {s.blockers && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
                      <span style={{ color:"#f59e0b", fontWeight:700 }}>⚠ </span>{s.blockers}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
