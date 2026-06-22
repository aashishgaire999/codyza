"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, Zap, Target, FileText, Award, Settings } from "lucide-react"

interface Contributor {
  codyza_id: string
  name: string
  email: string
  xp: number
  rank: string
  streak: number
  is_admin: boolean
  skills?: string[]
  bio?: string
  avatar_url?: string
}

interface Submission {
  id: string
  project_name: string
  xp_earned: number
  status: string
  submitted_at: string
}

const RANK_CONFIG: Record<string, { color: string; gradient: string }> = {
  "Apprentice": { color: "text-muted-foreground", gradient: "from-muted-foreground to-muted-foreground" },
  "Associate Engineer": { color: "text-success", gradient: "from-success to-success" },
  "Software Engineer": { color: "text-accent", gradient: "from-accent to-accent" },
  "Senior Engineer": { color: "text-accent", gradient: "from-accent to-accent" },
  "Staff Engineer": { color: "text-foreground", gradient: "from-foreground to-foreground" },
  "Principal Engineer": { color: "text-foreground", gradient: "from-foreground to-foreground" },
  "Distinguished Engineer": { color: "text-accent", gradient: "from-accent to-accent" },
  "Codyza Fellow": { color: "text-accent", gradient: "from-accent to-accent" },
}

const RANK_XP: { name: string; minXP: number }[] = [
  { name: "Apprentice", minXP: 0 },
  { name: "Associate Engineer", minXP: 500 },
  { name: "Software Engineer", minXP: 1500 },
  { name: "Senior Engineer", minXP: 3500 },
  { name: "Staff Engineer", minXP: 7000 },
  { name: "Principal Engineer", minXP: 12000 },
  { name: "Distinguished Engineer", minXP: 20000 },
  { name: "Codyza Fellow", minXP: 35000 },
]

export default function MemberDashboard() {
  const router = useRouter()
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [crewFeed, setCrewFeed] = useState<any[]>([])
  const [myGroups, setMyGroups] = useState<any[]>([])
  const [openBounties, setOpenBounties] = useState<any[]>([])
  const [reactions, setReactions] = useState<Record<string,Record<string,string[]>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/login")
      return
    }

    const { data: contrib } = await supabase
      .from("contributors")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    // No profile yet — send them to onboarding
    if (!contrib) {
      router.replace("/onboarding")
      return
    }

    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("codyza_id", contrib.codyza_id)
      .order("submitted_at", { ascending: false })
      .limit(5)

    setContributor(contrib)

    // Load groups and bounties
    const [groupsRes, bountiesRes] = await Promise.all([
      fetch("/api/groups").then(r => r.json()),
      fetch("/api/bounties").then(r => r.json()),
    ])
    const allGroups = Array.isArray(groupsRes) ? groupsRes : []
    setMyGroups(allGroups.filter((g: any) => g.members?.some((m: any) => m.codyza_id === contrib.codyza_id)))
    setOpenBounties((Array.isArray(bountiesRes) ? bountiesRes : []).filter((b: any) => b.status === "open").slice(0, 3))

    setSubmissions(subs || [])

    const { data: feedData } = await supabase
      .from("submissions")
      .select("id, project_name, description, tech_stack, ai_score, xp_earned, codyza_id, status, created_at, github_url, live_url")
      .order("created_at", { ascending: false })
      .limit(20)
    if (feedData) {
      setCrewFeed(feedData)
      // Load reactions for feed items
      const ids = feedData.map((f: any) => f.id).filter(Boolean)
      if (ids.length) {
        const res = await fetch("/api/reactions?ids=" + ids.join(","))
        const rData = await res.json()
        setReactions(rData)
      }
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const toggleReaction = async (submissionId: string, emoji: string) => {
    if (!contributor) return
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: submissionId, codyza_id: contributor.codyza_id, emoji })
    })
    const data = await res.json()
    setReactions(prev => {
      const next = { ...prev }
      if (!next[submissionId]) next[submissionId] = {}
      if (!next[submissionId][emoji]) next[submissionId][emoji] = []
      if (data.action === "added") {
        next[submissionId][emoji] = [...next[submissionId][emoji], contributor.codyza_id]
      } else {
        next[submissionId][emoji] = next[submissionId][emoji].filter((id: string) => id !== contributor.codyza_id)
        if (!next[submissionId][emoji].length) delete next[submissionId][emoji]
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!contributor) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="mb-4 text-destructive">No contributor profile found</p>
          <button onClick={handleLogout} className="btn-ghost rounded-full px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const rankConfig = RANK_CONFIG[contributor.rank] || RANK_CONFIG["Apprentice"]

  return (
    <>
      <div className="mb-10 max-w-2xl">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          member · hub
        </p>
        <h1 className="headline-section font-[family-name:var(--font-heading)] lowercase text-foreground">
          your <span className="text-accent">dashboard</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Track progress, ship projects, and stay connected with the crew.
        </p>
      </div>

      {/* PROFILE ID CARD */}
      <div className="id-card-glow mb-8">
        <div className="id-card-inner">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-full border-2 border-border">
                {contributor.avatar_url
                  ? <img src={contributor.avatar_url + "?v=1"} alt={contributor.name} className="h-full w-full object-cover"/>
                  : <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-foreground">
                      {contributor.name.split(" ").map((p:string)=>p[0]).slice(0,2).join("").toUpperCase()}
                    </div>
                }
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{contributor.name}</span>
                  <span className={`rounded-full border border-current px-2.5 py-0.5 text-xs font-semibold ${rankConfig.color}`}>
                    {contributor.rank}
                  </span>
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tracking-wider text-foreground">
                  CZX-<span className="text-accent">{contributor.codyza_id.replace("CZX-", "")}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{contributor.email}</div>
              </div>
            </div>
            {contributor.skills && (contributor.skills as string[]).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(contributor.skills as string[]).slice(0,5).map((s: string) => (
                  <span key={s} className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">{s}</span>
                ))}
                {(contributor.skills as string[]).length > 5 && (
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{(contributor.skills as string[]).length - 5}
                  </span>
                )}
              </div>
            )}
            <Link
              href="/member/settings"
              className="btn-ghost shrink-0 rounded-lg p-2 text-muted-foreground"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="dashboard-stat">
          <div className="mb-2 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your Rank</span>
          </div>
          <p className={`font-[family-name:var(--font-heading)] text-2xl font-bold ${rankConfig.color}`}>{contributor.rank}</p>
        </div>

        <div className="dashboard-stat">
          <div className="mb-2 flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total XP</span>
          </div>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-accent">{contributor.xp.toLocaleString()}</p>
        </div>

        <div className="dashboard-stat">
          <div className="mb-2 flex items-center gap-3">
            <Target className="h-5 w-5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Streak</span>
          </div>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">{contributor.streak} weeks</p>
        </div>

        <div className="dashboard-stat">
          <div className="mb-2 flex items-center gap-3">
            <FileText className="h-5 w-5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Projects</span>
          </div>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">{submissions.length}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      {(() => {
        const currentIdx = RANK_XP.findIndex(r => r.name === contributor.rank)
        const next = RANK_XP[currentIdx + 1]
        const current = RANK_XP[currentIdx]
        const progress = next ? Math.min(100, Math.round(((contributor.xp - current.minXP) / (next.minXP - current.minXP)) * 100)) : 100
        return (
          <div className="surface-card mb-6 px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XP to next rank</span>
              <span className="font-mono text-xs text-accent">
                {next ? `${contributor.xp.toLocaleString()} / ${next.minXP.toLocaleString()} XP → ${next.name}` : "MAX RANK"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        )
      })()}

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your Groups</h2>
            <Link href="/member/groups" className="text-xs text-accent hover:opacity-80">View all →</Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {myGroups.slice(0,2).map((g: any) => (
              <div key={g.id} className="surface-card border-accent/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{g.name}</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-accent">{g.status}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(g.members||[]).slice(0,4).map((m: any, i: number) => (
                    <div key={m.codyza_id} className="flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted text-[8px] font-bold text-foreground" style={{marginLeft:i>0?"-4px":"0",zIndex:10-i}}>
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">{g.members?.length} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Bounties */}
      {openBounties.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Open Bounties</h2>
            <Link href="/member/bounties" className="text-xs text-accent hover:opacity-80">View all →</Link>
          </div>
          <div className="space-y-2">
            {openBounties.map((b: any) => (
              <div key={b.id} className="surface-card flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{b.title}</span>
                  {b.tech_tags?.length > 0 && (
                    <div className="mt-1 flex gap-1.5">
                      {b.tech_tags.slice(0,3).map((t: string) => (
                        <span key={t} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Link href="/member/bounties" className="btn-accent flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold">
                  <Zap className="h-3 w-3" />+{b.xp_reward} XP
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/member/projects" className="surface-card group p-6 transition-colors hover:border-accent/30">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-3 transition-colors group-hover:bg-accent/15">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">Submit New Project</h3>
              <p className="text-sm text-muted-foreground">Get AI review and earn XP</p>
            </div>
          </div>
        </Link>

        <Link href={`/contributor/${contributor.codyza_id.toLowerCase()}`} className="surface-card group p-6 transition-colors hover:border-accent/30">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-border bg-muted p-3 transition-colors group-hover:bg-accent/10">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-foreground">View Public Profile</h3>
              <p className="text-sm text-muted-foreground">See how others see you</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Crew Feed */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Crew Activity</h2>
          <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-xs text-success">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success"></span>
            Live
          </span>
        </div>
        {crewFeed.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {crewFeed.map((item, i) => {
              const scoreClass = item.ai_score >= 8 ? "text-success" : item.ai_score >= 6 ? "text-accent" : "text-muted-foreground"
              const isOwn = item.codyza_id === contributor?.codyza_id
              return (
                <div key={i} className={`surface-card flex items-start gap-4 p-4 transition-all ${isOwn ? "border-accent/20 bg-accent/5" : ""}`}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                    {item.codyza_id?.replace("CZX-","")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-accent">{item.codyza_id}</span>
                      {isOwn && <span className="text-xs text-muted-foreground">· you</span>}
                      <span className={`ml-auto rounded px-2 py-0.5 text-xs font-bold ${
                        item.status === "approved" ? "bg-success/10 text-success" : item.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mb-1 text-sm font-semibold text-foreground">{item.project_name}</p>
                    <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {item.tech_stack?.slice(0,3).map((t: string) => (
                        <span key={t} className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      {item.ai_score && (
                        <span className={`text-xs font-bold ${scoreClass}`}>{item.ai_score}/10</span>
                      )}
                      <span className="text-xs font-semibold text-accent">+{item.xp_earned} XP</span>
                    </div>
                    {item.id && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {["🔥","⚡","🚀","💜","👏"].map((label) => {
                          const reacters = reactions[item.id]?.[label] || []
                          const reacted = reacters.includes(contributor?.codyza_id || "")
                          return (
                            <button key={label} onClick={() => toggleReaction(item.id, label)}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-all ${
                                reacted
                                  ? "border-accent/50 bg-accent/10 font-bold text-accent"
                                  : "border-border bg-muted/50 text-muted-foreground hover:border-accent/30"
                              }`}>
                              <span className="text-[13px]">{label}</span>
                              {reacters.length > 0 && (
                                <span className={`text-[10px] font-bold ${reacted ? "text-accent" : "text-muted-foreground"}`}>
                                  {reacters.length}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}