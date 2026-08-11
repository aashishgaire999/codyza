"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Users, GitBranch, Globe, Send, Clock, CheckCircle, Zap, Hammer, Eye } from "lucide-react"
import { MemberPageHeader } from "@/components/member/member-page-header"
import { memberFetch } from "@/lib/member-fetch"

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: any }> = {
  planning:  { label: "Planning",  badge: "bg-muted text-muted-foreground", icon: Clock },
  building:  { label: "Building",  badge: "bg-accent/10 text-accent", icon: Hammer },
  review:    { label: "In Review", badge: "bg-accent/10 text-accent", icon: Eye },
  submitted: { label: "Submitted", badge: "bg-accent/10 text-accent", icon: Send },
  live:      { label: "Live",      badge: "bg-success/10 text-success", icon: CheckCircle },
}

const ROLE_COLORS: Record<string, string> = {
  pm:       "text-accent",
  frontend: "text-accent",
  backend:  "text-foreground",
  design:   "text-accent",
  devops:   "text-success",
  ai:       "text-success",
  member:   "text-muted-foreground",
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
}

function getAvatarBg(id: string) {
  const classes = [
    "bg-accent/20 text-accent",
    "bg-muted text-foreground",
    "bg-success/20 text-success",
    "bg-accent/15 text-accent",
    "bg-muted text-accent",
    "bg-success/15 text-success",
  ]
  return classes[parseInt(id.replace(/\D/g, "").slice(-1) || "0") % classes.length]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

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

    const res = await memberFetch("/api/groups")
    const data = await res.json()
    setGroups(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const myGroups = groups.filter(g =>
    g.members?.some((m: any) => m.codyza_id === contributor?.codyza_id)
  )

  const filtered = filter === "mine" ? myGroups
    : filter === "all" ? groups
    : groups.filter(g => g.status === filter)

  return (
    <>
      <MemberPageHeader
        label="member · groups"
        title={
          <>
            project <span className="text-accent">groups</span>
          </>
        }
        description="Your assigned teams. Admins place you — you ship with them."
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="flex-1 min-w-0">

          {/* Filter tabs */}
          <div className="mb-5 flex gap-1 border-b border-border">
            {[
              { key: "all", label: "All Groups" },
              { key: "mine", label: "My Groups" },
              { key: "building", label: "Building" },
              { key: "live", label: "Live" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {label}
                {key === "mine" && <span className={`ml-1.5 text-xs ${filter === key ? "text-accent" : "text-muted-foreground"}`}>{myGroups.length}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="surface-card h-32 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card border-dashed py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">
                {filter === "mine" ? "You haven't been added to any groups yet." : "No groups yet."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Groups are created and assigned by admins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group) => {
                const status = STATUS_CONFIG[group.status] || STATUS_CONFIG.planning
                const StatusIcon = status.icon
                const isMyGroup = group.members?.some((m: any) => m.codyza_id === contributor?.codyza_id)
                const myRole = group.members?.find((m: any) => m.codyza_id === contributor?.codyza_id)?.role

                return (
                  <div key={group.id} className={`surface-card overflow-hidden transition-all ${isMyGroup ? "border-accent/20" : ""}`}>
                    <div className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-bold text-foreground">{group.name}</h3>
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </div>
                            {isMyGroup && (
                              <div className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                                You · {myRole || "member"}
                              </div>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          {group.live_url && group.status === "live" && (
                            <a href={group.live_url} target="_blank" rel="noopener noreferrer"
                              className="rounded-xl border border-success/20 bg-success/10 p-2 text-success transition-colors hover:bg-success/20">
                              <Globe className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {group.github_url && (
                            <a href={group.github_url} target="_blank" rel="noopener noreferrer"
                              className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground">
                              <GitBranch className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {(group.members || []).slice(0, 5).map((m: any, i: number) => (
                              <div key={m.codyza_id}
                                className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[9px] font-bold ${getAvatarBg(m.codyza_id)}`}
                                style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 10 - i }}
                                title={`${m.name} · ${m.role}`}>
                                {getInitials(m.name || m.codyza_id)}
                              </div>
                            ))}
                            {group.members?.length > 5 && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] text-muted-foreground" style={{ marginLeft: "-8px" }}>
                                +{group.members.length - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{group.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Created by {group.creator_name}</span>
                          <span>{new Date(group.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>

                      {group.members?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                          {group.members.map((m: any) => (
                            <span key={m.codyza_id} className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px]">
                              <span className={ROLE_COLORS[m.role] || "text-muted-foreground"}>●</span>
                              <span className="text-muted-foreground">{m.name}</span>
                              <span className={ROLE_COLORS[m.role] || "text-muted-foreground"}>· {m.role}</span>
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
          <div className="surface-card sticky top-24 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">How Groups Work</h3>
            <div className="space-y-3">
              {[
                { icon: Users, text: "Groups are created and assigned by admins" },
                { icon: Zap, text: "Ship together, earn XP together — shown separately on your profile" },
                { icon: CheckCircle, text: "Admin approves final submission — all members get XP" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                    <Icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">Want to start a project group? Reach out to an admin on Slack.</p>
            </div>

            {myGroups.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-foreground">Your groups ({myGroups.length})</p>
                {myGroups.map(g => {
                  const s = STATUS_CONFIG[g.status] || STATUS_CONFIG.planning
                  return (
                    <div key={g.id} className="flex items-center justify-between py-1.5">
                      <span className="max-w-[140px] truncate text-xs text-muted-foreground">{g.name}</span>
                      <span className={`text-[10px] font-medium ${s.badge.split(" ").find(c => c.startsWith("text-")) || "text-muted-foreground"}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
