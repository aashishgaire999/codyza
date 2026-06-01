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

export default function MemberDashboard() {
  const router = useRouter()
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [crewFeed, setCrewFeed] = useState<any[]>([])
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
        <div className="mb-8 profile-card-glow">
          <div className="profile-card-inner">
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
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Your Rank</span>
            </div>
            <p className={`text-2xl font-bold ${rankConfig.color}`}>{contributor.rank}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{contributor.xp.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="text-gray-400 text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{contributor.streak} weeks</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Projects</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{submissions.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/member/submit" className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
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

          <Link href={`/contributor/${contributor.codyza_id.toLowerCase()}`} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
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
                          {["🔥","⚡","🚀","💜","👏"].map(emoji => {
                            const reacters = reactions[item.id]?.[emoji] || []
                            const reacted = reacters.includes(contributor?.codyza_id || "")
                            return (
                              <button key={emoji} onClick={() => toggleReaction(item.id, emoji)}
                                style={{
                                  padding:"3px 8px", borderRadius:8, fontSize:12, cursor:"pointer",
                                  background: reacted ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                                  border: reacted ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                  transition:"all 0.15s", display:"flex", alignItems:"center", gap:4
                                }}>
                                {emoji}
                                {reacters.length > 0 && <span style={{ fontSize:10, color: reacted ? "#a78bfa" : "rgba(255,255,255,0.4)", fontWeight:600 }}>{reacters.length}</span>}
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

        {/* Recent Submissions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No submissions yet. Submit your first project to get started!</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-semibold">{sub.project_name}</p>
                    <p className="text-sm text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold">
                      +{sub.xp_earned} XP
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm ${
                      sub.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      sub.status === "approved" ? "bg-green-500/20 text-green-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-card-glow {
          position: relative;
          border-radius: 16px;
          padding: 1.5px;
          overflow: hidden;
          isolation: isolate;
        }
        .profile-card-glow::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #22c55e, #8b5cf6);
          transform: translate(-50%, -50%) rotate(0deg);
          animation: spin-profile 8s linear infinite;
          z-index: -1;
        }
        .profile-card-inner {
          position: relative;
          border-radius: 14.5px;
          background: linear-gradient(135deg, #0a0a14 0%, #050508 100%);
          padding: 20px 24px;
          z-index: 1;
        }
        @keyframes spin-profile {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </>
  )
}