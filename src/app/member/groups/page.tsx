"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Users, GitBranch, Globe, ChevronRight, Clock, CheckCircle, Zap, Hammer, Eye } from "lucide-react"
import Link from "next/link"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  planning:  { label: "Planning",  color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: Clock },
  building:  { label: "Building",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  icon: Hammer },
  review:    { label: "In Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Eye },
  submitted: { label: "Submitted", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: ChevronRight },
  live:      { label: "Live",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",   icon: CheckCircle },
}

const ROLE_COLORS: Record<string, string> = {
  pm:       "#f59e0b",
  frontend: "#3b82f6",
  backend:  "#8b5cf6",
  design:   "#ec4899",
  devops:   "#06b6d4",
  ai:       "#22c55e",
  member:   "#94a3b8",
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
}

function getAvatarBg(id: string) {
  const colors = [
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
    "linear-gradient(135deg,#f97316,#ea580c)",
  ]
  return colors[parseInt(id.replace(/\D/g, "").slice(-1) || "0") % colors.length]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { window.location.href = "/login"; return }

    const { data: contrib } = await supabase
      .from("contributors")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    setContributor(contrib)

    const res = await fetch("/api/groups")
    const data = await res.json()
    setGroups(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const myGroups = groups.filter(g =>
    g.members?.some((m: any) => m.codyza_id === contributor?.codyza_id)
  )

  const filtered = filter === "mine" ? myGroups
    : filter === "all" ? groups
    : groups.filter(g => g.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Project Groups</h1>
        <p className="text-gray-400 text-sm">Teams working on real projects together. Groups are assigned by admins.</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">

          {/* Filter tabs */}
          <div className="flex gap-1 mb-5 border-b border-white/[0.06]">
            {[
              { key: "all", label: "All Groups" },
              { key: "mine", label: "My Groups" },
              { key: "building", label: "Building" },
              { key: "live", label: "Live" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  filter === key ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}>
                {label}
                {key === "mine" && <span className={`ml-1.5 text-xs ${filter === key ? "text-purple-400" : "text-gray-600"}`}>{myGroups.length}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse bg-white/[0.03] rounded-xl border border-white/[0.06]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-xl">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {filter === "mine" ? "You haven't been added to any groups yet." : "No groups yet."}
              </p>
              <p className="text-gray-600 text-sm mt-1">Groups are created and assigned by admins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group) => {
                const status = STATUS_CONFIG[group.status] || STATUS_CONFIG.planning
                const StatusIcon = status.icon
                const isMyGroup = group.members?.some((m: any) => m.codyza_id === contributor?.codyza_id)
                const myRole = group.members?.find((m: any) => m.codyza_id === contributor?.codyza_id)?.role

                return (
                  <div key={group.id} className={`bg-white/[0.03] border rounded-xl overflow-hidden transition-all hover:border-white/[0.15] ${isMyGroup ? "border-purple-500/20" : "border-white/[0.07]"}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-bold text-white text-base">{group.name}</h3>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </div>
                            {isMyGroup && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                You · {myRole || "member"}
                              </div>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-gray-400 leading-relaxed">{group.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {group.live_url && group.status === "live" && (
                            <a href={group.live_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors">
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {group.github_url && (
                            <a href={group.github_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white transition-colors">
                              <GitBranch className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Members */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {(group.members || []).slice(0, 5).map((m: any, i: number) => (
                              <div key={m.codyza_id}
                                style={{ background: getAvatarBg(m.codyza_id), marginLeft: i > 0 ? "-8px" : "0", zIndex: 10 - i }}
                                className="w-7 h-7 rounded-full border-2 border-[#0f0c1a] flex items-center justify-center text-[9px] font-bold text-white relative"
                                title={`${m.name} · ${m.role}`}>
                                {getInitials(m.name || m.codyza_id)}
                              </div>
                            ))}
                            {group.members?.length > 5 && (
                              <div className="w-7 h-7 rounded-full border-2 border-[#0f0c1a] bg-white/10 flex items-center justify-center text-[9px] text-gray-400" style={{ marginLeft: "-8px" }}>
                                +{group.members.length - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{group.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Created by {group.creator_name}</span>
                          <span>{new Date(group.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>

                      {/* Role breakdown */}
                      {group.members?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
                          {group.members.map((m: any) => (
                            <span key={m.codyza_id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-white/[0.04] border border-white/[0.07]">
                              <span style={{ color: ROLE_COLORS[m.role] || "#94a3b8" }}>●</span>
                              <span className="text-gray-400">{m.name}</span>
                              <span style={{ color: ROLE_COLORS[m.role] || "#94a3b8" }}>· {m.role}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Info panel */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 sticky top-24">
            <h3 className="font-semibold text-white text-sm mb-3">How Groups Work</h3>
            <div className="space-y-3">
              {[
                { icon: Users, color: "#8b5cf6", text: "Groups are created and assigned by admins" },
                { icon: Zap, color: "#f59e0b", text: "Ship together, earn XP together — shown separately on your profile" },
                { icon: CheckCircle, color: "#22c55e", text: "Admin approves final submission — all members get XP" },
              ].map(({ icon: Icon, color, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-gray-500">Want to start a project group? Reach out to an admin on Slack.</p>
            </div>

            {/* My groups summary */}
            {myGroups.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs font-medium text-white mb-2">Your groups ({myGroups.length})</p>
                {myGroups.map(g => {
                  const s = STATUS_CONFIG[g.status] || STATUS_CONFIG.planning
                  return (
                    <div key={g.id} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-400 truncate max-w-[140px]">{g.name}</span>
                      <span className="text-[10px] font-medium" style={{ color: s.color }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
