"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, GitBranch as Github, Globe, Send, CheckCircle, Star, Zap, Flame, ArrowLeft, Loader2, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

const TECH_OPTIONS = ["Next.js", "React", "TypeScript", "Python", "Node.js", "Tailwind CSS", "MongoDB", "Supabase", "PostgreSQL", "Prisma", "GraphQL", "REST API", "Docker", "AWS", "Vercel", "Cloudflare", "Gemini AI", "OpenAI", "Claude API", "React Native", "Vue.js", "Django", "FastAPI", "Rust", "Go"]

interface SubmitResult {
  success: boolean
  contributor_name: string
  ai_score: number
  ai_feedback: string
  xp_breakdown: { base: number; deploy: number; quality: number; streak: number; total: number }
  new_total_xp: number
  new_rank: string
  rank_up: boolean
  streak: number
}

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    codyza_id: "",
    project_name: "",
    github_url: "",
    live_url: "",
    description: "",
    tech_stack: [] as string[],
  })

  const toggleTech = (tech: string) => {
    setForm(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : prev.tech_stack.length < 8 ? [...prev.tech_stack, tech] : prev.tech_stack
    }))
  }

  const handleSubmit = async () => {
    if (!form.codyza_id || !form.project_name || !form.github_url || !form.description) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Submission failed.")
        setLoading(false)
        return
      }
      setResult(data)
      setStep(3)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(5,5,8,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "white" }}>
          <ArrowLeft size={16} />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>Back to Codyza</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />
          <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>Submit Your Project</span>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        {step !== 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
              <Code2 size={12} color="#8b5cf6" />
              <span style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2 }}>Codyza Contributor Portal</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Submit Your Project</h1>
            <p style={{ color: "#64748b", fontSize: 15 }}>Get reviewed by AI, earn XP, climb the leaderboard.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s ? "#8b5cf6" : "rgba(255,255,255,0.05)", border: `1px solid ${step >= s ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: step >= s ? "white" : "#64748b" }}>
                    {s}
                  </div>
                  <span style={{ fontSize: 12, color: step >= s ? "white" : "#64748b" }}>{s === 1 ? "Your ID" : "Project Details"}</span>
                  {s < 2 && <div style={{ width: 40, height: 1, background: step > s ? "#8b5cf6" : "rgba(255,255,255,0.1)" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Enter your Codyza ID</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Your unique ID was sent to you when you joined Codyza. Format: CZX-0042</p>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Codyza ID *</label>
                  <input
                    value={form.codyza_id}
                    onChange={e => setForm(prev => ({ ...prev, codyza_id: e.target.value.toUpperCase() }))}
                    placeholder="CZX-0042"
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 18, color: "white", outline: "none", fontFamily: "monospace", letterSpacing: 2, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: "#8b5cf6", margin: 0 }}>💡 Don't have a Codyza ID yet? Apply at codyza.com to join the ecosystem and get your unique ID.</p>
                </div>

                {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</p>}

                <button
                  onClick={() => { if (!form.codyza_id.trim()) { setError("Please enter your Codyza ID."); return; } setError(""); setStep(2) }}
                  style={{ width: "100%", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer" }}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Project Details</h2>
                    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Submitting as <span style={{ color: "#8b5cf6", fontFamily: "monospace" }}>{form.codyza_id}</span></p>
                  </div>
                  <button onClick={() => setStep(1)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#64748b", cursor: "pointer" }}>← Back</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Project Name *</label>
                    <input value={form.project_name} onChange={e => setForm(prev => ({ ...prev, project_name: e.target.value }))} placeholder="My Awesome Project" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "white", outline: "none", boxSizing: "border-box" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>GitHub Repository URL *</label>
                    <div style={{ position: "relative" }}>
                      <Github size={14} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                      <input value={form.github_url} onChange={e => setForm(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/username/repo" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px 11px 34px", fontSize: 14, color: "white", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Live URL <span style={{ color: "#64748b", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(+150 XP bonus)</span></label>
                    <div style={{ position: "relative" }}>
                      <Globe size={14} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                      <input value={form.live_url} onChange={e => setForm(prev => ({ ...prev, live_url: e.target.value }))} placeholder="https://myproject.vercel.app" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px 11px 34px", fontSize: 14, color: "white", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Project Description *</label>
                    <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="What does your project do? What problem does it solve? What did you learn building it?" rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "white", outline: "none", resize: "vertical", fontFamily: "system-ui", lineHeight: 1.6, boxSizing: "border-box" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tech Stack <span style={{ color: "#64748b", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(select up to 8)</span></label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {TECH_OPTIONS.map(tech => (
                        <button key={tech} onClick={() => toggleTech(tech)} style={{ background: form.tech_stack.includes(tech) ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.tech_stack.includes(tech) ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: form.tech_stack.includes(tech) ? "#c4b5fd" : "#64748b", cursor: "pointer", fontFamily: "monospace" }}>
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: 14, margin: "20px 0" }}>
                  <p style={{ fontSize: 12, color: "#22c55e", margin: "0 0 4px", fontWeight: 600 }}>XP you can earn this submission:</p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Base: +100 · Live URL: +150 · AI Quality Bonus: up to +300 · Streak Bonus: up to +200</p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "#475569", margin: 0, lineHeight: 1.6 }}>By submitting, you agree that your work may be showcased by Codyza. Codyza does not provide monetary compensation. All submissions are reviewed for quality and originality.</p>
                </div>

                {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</p>}

                <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8b5cf6, #3b82f6)", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, color: "white", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> AI is reviewing your project...</> : <><Send size={15} /> Submit & Get AI Review</>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && result && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle size={36} color="#22c55e" />
                </motion.div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Submission Accepted!</h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>Great work, <span style={{ color: "white", fontWeight: 600 }}>{result.contributor_name}</span>!</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>AI Score</div>
                  <div style={{ fontSize: 48, fontWeight: 800, color: result.ai_score >= 8 ? "#22c55e" : result.ai_score >= 6 ? "#f59e0b" : "#94a3b8" }}>{result.ai_score}<span style={{ fontSize: 20, color: "#64748b" }}>/10</span></div>
                </div>
                <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>XP Earned</div>
                  <div style={{ fontSize: 48, fontWeight: 800, color: "#22c55e" }}>+{result.xp_breakdown.total}</div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>XP Breakdown</div>
                {[
                  { label: "Base submission", xp: result.xp_breakdown.base, color: "#8b5cf6" },
                  { label: "Live deployment", xp: result.xp_breakdown.deploy, color: "#3b82f6" },
                  { label: "Quality bonus (AI)", xp: result.xp_breakdown.quality, color: "#22c55e" },
                  { label: "Streak bonus", xp: result.xp_breakdown.streak, color: "#f59e0b" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.xp > 0 ? item.color : "#374151" }}>+{item.xp} XP</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>AI Feedback</div>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>{result.ai_feedback}</p>
              </div>

              <div style={{ background: result.rank_up ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${result.rank_up ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: 20, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Current Rank</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{result.new_rank} {result.rank_up && "🎉"}</div>
                  {result.rank_up && <div style={{ fontSize: 12, color: "#8b5cf6", marginTop: 2 }}>Rank up!</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Total XP</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#8b5cf6" }}>{result.new_total_xp.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/" style={{ flex: 1 }}>
                  <button style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", fontSize: 14, color: "white", cursor: "pointer" }}>Back to Codyza</button>
                </Link>
                <button onClick={() => { setStep(1); setForm({ codyza_id: form.codyza_id, project_name: "", github_url: "", live_url: "", description: "", tech_stack: [] }); setResult(null) }} style={{ flex: 1, background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer" }}>
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
