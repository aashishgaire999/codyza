import { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { TrendingUp, Users, Zap, FileText, CheckCircle, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Analytics — Admin",
}

export const revalidate = 60

function createSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-muted ${className || ""}`}>
      <div
        className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
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

  const totalXP = allContribs.reduce((s, c) => s + (c.xp || 0), 0)
  const totalApproved = allSubs.filter(s => s.status === "approved").length
  const totalPending = allSubs.filter(s => s.status === "pending").length
  const totalRejected = allSubs.filter(s => s.status === "rejected").length
  const avgScore = allSubs.filter(s => s.ai_score).length > 0
    ? (allSubs.reduce((s, c) => s + (c.ai_score || 0), 0) / allSubs.filter(s => s.ai_score).length).toFixed(1)
    : "—"
  const pendingApps = allApps.filter(a => a.status === "pending").length

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

  const rankCounts: Record<string, number> = {}
  allContribs.forEach(c => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1 })

  const top5 = allContribs.slice(0, 5)
  const maxXP = top5[0]?.xp || 1
  const statusTotal = allSubs.length || 1
  const recent7 = allSubs.slice(0, 7)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <CodyzaLogo size={28} variant="full" />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Admin · Analytics</span>
        </div>
        <Link href="/admin" className="btn-ghost rounded-full px-3 py-1.5 text-xs">← Admin</Link>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">admin · stats</p>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold lowercase">overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Updates every 60s</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Members", value: allContribs.length, icon: <Users className="h-4 w-4" /> },
            { label: "Total XP", value: totalXP.toLocaleString(), icon: <Zap className="h-4 w-4" /> },
            { label: "Projects Shipped", value: totalApproved, icon: <CheckCircle className="h-4 w-4" /> },
            { label: "Avg AI Score", value: avgScore, icon: <TrendingUp className="h-4 w-4" /> },
          ].map(stat => (
            <div key={stat.label} className="dashboard-stat">
              <div className="mb-2 flex items-center gap-2 text-accent">
                {stat.icon}
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="surface-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">submissions — last 14 days</span>
            </div>
            <div className="flex h-20 items-end gap-1">
              {subsByDay.map(d => {
                const h = maxSubDay > 0 ? Math.max(4, Math.round((d.count / maxSubDay) * 72)) : 4
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm ${d.count > 0 ? "bg-accent" : "bg-muted"}`}
                      style={{ height: h }}
                    />
                    <span className="font-mono text-[8px] text-muted-foreground">{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>{allSubs.length} total submissions</span>
              <span>{totalPending} pending review</span>
            </div>
          </div>

          <div className="surface-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">submission status</span>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Approved", count: totalApproved, className: "text-success" },
                { label: "Pending", count: totalPending, className: "text-muted-foreground" },
                { label: "Rejected", count: totalRejected, className: "text-destructive" },
              ].map(s => (
                <div key={s.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className={`font-semibold ${s.className}`}>
                      {s.count}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({Math.round((s.count / statusTotal) * 100)}%)
                      </span>
                    </span>
                  </div>
                  <ProgressBar value={s.count} max={statusTotal} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Applications pending</span>
              <span className="font-[family-name:var(--font-heading)] text-base font-bold text-accent">{pendingApps}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="surface-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">top contributors by xp</span>
            </div>
            <div className="flex flex-col gap-3">
              {top5.map((c, i) => (
                <div key={c.codyza_id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-4 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.codyza_id}</span>
                    </div>
                    <span className="text-sm font-bold text-accent">{c.xp.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={c.xp} max={maxXP} />
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">rank distribution</span>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(rankCounts).map(([rank, count]) => (
                <div key={rank}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{rank}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                  <ProgressBar value={count} max={allContribs.length} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">recent submissions</span>
          </div>
          <div className="flex flex-col gap-2">
            {recent7.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
                <span className="w-[70px] flex-shrink-0 font-mono text-[10px] text-accent">{s.codyza_id}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.project_name}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    s.status === "approved"
                      ? "bg-success/10 text-success"
                      : s.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.status}
                </span>
                {s.ai_score && (
                  <span className="flex-shrink-0 text-xs font-bold text-accent">{s.ai_score}/10</span>
                )}
                <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
