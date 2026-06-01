import { Metadata } from "next"
import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { ArrowLeft, GitBranch, Globe, Zap, Flame, Trophy, Calendar, ExternalLink } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const RANK_CONFIG: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
  "Apprentice":            { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.3)", gradient:"from-slate-500 to-slate-400" },
  "Associate Engineer":    { color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  gradient:"from-emerald-500 to-emerald-400" },
  "Software Engineer":     { color:"#60a5fa", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.3)",  gradient:"from-blue-500 to-blue-400" },
  "Senior Engineer":       { color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.3)", gradient:"from-purple-500 to-purple-400" },
  "Staff Engineer":        { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.3)",  gradient:"from-amber-500 to-amber-400" },
  "Principal Engineer":    { color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.3)", gradient:"from-red-500 to-red-400" },
  "Distinguished Engineer":{ color:"#22d3ee", bg:"rgba(34,211,238,0.1)",  border:"rgba(34,211,238,0.3)",  gradient:"from-cyan-500 to-cyan-400" },
  "Codyza Fellow":         { color:"#fde68a", bg:"rgba(253,230,138,0.1)", border:"rgba(253,230,138,0.4)", gradient:"from-yellow-400 to-yellow-200" },
}

const NEXT_RANK: Record<string, { name: string; xp: number }> = {
  "Apprentice":             { name:"Associate Engineer",    xp:500 },
  "Associate Engineer":     { name:"Software Engineer",     xp:1500 },
  "Software Engineer":      { name:"Senior Engineer",       xp:3500 },
  "Senior Engineer":        { name:"Staff Engineer",        xp:7000 },
  "Staff Engineer":         { name:"Principal Engineer",    xp:12000 },
  "Principal Engineer":     { name:"Distinguished Engineer",xp:20000 },
  "Distinguished Engineer": { name:"Codyza Fellow",         xp:35000 },
  "Codyza Fellow":          { name:"MAX RANK",              xp:99999 },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()
  const { data } = await supabase.from("contributors").select("name, rank, role").eq("codyza_id", id).single()
  if (!data) return { title: "Contributor Not Found | Codyza" }
  return {
    title: `${data.name} (${id}) | Codyza`,
    description: `${data.name} — ${data.role || "Contributor"} at Codyza. Rank: ${data.rank}`,
  }
}

export default async function ContributorProfile({ params }: Props) {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()

  const { data: contributor, error } = await supabase
    .from("contributors")
    .select("*")
    .eq("codyza_id", id)
    .single()

  if (error || !contributor) notFound()

  const { data: submissions } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, ai_score, xp_earned, status, created_at")
    .eq("codyza_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const rankCfg = RANK_CONFIG[contributor.rank] || RANK_CONFIG["Apprentice"]
  const nextRank = NEXT_RANK[contributor.rank]
  const xpProgress = nextRank
    ? Math.min(100, Math.round((contributor.xp / nextRank.xp) * 100))
    : 100
  const initials = contributor.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
  const joinedDate = contributor.joined_at
    ? new Date(contributor.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2026"

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">C</div>
            <span className="font-bold text-sm">Codyza</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">Projects</Link>
            <Link href="/member" className="text-sm px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/leaderboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
        </Link>

        {/* ── PROFILE CARD ── */}
        <div style={{ borderRadius:16, padding:2, background:"linear-gradient(135deg,#8b5cf6,#3b82f6,#06b6d4)", marginBottom:20 }}>
          <div style={{ background:"#050508", borderRadius:14, padding:"28px 32px" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Left: avatar + info */}
              <div className="flex items-center gap-5">
                <div style={{
                  width:72, height:72, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg, ${rankCfg.color}40, #111827)`,
                  border:`2px solid ${rankCfg.border}`,
                  boxShadow:`0 0 20px ${rankCfg.color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, fontWeight:800
                }}>{initials}</div>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:900, letterSpacing:"-0.5px", marginBottom:4 }}>
                    {contributor.name}
                  </h1>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, letterSpacing:2, marginBottom:6 }}>
                    <span style={{ color:"#e2e8f0" }}>CZX-</span>
                    <span style={{ background:"linear-gradient(135deg,#a855f7,#00f5ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                      {contributor.codyza_id.replace("CZX-","")}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:rankCfg.bg, border:`1px solid ${rankCfg.border}`, color:rankCfg.color }}>
                      {contributor.rank}
                    </span>
                    {contributor.role && (
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
                        {contributor.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: quick stats */}
              <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Calendar size={13} style={{ color:"rgba(255,255,255,0.3)" }} />
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Joined {joinedDate}</span>
                </div>
                {contributor.github && (
                  <a href={`https://github.com/${contributor.github}`} target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.6)", textDecoration:"none" }}
                    className="hover:text-white transition-colors">
                    <GitBranch size={14} /> @{contributor.github}
                  </a>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {contributor.streak > 0 && (
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Flame size={14} style={{ color:"#f97316" }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"#f97316" }}>{contributor.streak}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div style={{ marginTop:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px" }}>
                  XP Progress
                </span>
                <span style={{ fontFamily:"monospace", fontSize:11, color:rankCfg.color, fontWeight:700 }}>
                  {contributor.xp.toLocaleString()} / {nextRank?.xp.toLocaleString()} XP
                </span>
              </div>
              <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:3, width:`${xpProgress}%`,
                  background:`linear-gradient(90deg, #8b5cf6, #00f5ff)`,
                  boxShadow:"0 0 10px rgba(139,92,246,0.5)",
                  transition:"width 1s ease"
                }} />
              </div>
              {nextRank && nextRank.name !== "MAX RANK" && (
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:5 }}>
                  {(nextRank.xp - contributor.xp).toLocaleString()} XP until {nextRank.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <Zap size={16} style={{ color:"#f59e0b", margin:"0 auto 6px" }} />
            <p style={{ fontSize:24, fontWeight:900, color:"#f59e0b" }}>{contributor.xp.toLocaleString()}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"monospace" }}>Total XP</p>
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <Trophy size={16} style={{ color:rankCfg.color, margin:"0 auto 6px" }} />
            <p style={{ fontSize:16, fontWeight:900, color:rankCfg.color }}>{contributor.rank}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"monospace" }}>Rank</p>
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <Flame size={16} style={{ color:"#f97316", margin:"0 auto 6px" }} />
            <p style={{ fontSize:24, fontWeight:900, color:"#f97316" }}>{contributor.streak}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"monospace" }}>Streak</p>
          </div>
        </div>

        {/* ── PROJECTS ── */}
        <div>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:14, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"monospace" }}>
            Approved Projects ({submissions?.length || 0})
          </h2>

          {(!submissions || submissions.length === 0) ? (
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:12, padding:"40px", textAlign:"center" }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>No approved projects yet.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {submissions.map((sub: any, i: number) => {
                const scoreColor = sub.ai_score >= 8 ? "#22c55e" : sub.ai_score >= 6 ? "#8b5cf6" : "#f59e0b"
                return (
                  <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"18px 20px", transition:"all 0.2s" }}
                    className="hover:border-purple-500/30">
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{sub.project_name}</h3>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>{sub.description}</p>
                      </div>
                      <div style={{ flexShrink:0, textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, color:scoreColor, lineHeight:1 }}>{sub.ai_score}</div>
                        <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>/10</div>
                      </div>
                    </div>

                    {sub.tech_stack?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                        {sub.tech_stack.slice(0,6).map((t: string) => (
                          <span key={t} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"#a78bfa" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <a href={sub.github_url} target="_blank" rel="noopener noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(255,255,255,0.5)", textDecoration:"none" }}
                        className="hover:text-white transition-colors">
                        <GitBranch size={12} /> GitHub
                      </a>
                      {sub.live_url && (
                        <a href={sub.live_url} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(255,255,255,0.5)", textDecoration:"none" }}
                          className="hover:text-white transition-colors">
                          <Globe size={12} /> Live Demo
                        </a>
                      )}
                      <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>
                        +{sub.xp_earned} XP
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── SHARE STRIP ── */}
        <div style={{ marginTop:24, padding:"14px 20px", background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
            Share this profile
          </span>
          <span style={{ fontFamily:"monospace", fontSize:11, color:"#a78bfa" }}>
            codyza.com/contributor/{contributor.codyza_id.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
