import { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { MemberNavbar } from "@/components/member/member-navbar"
import Link from "next/link"
import { TrendingUp, Users, Zap, FileText, CheckCircle, XCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Analytics | Codyza Admin",
}

export const revalidate = 60

function createSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function CSSBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}60`, transition: "width 0.6s ease" }} />
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = createSupabase()

  const [
    { data: contributors },
    { data: submissions },
    { data: applications },
  ] = await Promise.all([
    supabase.from("contributors").select("xp, rank, joined_at, name, codyza_id").order("xp", { ascending: false }),
    supabase.from("submissions").select("status, xp_earned, ai_score, created_at, codyza_id, project_name").order("created_at", { ascending: false }),
    supabase.from("applications").select("status, applied_at"),
  ])

  const allContribs = contributors || []
  const allSubs = submissions || []
  const allApps = applications || []

  // Stats
  const totalXP = allContribs.reduce((s, c) => s + (c.xp || 0), 0)
  const totalApproved = allSubs.filter(s => s.status === "approved").length
  const totalPending = allSubs.filter(s => s.status === "pending").length
  const totalRejected = allSubs.filter(s => s.status === "rejected").length
  const avgScore = allSubs.filter(s => s.ai_score).length > 0
    ? (allSubs.reduce((s, c) => s + (c.ai_score || 0), 0) / allSubs.filter(s => s.ai_score).length).toFixed(1)
    : "—"
  const pendingApps = allApps.filter(a => a.status === "pending").length

  // Submissions by day (last 14 days)
  const now = new Date()
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split("T")[0]
  })
  const subsByDay = days14.map(day => ({
    day: day.slice(5),
    count: allSubs.filter(s => s.created_at?.startsWith(day)).length
  }))
  const maxSubDay = Math.max(...subsByDay.map(d => d.count), 1)

  // Rank distribution
  const rankCounts: Record<string, number> = {}
  allContribs.forEach(c => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1 })
  const rankColors: Record<string, string> = {
    "Apprentice": "#94a3b8", "Associate Engineer": "#34d399", "Software Engineer": "#60a5fa",
    "Senior Engineer": "#a78bfa", "Staff Engineer": "#fbbf24", "Principal Engineer": "#f87171",
    "Distinguished Engineer": "#22d3ee", "Codyza Fellow": "#fde68a"
  }

  // Top 5 by XP
  const top5 = allContribs.slice(0, 5)
  const maxXP = top5[0]?.xp || 1

  // Submission status breakdown
  const statusTotal = allSubs.length || 1

  // Recent activity (last 7 subs)
  const recent7 = allSubs.slice(0, 7)

  return (
    <div className="min-h-screen bg-background text-white">
      <MemberNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analytics</h1>
            <p className="text-gray-400 text-sm">Platform overview · updates every 60s</p>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">← Admin</Link>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Members", value: allContribs.length, icon: <Users size={16}/>, color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
            { label: "Total XP", value: totalXP.toLocaleString(), icon: <Zap size={16}/>, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
            { label: "Projects Shipped", value: totalApproved, icon: <CheckCircle size={16}/>, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
            { label: "Avg AI Score", value: avgScore, icon: <TrendingUp size={16}/>, color: "#67e8f9", bg: "rgba(103,232,249,0.1)", border: "rgba(103,232,249,0.2)" },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: stat.color }}>{stat.icon}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</span></div>
              <p style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Submissions last 14 days */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <FileText size={14} style={{ color: "#a78bfa" }}/>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Submissions — Last 14 Days</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
              {subsByDay.map(d => {
                const h = maxSubDay > 0 ? Math.max(4, Math.round((d.count / maxSubDay) * 72)) : 4
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: h, borderRadius: 3, background: d.count > 0 ? "linear-gradient(180deg,#a78bfa,#7c3aed)" : "rgba(255,255,255,0.06)", boxShadow: d.count > 0 ? "0 0 8px rgba(167,139,250,0.3)" : "none" }}/>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              <span>{allSubs.length} total submissions</span>
              <span>{totalPending} pending review</span>
            </div>
          </div>

          {/* Submission status breakdown */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <TrendingUp size={14} style={{ color: "#67e8f9" }}/>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Submission Status</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Approved", count: totalApproved, color: "#22c55e" },
                { label: "Pending", count: totalPending, color: "#f59e0b" },
                { label: "Rejected", count: totalRejected, color: "#f87171" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.count} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>({Math.round((s.count/statusTotal)*100)}%)</span></span>
                  </div>
                  <CSSBar value={s.count} max={statusTotal} color={s.color} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, padding: "10px 14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Applications pending</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>{pendingApps}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Top contributors */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Zap size={14} style={{ color: "#f59e0b" }}/>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Top Contributors by XP</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {top5.map((c, i) => (
                <div key={c.codyza_id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", width: 14 }}>{i+1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{c.codyza_id}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{c.xp.toLocaleString()}</span>
                  </div>
                  <CSSBar value={c.xp} max={maxXP} color={i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#f97316" : "#a78bfa"} />
                </div>
              ))}
            </div>
          </div>

          {/* Rank distribution */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Users size={14} style={{ color: "#a78bfa" }}/>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Rank Distribution</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(rankCounts).map(([rank, count]) => (
                <div key={rank}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                    <span style={{ color: rankColors[rank] || "#94a3b8" }}>{rank}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{count}</span>
                  </div>
                  <CSSBar value={count} max={allContribs.length} color={rankColors[rank] || "#94a3b8"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={14} style={{ color: "#67e8f9" }}/>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Recent Submissions</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent7.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.02)" }}>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#a78bfa", flexShrink: 0, width: 70 }}>{s.codyza_id}</span>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.project_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${s.status === "approved" ? "bg-green-500/10 text-green-400" : s.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>{s.status}</span>
                {s.ai_score && <span style={{ fontSize: 11, fontWeight: 700, color: s.ai_score >= 8 ? "#22c55e" : "#f59e0b", flexShrink: 0 }}>{s.ai_score}/10</span>}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", flexShrink: 0 }}>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
