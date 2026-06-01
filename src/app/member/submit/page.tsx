"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, CheckCircle, Star, AlertTriangle, Map, Zap, BookOpen, ExternalLink, Trophy, Flame } from "lucide-react"

const TECH_OPTIONS = [
  "Next.js","React","TypeScript","Python","Node.js","Tailwind CSS",
  "MongoDB","Supabase","PostgreSQL","Prisma","GraphQL","REST API",
  "Docker","AWS","Vercel","Cloudflare","Gemini AI","OpenAI",
  "Claude API","React Native","Vue.js","Django","FastAPI","Rust","Go"
]

function ScoreRing({ score }: { score: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = ((score / 10) * 100 / 100) * circ
  const color = score >= 8 ? "#22c55e" : score >= 6 ? "#8b5cf6" : "#f59e0b"
  return (
    <div style={{ position:"relative", width:120, height:120 }}>
      <svg width="120" height="120" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 8px ${color})` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:28, fontWeight:900, color }}>{score}</span>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>/10</span>
      </div>
    </div>
  )
}

function ReviewSection({ icon, title, color, children }: { icon: React.ReactNode, title: string, color: string, children: React.ReactNode }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${color}30`, borderRadius:14, padding:"20px 22px", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`${color}18`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", color }}>
          {icon}
        </div>
        <span style={{ fontWeight:700, fontSize:11, textTransform:"uppercase" as const, letterSpacing:"1.5px", color:"rgba(255,255,255,0.45)" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

export default function MemberSubmitPage() {
  const router = useRouter()
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTech, setSelectedTech] = useState<string[]>([])

  useEffect(() => { loadUser() }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    const { data: contrib } = await supabase.from("contributors").select("*").eq("email", user.email).single()
    setContributor(contrib)
    setLoading(false)
  }

  const toggleTech = (tech: string) => {
    if (selectedTech.includes(tech)) setSelectedTech(selectedTech.filter(t => t !== tech))
    else if (selectedTech.length < 8) setSelectedTech([...selectedTech, tech])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codyza_id: contributor.codyza_id, project_name: projectName, github_url: githubUrl, live_url: liveUrl || null, description, tech_stack: selectedTech }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Submission failed"); setSubmitting(false); return }
      setResult(data)
      setSubmitting(false)
    } catch { setError("Network error. Please try again."); setSubmitting(false) }
  }

  const resetForm = () => {
    setResult(null); setProjectName(""); setGithubUrl("")
    setLiveUrl(""); setDescription(""); setSelectedTech([])
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  if (result) {
    const review = result.ai_review || {}
    const score = result.ai_score
    const scoreColor = score >= 8 ? "#22c55e" : score >= 6 ? "#8b5cf6" : "#f59e0b"
    const scoreLabel = score >= 9 ? "Exceptional" : score >= 8 ? "Excellent" : score >= 6 ? "Solid Work" : "Good Start"

    return (
      <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 20px", color:"#f8fafc" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <CheckCircle size={52} style={{ color:"#22c55e", margin:"0 auto 12px" }} />
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:6 }}>Project Submitted!</h1>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, marginBottom:16 }}>
            Full AI review below, {contributor.name}
          </p>
          {review.one_liner && (
            <div style={{ display:"inline-block", padding:"10px 20px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:20, fontSize:13, color:"#a78bfa", fontStyle:"italic" }}>
              &ldquo;{review.one_liner}&rdquo;
            </div>
          )}
        </div>

        {/* Score + XP */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:20, display:"flex", alignItems:"center", gap:20 }}>
            <ScoreRing score={score} />
            <div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>AI Score</p>
              <p style={{ fontSize:22, fontWeight:900, color:scoreColor }}>{scoreLabel}</p>
            </div>
          </div>
          <div style={{ background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:14, padding:20 }}>
            <p style={{ fontSize:11, color:"#22c55e", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10 }}>XP Earned</p>
            <p style={{ fontSize:44, fontWeight:900, color:"#22c55e", lineHeight:1 }}>+{result.xp_breakdown.total}</p>
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.4)" }}><span>Base</span><span style={{ color:"#a78bfa" }}>+{result.xp_breakdown.base}</span></div>
              {result.xp_breakdown.deploy > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.4)" }}><span>Live deploy</span><span style={{ color:"#67e8f9" }}>+{result.xp_breakdown.deploy}</span></div>}
              {result.xp_breakdown.quality > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.4)" }}><span>Quality bonus</span><span style={{ color:"#22c55e" }}>+{result.xp_breakdown.quality}</span></div>}
              {result.xp_breakdown.streak > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.4)" }}><span>Streak bonus</span><span style={{ color:"#f59e0b" }}>+{result.xp_breakdown.streak}</span></div>}
            </div>
          </div>
        </div>

        {/* Rank */}
        <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:14, padding:"16px 20px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Trophy size={20} style={{ color:"#a78bfa" }} />
            <div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>Current Rank</p>
              <p style={{ fontSize:18, fontWeight:800 }}>{result.new_rank} {result.rank_up && "🎉"}</p>
              {result.rank_up && <p style={{ fontSize:11, color:"#a78bfa" }}>You ranked up!</p>}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>Total XP</p>
            <p style={{ fontSize:28, fontWeight:900, color:"#f59e0b" }}>{result.new_total_xp.toLocaleString()}</p>
          </div>
          {result.streak > 1 && (
            <div style={{ textAlign:"right" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
                <Flame size={16} style={{ color:"#f97316" }} />
                <span style={{ fontSize:18, fontWeight:800, color:"#f97316" }}>{result.streak}</span>
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>streak</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {review.summary && (
          <ReviewSection icon={<BookOpen size={14}/>} title="Project Summary" color="#67e8f9">
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.75 }}>{review.summary}</p>
          </ReviewSection>
        )}

        {/* Strengths */}
        {review.strengths?.length > 0 && (
          <ReviewSection icon={<Star size={14}/>} title="What Works Well" color="#22c55e">
            <ul style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {review.strengths.map((s: string, i: number) => (
                <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", flexShrink:0, marginTop:6, boxShadow:"0 0 6px #22c55e", display:"inline-block" }}/>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65 }}>{s}</span>
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {/* Improvements */}
        {review.improvements?.length > 0 && (
          <ReviewSection icon={<AlertTriangle size={14}/>} title="What Needs Work" color="#f59e0b">
            <ul style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {review.improvements.map((s: string, i: number) => (
                <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", flexShrink:0, marginTop:6, display:"inline-block" }}/>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65 }}>{s}</span>
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {/* Roadmap */}
        {review.roadmap?.length > 0 && (
          <ReviewSection icon={<Map size={14}/>} title="Improvement Roadmap" color="#a78bfa">
            <ol style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {review.roadmap.map((s: string, i: number) => (
                <li key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ width:22, height:22, borderRadius:6, flexShrink:0, background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#a78bfa" }}>{i+1}</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65 }}>{s}</span>
                </li>
              ))}
            </ol>
          </ReviewSection>
        )}

        {/* Score breakdown bars */}
        {review.xp_breakdown && (
          <ReviewSection icon={<Zap size={14}/>} title="Score Breakdown" color="#f59e0b">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {Object.entries(review.xp_breakdown).map(([key, val]) => {
                const maxMap: Record<string,number> = { code_quality:40, originality:35, completeness:25, documentation:20 }
                const maxVal = maxMap[key] || 40
                const pct = Math.round(((val as number)/maxVal)*100)
                const label = key.replace(/_/g," ").replace(/\b\w/g, (l:string) => l.toUpperCase())
                return (
                  <div key={key} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11 }}>
                      <span style={{ color:"rgba(255,255,255,0.5)" }}>{label}</span>
                      <span style={{ color:"#f59e0b", fontWeight:700 }}>{val as number}/{maxVal}</span>
                    </div>
                    <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2, width:`${pct}%`, background:"linear-gradient(90deg,#f59e0b,#f97316)", boxShadow:"0 0 8px rgba(245,158,11,0.4)" }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </ReviewSection>
        )}

        {/* References */}
        {review.references?.length > 0 && (
          <ReviewSection icon={<ExternalLink size={14}/>} title="Study These" color="#67e8f9">
            <ul style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {review.references.map((s: string, i: number) => (
                <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#67e8f9", flexShrink:0, marginTop:6, display:"inline-block" }}/>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65 }}>{s}</span>
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {/* Overall verdict */}
        {result.ai_feedback && (
          <div style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.2)", borderLeft:"3px solid #8b5cf6", borderRadius:14, padding:"18px 22px", marginBottom:24 }}>
            <p style={{ fontSize:11, color:"#a78bfa", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>Overall Verdict</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.75 }}>{result.ai_feedback}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:12 }}>
          <Link href="/member" style={{ flex:1, padding:14, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, textAlign:"center", fontWeight:600, fontSize:14, color:"#f8fafc", textDecoration:"none" }}>
            Back to Dashboard
          </Link>
          <button onClick={resetForm} style={{ flex:1, padding:14, background:"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:12, fontWeight:600, fontSize:14, color:"#fff", cursor:"pointer" }}>
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/member" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
        <p className="text-gray-400">Get a full AI code review, earn XP, climb the leaderboard.</p>
        <p className="text-sm text-purple-400 mt-2">Submitting as {contributor?.codyza_id}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">PROJECT NAME *</label>
          <input type="text" required value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Awesome Project" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">GITHUB REPOSITORY URL *</label>
          <input type="url" required value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">LIVE URL <span className="text-green-400">(+150 XP)</span></label>
          <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://myproject.vercel.app" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">PROJECT DESCRIPTION *</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your project do? What problem does it solve? What did you learn?" rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 resize-none"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">TECH STACK <span className="text-gray-400">(up to 8)</span></label>
          <div className="flex flex-wrap gap-2">
            {TECH_OPTIONS.map((tech) => (
              <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedTech.includes(tech) ? "bg-purple-500/30 border border-purple-500 text-purple-300" : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/30"}`}>{tech}</button>
            ))}
          </div>
        </div>
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-400 font-semibold text-sm mb-1">🤖 Full AI Review included</p>
          <p className="text-gray-400 text-sm">Summary · Strengths · Issues · Roadmap · Score breakdown · References</p>
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-semibold text-sm mb-1">XP you can earn:</p>
          <p className="text-gray-400 text-sm">Base +100 · Live URL +150 · Quality up to +300 · Streak up to +200</p>
        </div>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          <Send className="w-5 h-5"/>
          {submitting ? "Getting AI Review..." : "Submit & Get Full AI Review"}
        </button>
      </form>
    </div>
  )
}
