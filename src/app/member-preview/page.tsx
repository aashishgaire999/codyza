import { notFound } from "next/navigation"
import Link from "next/link"
import { BarChart3, Clock3, FolderKanban, Settings, Target, Users, Zap } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CosmicBackdrop } from "@/components/effects/cosmic-backdrop"

const AREAS = [
  { href: "#projects", label: "Projects", description: "Submissions, review status, and launch proof.", icon: FolderKanban, tone: "projects" },
  { href: "#groups", label: "Groups", description: "Small crews, roles, and shared missions.", icon: Users, tone: "groups" },
  { href: "#bounties", label: "Bounties", description: "Open work with clear outcomes and XP.", icon: Target, tone: "bounties" },
  { href: "#timesheet", label: "Timesheet", description: "Clock in, name the work, summarize, clock out.", icon: Clock3, tone: "standup" },
  { href: "#settings", label: "Settings", description: "Identity, skills, profile, and visibility.", icon: Settings, tone: "settings" },
  { href: "#analytics", label: "Progress", description: "Rank, streak, output, and crew momentum.", icon: BarChart3, tone: "hub" },
]

export default function MemberPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()

  return (
    <div className="codyza-member cosmic-workspace min-h-screen text-foreground" data-cosmic-zone="hub">
      <CosmicBackdrop variant="hub" />
      <div className="relative z-10">
        <header className="member-navbar sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
            <Link href="/" aria-label="Codyza home"><CodyzaLogo size={28} variant="full" /></Link>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">local preview · read only</span>
            <Link href="/login" className="btn-ghost rounded-full px-4 py-2 text-xs">sign in</Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 md:py-14">
          <div className="cosmic-page-header mb-10 max-w-3xl">
            <p className="member-hero-label mb-4">member portal / preview deck</p>
            <h1 className="member-headline">the whole member universe, <span className="text-accent">without touching real data.</span></h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">This temporary development-only page shows the visual system safely. Real member actions still require authentication.</p>
          </div>

          <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Sample member metrics">
            {[["current rank","apprentice"],["total xp","1,250"],["active streak","3 weeks"],["projects","4"]].map(([label,value]) => (
              <div key={label} className="dashboard-stat"><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p><strong className="mt-3 block text-xl sm:text-2xl">{value}</strong></div>
            ))}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Member portal areas">
            {AREAS.map(({ href, label, description, icon: Icon, tone }) => (
              <article id={href.slice(1)} key={href} className="surface-card group scroll-mt-24 p-5 sm:p-6" data-preview-tone={tone}>
                <div className="mb-8 flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10"><Icon className="h-5 w-5 text-accent" /></span><span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]" /></div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl lowercase">{label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </section>

          <section className="surface-card mt-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><p className="member-hero-label">next crew announcement</p><h2 className="mt-2 text-lg font-semibold">Board meeting · Tuesday at 6:30 PM</h2><p className="mt-1 text-sm text-muted-foreground">Announcements and meeting links will live here for authenticated members.</p></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent"><Zap className="h-4 w-4" /> upcoming</span>
          </section>
        </main>
      </div>
    </div>
  )
}
