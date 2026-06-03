"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, Zap, Target, Calendar, Award, FileText, Settings } from "lucide-react"

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
}

interface Submission {
  id: string
  project_name: string
  xp_earned: number
  status: string
  submitted_at: string
}

const RANK_CONFIG: Record<string, { color: string; gradient: string }> = {
  "Apprentice": { color: "text-slate-400", gradient: "from-slate-600 to-slate-400" },
  "Associate Engineer": { color: "text-green-400", gradient: "from-green-600 to-green-400" },
  "Software Engineer": { color: "text-blue-400", gradient: "from-blue-600 to-blue-400" },
  "Senior Engineer": { color: "text-purple-400", gradient: "from-purple-600 to-purple-400" },
  "Staff Engineer": { color: "text-amber-400", gradient: "from-amber-600 to-amber-400" },
  "Principal Engineer": { color: "text-red-400", gradient: "from-red-600 to-red-400" },
  "Distinguished Engineer": { color: "text-cyan-400", gradient: "from-cyan-600 to-cyan-400" },
  "Codyza Fellow": { color: "text-yellow-400", gradient: "from-yellow-600 to-yellow-400" },
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
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!contributor) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">No contributor profile found</p>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const rankConfig = RANK_CONFIG[contributor.rank] || RANK_CONFIG["Apprentice"]

  return (
    <>
      {/* Hub Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PROFILE ID CARD */}
        <div className="mb-8" style={{borderRadius:16,padding:"1.5px",background:"linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)",boxShadow:"0 0 32px rgba(139,92,246,0.15)"}}>
          <div style={{borderRadius:"14.5px",background:"linear-gradient(135deg,#0a0a14,#050508)",padding:"20px 24px"}}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${rankConfig.gradient?.split(" ")[1] ?? "#8b5cf6"}, #111827)` }}
                >
                  {contributor.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                {/* Identity */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-bold text-white">{contributor.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rankConfig.color} border border-current`} style={{ borderColor: "currentColor", background: "transparent" }}>
                      {contributor.rank}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold tracking-wider text-white">
                    CZX-<span className="text-gradient-codyza">{contributor.codyza_id.replace("CZX-", "")}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{contributor.email}</div>
                </div>
              </div>
              {/* Skills on card */}
              {contributor.skills && (contributor.skills as string[]).length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                  {(contributor.skills as string[]).slice(0,5).map((s: string) => (
                    <span key={s} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.2)", color:"#a78bfa" }}>{s}</span>
                  ))}
                  {(contributor.skills as string[]).length > 5 && <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.3)" }}>+{(contributor.skills as string[]).length - 5}</span>}
                </div>
              )}

              {/* Settings link */}
              <Link
                href="/member/settings"
                className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-white"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-purple-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Your Rank</span>
            </div>
            <p className={`text-2xl font-bold ${rankConfig.color}`}>{contributor.rank}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-yellow-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{contributor.xp.toLocaleString()}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-orange-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="text-gray-400 text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{contributor.streak} weeks</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-blue-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Projects</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{submissions.length}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        {(() => {
          const currentIdx = RANK_XP.findIndex(r => r.name === contributor.rank)
          const next = RANK_XP[currentIdx + 1]
          const current = RANK_XP[currentIdx]
          const progress = next ? Math.min(100, Math.round(((contributor.xp - current.minXP) / (next.minXP - current.minXP)) * 100)) : 100
          return (
            <div className="mb-6 bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">XP to next rank</span>
                <span className="text-xs font-mono" style={{color:"#8b5cf6"}}>{next ? `${contributor.xp.toLocaleString()} / ${next.minXP.toLocaleString()} XP → ${next.name}` : "MAX RANK"}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{width:`${progress}%`,background:"linear-gradient(90deg,#8b5cf6,#06b6d4)",boxShadow:"0 0 8px rgba(139,92,246,0.5)"}}/>
              </div>
            </div>
          )
        })()}

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">Your Groups</h2>
              <Link href="/member/groups" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myGroups.slice(0,2).map((g: any) => (
                <div key={g.id} className="bg-white/[0.03] border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{g.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">{g.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(g.members||[]).slice(0,4).map((m: any, i: number) => (
                      <div key={m.codyza_id} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{background:`linear-gradient(135deg,#8b5cf6,#3b82f6)`,marginLeft:i>0?"-4px":"0",zIndex:10-i,border:"1.5px solid #050508"}}>
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{g.members?.length} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Bounties */}
        {openBounties.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">Open Bounties</h2>
              <Link href="/member/bounties" className="text-xs text-yellow-400 hover:text-yellow-300">View all →</Link>
            </div>
            <div className="space-y-2">
              {openBounties.map((b: any) => (
                <div key={b.id} className="bg-white/[0.03] border border-yellow-500/15 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">{b.title}</span>
                    {b.tech_tags?.length > 0 && (
                      <div className="flex gap-1.5 mt-1">
                        {b.tech_tags.slice(0,3).map((t: string) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] border border-white/[0.07] text-gray-400">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link href="/member/bounties" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-colors">
                    <Zap className="w-3 h-3" />+{b.xp_reward} XP
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/member/projects" className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-purple-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Submit New Project</h3>
                <p className="text-sm text-gray-400">Get AI review and earn XP</p>
              </div>
            </div>
          </Link>

          <Link href={`/contributor/${contributor.codyza_id.toLowerCase()}`} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Public Profile</h3>
                <p className="text-sm text-gray-400">See how others see you</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Crew Feed */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">Crew Activity</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{animation:"pulse 2s infinite"}}></span>
              Live
            </span>
          </div>
          {crewFeed.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {crewFeed.map((item, i) => {
                const scoreColor = item.ai_score >= 8 ? "#22c55e" : item.ai_score >= 6 ? "#a78bfa" : "#f59e0b"
                const isOwn = item.codyza_id === contributor?.codyza_id
                return (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isOwn ? "border-purple-500/20 bg-purple-500/[0.04]" : "border-white/8 bg-white/[0.02]"}`}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                      {item.codyza_id?.replace("CZX-","")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-purple-400">{item.codyza_id}</span>
                        {isOwn && <span className="text-xs text-gray-500">· you</span>}
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${item.status === "approved" ? "bg-green-500/10 text-green-400" : item.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="font-semibold text-sm mb-1">{item.project_name}</p>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.tech_stack?.slice(0,3).map((t: string) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-white/5 border border-white/8 text-gray-400">{t}</span>
                        ))}
                        <span className="text-xs text-gray-500 ml-auto font-mono">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.ai_score && (
                          <span style={{color: scoreColor}} className="text-xs font-bold">{item.ai_score}/10</span>
                        )}
                        <span className="text-xs text-yellow-400 font-semibold">+{item.xp_earned} XP</span>
                      </div>
                      {/* Reactions */}
                      {item.id && (
                        <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap" }}>
                          {[
                            {key:"fire",label:"🔥",color:"#f97316"},
                            {key:"zap",label:"⚡",color:"#f59e0b"},
                            {key:"rocket",label:"🚀",color:"#3b82f6"},
                            {key:"heart",label:"💜",color:"#8b5cf6"},
                            {key:"clap",label:"👏",color:"#22c55e"},
                          ].map(({key,label,color}) => {
                            const reacters = reactions[item.id]?.[label] || []
                            const reacted = reacters.includes(contributor?.codyza_id || "")
                            return (
                              <button key={key} onClick={() => toggleReaction(item.id, label)}
                                style={{
                                  padding:"3px 10px", borderRadius:8, fontSize:11, cursor:"pointer",
                                  background: reacted ? `${color}22` : "rgba(255,255,255,0.03)",
                                  border: reacted ? `1px solid ${color}50` : "1px solid rgba(255,255,255,0.07)",
                                  transition:"all 0.15s", display:"flex", alignItems:"center", gap:5,
                                  color: reacted ? color : "rgba(255,255,255,0.4)",
                                  fontWeight: reacted ? 700 : 400,
                                }}>
                                <span style={{fontSize:13}}>{label}</span>
                                {reacters.length > 0 && <span style={{fontSize:10,fontWeight:700,color:reacted?color:"rgba(255,255,255,0.3)"}}>{reacters.length}</span>}
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


      </div>


    </>
  )
}