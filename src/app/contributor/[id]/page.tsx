import { Metadata } from "next"
import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { ArrowLeft, GitBranch, Globe, Zap, Flame, Trophy, Calendar, Copy } from "lucide-react"
import { SmartNavbar } from "@/components/shared/smart-navbar"

interface Props { params: Promise<{ id: string }> }

const RANK_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "Apprentice":             { color:"#94a3b8", bg:"rgba(148,163,184,0.1)",  border:"rgba(148,163,184,0.25)" },
  "Associate Engineer":     { color:"#34d399", bg:"rgba(52,211,153,0.1)",   border:"rgba(52,211,153,0.25)" },
  "Software Engineer":      { color:"#60a5fa", bg:"rgba(96,165,250,0.1)",   border:"rgba(96,165,250,0.25)" },
  "Senior Engineer":        { color:"#a78bfa", bg:"rgba(167,139,250,0.1)",  border:"rgba(167,139,250,0.25)" },
  "Staff Engineer":         { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",   border:"rgba(251,191,36,0.25)" },
  "Principal Engineer":     { color:"#f87171", bg:"rgba(248,113,113,0.1)",  border:"rgba(248,113,113,0.25)" },
  "Distinguished Engineer": { color:"#22d3ee", bg:"rgba(34,211,238,0.1)",   border:"rgba(34,211,238,0.25)" },
  "Codyza Fellow":          { color:"#fde68a", bg:"rgba(253,230,138,0.1)",  border:"rgba(253,230,138,0.3)" },
}

const RANK_XP = [
  { name:"Apprentice", minXP:0 },
  { name:"Associate Engineer", minXP:500 },
  { name:"Software Engineer", minXP:1500 },
  { name:"Senior Engineer", minXP:3500 },
  { name:"Staff Engineer", minXP:7000 },
  { name:"Principal Engineer", minXP:12000 },
  { name:"Distinguished Engineer", minXP:20000 },
  { name:"Codyza Fellow", minXP:35000 },
]

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

  const { data: contributor, error } = await supabase.from("contributors").select("*").eq("codyza_id", id).single()
  if (error || !contributor) notFound()

  const { data: submissions } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, ai_score, xp_earned, status, created_at")
    .eq("codyza_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const rankCfg = RANK_CONFIG[contributor.rank] || RANK_CONFIG["Apprentice"]
  const currentRankIdx = RANK_XP.findIndex(r => r.name === contributor.rank)
  const currentRank = RANK_XP[currentRankIdx]
  const nextRank = RANK_XP[currentRankIdx + 1]
  const xpProgress = nextRank
    ? Math.min(100, Math.round(((contributor.xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100))
    : 100
  const initials = contributor.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
  const joinedDate = contributor.joined_at
    ? new Date(contributor.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2026"
  const profileUrl = `codyza.com/contributor/${contributor.codyza_id.toLowerCase()}`

  return (
    <div className="min-h-screen bg-[#050508] text-white" style={{ overflow: "hidden" }}>
      <SmartNavbar />

      {/* Background animation */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position:"absolute", top:"-20%", left:"-10%",
          width:600, height:600, borderRadius:"50%",
          background:`radial-gradient(circle, ${rankCfg.color}15 0%, transparent 70%)`,
          animation:"orb-float 14s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"-10%", right:"-10%",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          animation:"orb-float 16s ease-in-out infinite reverse",
        }}/>
        <div style={{
          position:"absolute", top:"40%", right:"20%",
          width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          animation:"orb-float 12s ease-in-out infinite 2s",
        }}/>
        <div className="absolute inset-0 grid-overlay" style={{ opacity: 0.4 }}/>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-10" style={{ zIndex: 1 }}>
        <Link href="/leaderboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
        </Link>

        {/* PROFILE CARD */}
        <div style={{ borderRadius:20, padding:2, background:`linear-gradient(135deg, ${rankCfg.color}, #3b82f6, #06b6d4)`, marginBottom:16, boxShadow:`0 0 40px ${rankCfg.color}20` }}>
          <div style={{ background:"rgba(5,5,8,0.95)", borderRadius:18, padding:"28px 32px", backdropFilter:"blur(20px)" }}>

            {/* Top row */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div style={{
                  width:76, height:76, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg, ${rankCfg.color}30, #111827)`,
                  border:`2px solid ${rankCfg.border}`,
                  boxShadow:`0 0 24px ${rankCfg.color}25`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, fontWeight:900,
                }}>{initials}</div>
                <div>
                  <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:"-0.5px", marginBottom:4 }}>{contributor.name}</h1>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:700, letterSpacing:3, marginBottom:8 }}>
                    <span style={{ color:"rgba(255,255,255,0.5)" }}>CZX-</span>
                    <span className="text-gradient-codyza">{contributor.codyza_id.replace("CZX-","")}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:700, background:rankCfg.bg, border:`1px solid ${rankCfg.border}`, color:rankCfg.color }}>
                      {contributor.rank}
                    </span>
                    {contributor.role && <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{contributor.role}</span>}
                  </div>
                </div>
              </div>

              {/* Right meta */}
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color:"rgba(255,255,255,0.25)" }}/>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Joined {joinedDate}</span>
                </div>
                {contributor.github && (
                  <a href={`https://github.com/${contributor.github}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                    <GitBranch size={13}/> @{contributor.github}
                  </a>
                )}
                {contributor.streak > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Flame size={13} style={{ color:"#f97316" }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:"#f97316" }}>{contributor.streak} week streak</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {contributor.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {(contributor.skills as string[]).map((s: string) => (
                  <span key={s} style={{ padding:"2px 10px", borderRadius:20, fontSize:10, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"#a78bfa" }}>{s}</span>
                ))}
              </div>
            )}

            {/* XP Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"2px", fontFamily:"monospace" }}>XP Progress</span>
                <span style={{ fontSize:11, color:rankCfg.color, fontWeight:700, fontFamily:"monospace" }}>
                  {contributor.xp.toLocaleString()} / {nextRank?.minXP.toLocaleString() || "MAX"} XP
                </span>
              </div>
              <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, width:`${xpProgress}%`, background:`linear-gradient(90deg, #8b5cf6, #06b6d4)`, boxShadow:"0 0 8px rgba(139,92,246,0.4)" }}/>
              </div>
              {nextRank && (
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:4, fontFamily:"monospace" }}>
                  {(nextRank.minXP - contributor.xp).toLocaleString()} XP until {nextRank.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          {[
            { icon: <Zap size={15}/>, color:"#f59e0b", value: contributor.xp.toLocaleString(), label:"Total XP" },
            { icon: <Trophy size={15}/>, color:rankCfg.color, value: contributor.rank.replace(" Engineer","").replace("Associate ","Assoc. "), label:"Rank" },
            { icon: <Flame size={15}/>, color:"#f97316", value: contributor.streak, label:"Streak" },
          ].map(({ icon, color, value, label }) => (
            <div key={label} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"16px", textAlign:"center" }}>
              <div style={{ color, margin:"0 auto 6px", display:"flex", justifyContent:"center" }}>{icon}</div>
              <p style={{ fontSize:20, fontWeight:900, color, marginBottom:2 }}>{value}</p>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"monospace" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* APPROVED PROJECTS */}
        <div className="mb-4">
          <h2 style={{ fontSize:11, fontWeight:700, marginBottom:12, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"2px", fontFamily:"monospace" }}>
            Approved Projects ({submissions?.length || 0})
          </h2>
          {(!submissions || submissions.length === 0) ? (
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.07)", borderRadius:14, padding:"40px", textAlign:"center" }}>
              <p style={{ color:"rgba(255,255,255,0.25)", fontSize:13 }}>No approved projects yet.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {submissions.map((sub: any, i: number) => {
                const scoreColor = sub.ai_score >= 8 ? "#22c55e" : sub.ai_score >= 6 ? "#8b5cf6" : "#f59e0b"
                return (
                  <div key={i} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px" }} className="hover:border-purple-500/25 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{sub.project_name}</h3>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.6 }}>{sub.description}</p>
                      </div>
                      {sub.ai_score && (
                        <div style={{ textAlign:"center", flexShrink:0 }}>
                          <div style={{ fontSize:20, fontWeight:900, color:scoreColor, lineHeight:1 }}>{sub.ai_score}</div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", fontFamily:"monospace" }}>/10</div>
                        </div>
                      )}
                    </div>
                    {sub.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sub.tech_stack.slice(0,6).map((t: string) => (
                          <span key={t} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.18)", color:"#a78bfa" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {sub.github_url && (
                        <a href={sub.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                          <GitBranch size={12}/> GitHub
                        </a>
                      )}
                      {sub.live_url && (
                        <a href={sub.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                          <Globe size={12}/> Live Demo
                        </a>
                      )}
                      <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.25)", fontFamily:"monospace" }}>+{sub.xp_earned} XP</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SHARE STRIP */}
        <div style={{ padding:"14px 20px", background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.12)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Share this profile</span>
          <span style={{ fontFamily:"monospace", fontSize:11, color:"#a78bfa" }}>{profileUrl}</span>
        </div>
      </div>
    </div>
  )
}
