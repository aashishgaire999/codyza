# Codyza Design System

Design reference for Codyza (codyza.com) — a dark, space-themed developer community platform. Use this file to generate on-brand UI in Stitch or similar tools.

---

## Tech Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 (`@import "tailwindcss"` in `globals.css`, no separate `tailwind.config.ts`) |
| Component primitives | shadcn/ui | v4.7.0, style `radix-nova`, CSS variables enabled |
| Animation | Framer Motion | ^12.38.0 |
| Icons | Lucide React | ^1.14.0 |
| Auth & database | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | Primary auth for login, onboarding, member area |
| Forms | react-hook-form + zod + `@hookform/resolvers` | Application flow, settings |
| Email | Resend | Application notifications, admin invites |
| AI scoring | Google Generative AI | Project submission scoring (API route) |
| Image crop | react-easy-crop | Onboarding avatar upload |
| Toasts | Sonner | Via shadcn `Toaster` component |
| Utilities | clsx, tailwind-merge, class-variance-authority | `cn()` helper in `@/lib/utils` |
| CSS animation helpers | tw-animate-css | Imported in globals |

**Installed but not wired in app code:** `@clerk/nextjs`, `@tanstack/react-query`, `zustand`, `next-themes` (only referenced in unused Sonner theme hook). Auth is Supabase-only.

**Routing:** File-based App Router under `src/app/`. No `middleware.ts`. Root layout forces dark mode via `<html className="dark">`.

---

## Color System

### Brand palette (Codyza tokens)

Defined in `@theme inline` and `:root` in `src/app/globals.css`:

| Token | Hex / value | Usage |
|-------|-------------|-------|
| `--color-codyza-bg` | `#050508` | Primary page background |
| `--color-codyza-bg-secondary` | `#08080f` | Secondary surfaces |
| `--color-codyza-bg-card` | `rgba(255,255,255,0.02)` | Card fill |
| `--color-codyza-purple` | `#7c3aed` | Primary accent, ring, scrollbar |
| `--color-codyza-blue` | `#2563eb` | Gradient stops, links |
| `--color-codyza-cyan` | `#06b6d4` | Info, gradient accents |
| `--color-codyza-green` | `#22c55e` | Success, live status, ping dots |
| `--color-nebula-purple` | `#7c3aed` | Space theme alias |
| `--color-nebula-cyan` | `#06b6d4` | Space theme alias |
| `--color-asteroid` | `#4a4a5a` | Asteroid field particles |
| `--color-star-gold` | `#fbbf24` | Rank / highlight accent |
| `--color-void` | `#020205` | Deepest black |

`src/constants/site.ts` also exports `BRAND_COLORS` with slightly different purple/blue hex values (`#8b5cf6`, `#3b82f6`) used in inline styles across components.

### shadcn semantic tokens (`:root`)

| Variable | Value |
|----------|-------|
| `--background` | `#050508` |
| `--foreground` | `#fafafa` |
| `--card` | `#0a0a12` |
| `--primary` | `#7c3aed` |
| `--primary-foreground` | `#fafafa` |
| `--secondary` | `#0d0d18` |
| `--muted` | `#0a0a14` |
| `--muted-foreground` | `rgba(255,255,255,0.4)` |
| `--accent` | `#0d0d1a` |
| `--destructive` | `#ef4444` |
| `--border` | `rgba(255,255,255,0.06)` |
| `--input` | `rgba(255,255,255,0.06)` |
| `--ring` | `#7c3aed` |
| `--radius` | `0.75rem` (12px) |

### Dark mode

Single dark theme only. `<html lang="en" className="dark">` in root layout. `@custom-variant dark (&:is(.dark *))` for Tailwind v4. No light mode toggle in production UI.

### Gradient text utilities

- `.text-gradient-nebula` — purple → cyan → blue (`#a78bfa`, `#67e8f9`, `#3b82f6`)
- `.text-gradient-codyza` — animated 4-stop gradient (purple, blue, cyan, green)
- `.text-gradient-aurora` / `.text-gradient-blue` — cyan/blue variants

### Status colors (used consistently)

| State | Color |
|-------|-------|
| Live / approved / open | `#22c55e` |
| Pending / in review | `#f59e0b` |
| Building / reviewed | `#3b82f6` |
| Claimed | `#f59e0b` |
| Completed bounty | `#8b5cf6` |
| Cancelled / destructive | `#ef4444` |

### Selection & scrollbar

- Text selection: `rgba(124, 58, 237, 0.3)` background
- Scrollbar thumb: purple-tinted `rgba(124,58,237,0.25)`

---

## Typography

### Font families (Google Fonts via `next/font` in `src/lib/fonts.ts`)

| Role | Font | CSS variable | Weights loaded |
|------|------|--------------|----------------|
| Body / UI | Inter | `--font-inter` | 400, 500, 600, 700 |
| Headings / display | Syne | `--font-syne` | 400–800 |
| Monospace / labels | JetBrains Mono | `--font-jetbrains-mono` | 300–700 |
| Display accent | Space Mono | `--font-space-mono` | 400, 700 |

Tailwind theme maps: `--font-sans` → Inter, `--font-heading` → Syne, `--font-mono` → JetBrains Mono, `--font-display` → Space Mono.

### Usage patterns

- **Body default:** `font-sans` (Inter) on `<body>`
- **Headlines:** `font-[family-name:var(--font-heading)]` (Syne), bold, tight tracking (`-0.025em` to `-0.03em`)
- **Badges / meta / timestamps:** `font-mono`, `text-[10px]`, `uppercase`, `tracking-widest`
- **Terminal / code blocks:** `font-mono`, ~13px

### Type scale (common in codebase)

| Class / pattern | Size | Context |
|-----------------|------|---------|
| `.headline-cinematic` | `clamp(3rem, 8vw, 7rem)` | Hero H1 |
| `.headline-section` | `clamp(2rem, 5vw, 4rem)` | Section H2 |
| Section H3 | `text-3xl md:text-5xl` | Team section |
| Body | `text-base` / `text-lg` | Paragraphs |
| Muted body | `text-zinc-400` / `rgba(255,255,255,0.45)` | Subcopy |
| Micro labels | `text-[10px]`–`text-xs` | Badges, footer, timeline |

---

## Page & Route Map

All routes live under `src/app/`. Dynamic segments shown in brackets.

| Route | Type | Description |
|-------|------|-------------|
| `/` | Landing | Hero with terminal animation, about, currently shipping, team, apply CTA, footer |
| `/apply` | Public | Multi-step contributor application form |
| `/projects` | Public (SSR) | Gallery of approved community submissions with tech filters |
| `/leaderboard` | Public (SSR) | XP-ranked contributor leaderboard with rank badges |
| `/contributor/[id]` | Public (SSR) | Public profile for a contributor by Codyza ID (e.g. CZX-0042) |
| `/login` | Auth | Email/password login and magic-link mode via Supabase |
| `/forgot-password` | Auth | Password reset email request |
| `/set-password` | Auth | Set or reset password from invite/recovery link |
| `/onboarding` | Auth | Post-invite profile setup: name, avatar crop, skills |
| `/submit` | Redirect | Redirects to `/member/projects` |
| `/member` | Member | Authenticated dashboard: XP, rank, crew feed, groups, bounties |
| `/member/projects` | Member | List/submit projects, view submission status |
| `/member/submit` | Redirect | Redirects to `/member/projects` |
| `/member/groups` | Member | Project groups, members, build status |
| `/member/bounties` | Member | Claim and complete XP bounties |
| `/member/settings` | Member | Edit profile, avatar, skills, bio |
| `/member/standup` | Redirect | Redirects to `/member` |
| `/admin` | Admin | Access-code gated admin: contributors, submissions, applications, groups, bounties |
| `/admin/analytics` | Admin (SSR) | Stats dashboard: contributors, submissions, applications over time |

**API routes (not pages):** `/api/apply`, `/api/submit`, `/api/avatar`, `/api/bounties`, `/api/groups`, `/api/reactions`, `/api/notifications`, `/api/onboarding/create-profile`, `/api/member/update`, `/api/admin/verify`, `/api/admin/invite`

**Landing anchors:** `/#about`, `/#team`, `/#apply`

---

## Component Inventory

### Landing (`src/components/landing/`)

| Component | Description |
|-----------|-------------|
| `Navbar` | Fixed top nav: logo, Projects/Leaderboard/Team links, Login + Apply CTAs, mobile drawer (Framer Motion) |
| `Footer` | Wordmark, "Recently at Codyza" live timeline, nav links, socials, "Built by" credit |
| `AboutSection` | "What Is Codyza" mega-glass panel with headline + `CzxIdCard` |
| `CurrentlyShippingSection` | Stats grid + up to 3 project cards + contributor pills + testimonial placeholder |
| `ProjectsSection` | Team cards (founding + leadership), infinite contributor marquee, contact block |
| `ApplySection` | 5-step animated application wizard with GitHub lookup |
| `SlackGateButton` | Gated Slack invite link in footer |
| `FeaturesSection` | Feature grid with expandable cards — **built but not mounted on homepage** |
| `HowItWorksSection` | 8-step vertical timeline — **built but not mounted on homepage** |

### Effects (`src/components/effects/`)

| Component | Description |
|-----------|-------------|
| `SpaceScene` | Composes galaxy nebula + asteroid field; variants: `default`, `exploration`, `command`, `deep` |
| `GalaxyBackground` | Parallax nebula orbs, scroll-reactive |
| `AsteroidField` | Drifting asteroid particles; density: light / normal / heavy |
| `TerminalAnimation` | Hero terminal mock: git clone → deploy → +120 XP; loops with Framer Motion line reveals |
| `FloatingCode` | Floating syntax snippets in hero background |
| `PerspectiveGrid` | 3D perspective grid floor under hero |
| `OrbitalRings` | Animated tilted rings at hero bottom |
| `ParticleField` | Particle effect — **not imported anywhere** |
| `GlowOrb` | Glow orb effect — **not imported anywhere** |

### Shared (`src/components/shared/`)

| Component | Description |
|-----------|-------------|
| `CodyzaLogo` | PNG logo (`/logo/codyza-logo.png`) with optional purple/blue radial glow |
| `CzxIdCard` | Member ID card with **animated conic-gradient border** (`id-card-glow`), XP bar, sample defaults |
| `SectionBadge` | Pill badge with optional green ping dot for "live" sections |
| `SiteShell` | Page wrapper: `SpaceScene` + optional grid overlay + scroll reveal |
| `SmartNavbar` | Simpler nav for inner public pages (apply, projects, leaderboard, auth) |
| `XpProgressBar` | Purple→blue→cyan gradient XP progress strip |
| `AuthCard` | Centered auth card layout — **not imported anywhere** |
| `StatCounter` | Animated number counter — **not imported anywhere** |

### Member (`src/components/member/`)

| Component | Description |
|-----------|-------------|
| `MemberNavbar` | Member area nav: dashboard links, notification bell, admin link if applicable |
| `NotificationBell` | In-app notifications dropdown |
| `AvatarUpload` | Avatar picker with crop for settings |

### UI (`src/components/ui/`) — shadcn

`Button`, `Input`, `Textarea`, `Label`, `Card`, `Badge`, `Avatar`, `Separator`, `Skeleton`, `Form`, `Sonner`

Landing CTAs often use custom `.btn-primary` / `.btn-ghost` classes instead of shadcn `Button` variants.

---

## Layout Patterns

### Container & spacing

- Max content width: `max-w-7xl` (1280px), sometimes `max-w-6xl` or `max-w-3xl` for narrow sections
- Horizontal padding: `px-6 md:px-8` (landing), `px-4 md:px-8` (nav)
- Section vertical rhythm: `py-16 md:py-24` to `py-20 md:py-28`, hero `min-h-[90vh]`
- Section dividers: `.space-divider` (gradient line with asteroid dots) or `border-t border-white/[0.04]`

### Border radius

| Element | Radius |
|---------|--------|
| Global `--radius` | 12px (`0.75rem`) |
| Inputs / default buttons (global override) | 10px |
| Cards / panels | 16px–24px (`rounded-2xl`, `.glass-card` 16px, `.mega-glass-panel` 24px) |
| Badges / pills | `rounded-full` |
| Logo | `rounded-2xl` |
| Terminal window | `rounded-2xl` |
| ID card inner | 17px (inside 18px glow wrapper) |

### Surface styles

| Class | Description |
|-------|-------------|
| `.glass-panel` | Light blur panel, 20px radius |
| `.mega-glass-panel` | Large frosted panel with star speckle overlay + cyan top highlight |
| `.glass-card` | 16px card, hover purple border glow |
| `.glass-card-purple` / `.glass-card-cyan` | Tinted variant cards |
| `.glass-input` | Form inputs: 3% white bg, purple focus ring |
| `.terminal-glow` | Terminal container shadow |
| `.team-card-glow` | Team member cards: glass + purple top gradient line, hover lift (styled in `ProjectsSection`) |
| `.id-card-glow` | **Conic-gradient spinning border** on member ID card |

### Buttons

| Style | Appearance |
|-------|------------|
| `.btn-primary` | Linear gradient `#7c3aed` → `#2563eb`, white text, purple shadow, hover lift |
| `.btn-ghost` | Transparent, white/18% border, hover white/4% fill |
| shadcn `Button` | Used in nav apply button; `rounded-lg`, primary maps to `--primary` |

### Background effects

- Fixed body noise overlay (SVG fractal noise at 3.5% opacity)
- `.grid-overlay` — purple grid with pulse animation (hero)
- `.page-hero-glow` — radial purple ellipse
- Space scenes per page variant with parallax scroll

### Animation patterns

**Framer Motion:**
- Hero: staggered `initial/animate` on badge, H1, subcopy, terminal
- Sections: `whileInView` fade-up on cards and team members
- Nav mobile menu: `AnimatePresence` height/opacity
- Terminal lines: per-line fade + slide from left
- Apply wizard: step transitions via `AnimatePresence`

**CSS / Intersection Observer:**
- `.reveal-up` + `useScrollReveal()` hook — opacity + translateY on scroll into view
- `.reveal` with delay classes for legacy stagger
- Marquee: 30s linear infinite on contributor pills
- `@keyframes`: `aurora-pulse`, `orb-float`, `grid-pulse`, `gradient-shift`, `spin-id-card`, `orbital-spin`
- `prefers-reduced-motion`: disables reveal, ID card spin, gradient shift, orbital rings

### Gamification UI

- Contributor IDs: `CZX-####` format
- 8 rank tiers: Apprentice → Codyza Fellow (XP thresholds 0–35000)
- Rank colors mapped per tier (slate, green, blue, purple, amber, red, cyan, gold)

---

## Content & Copy Tone

Direct, conversational, anti-hype. Emphasizes real projects over courses, community over solo grinding, free and founder-led. Uses "crew", "ship", "build together". Technical credibility without corporate jargon.

### Real copy examples (from codebase)

**Hero (`/`):**
- Badge: "Now Onboarding Founding Contributors"
- Headline: "Building alone gets lonely." (gradient on "gets lonely.")
- Subcopy: "Codyza is a community of devs, designers, and dreamers shipping real projects together. Not a bootcamp. Not another chat server. Free to join, built to last."

**About section:**
- Badge: "What Is Codyza"
- Headline: "You don't need another course. You need a crew."
- Body: "Codyza is where builders turn ideas into impact — share skills, ship real projects, and earn XP as you grow with people who actually show up."

**Currently Shipping stats:**
- "Day 14" / "Building in public"
- "Open to all" / "Developers & Designers"
- "3" / "Actively being built"
- "$0" / "No fees. Ever."

**Apply CTA (home + `/apply`):**
- "Ready to join the crew?"
- "Applications take ~3 minutes. We review every one within 48 hours."
- "Apply to join" / "See what we're building →"
- Apply page: "Ready to build with us?"

**Apply roadmap steps:**
- "You write 5 honest answers" / "About 3 minutes total"
- "A founder reads every one" / "Within 48 hours"
- "You get a Codyza ID" / "Something like CZX-0042"
- "You join the next standup" / "Welcome to the crew"

**Team section:**
- "The people behind Codyza."
- Empty marquee: "Be the first contributor →"

**Footer:**
- Wordmark split: "cody" + gradient "z" + "a"
- Tagline: "Build together"
- Panel label: "Recently at Codyza"

**Site metadata tagline (`SITE_CONFIG`):**
- "Build. Learn. Deploy. Grow Together."

**Terminal hero (`TerminalAnimation`):**
- Window title: "codyza — mission control"
- Ends with: "✓ Deployed to codyza.com in 12.4s" / "✓ +120 XP earned"

**Features section (unused on home but on-brand):**
- "Real Projects" — "Ship code to live users. No tutorials, no throwaway demos."

**How it works (unused on home):**
- "From application to shipped product."

---

## Brand Identity

### Name

**Codyza** — lowercase in nav wordmark (`codyza`), title case in metadata and headings.

### Logo

- Asset: `/public/logo/codyza-logo.png`
- Component: `CodyzaLogo` — square image, `rounded-2xl`, optional purple/blue radial glow behind
- Favicon / apple touch: same PNG

### Wordmark treatment (footer)

Large Syne bold: white "cody" + animated gradient "z" (`.text-gradient-codyza`) + white "a"

### Taglines in use

| Context | Tagline |
|---------|---------|
| SEO / metadata | "Build. Learn. Deploy. Grow Together." |
| Footer | "Build together" |
| Hero | Implicit: community shipping real projects, not a bootcamp |

### Visual identity keywords

Deep space, nebula purple/cyan, glassmorphism, terminal aesthetic, gamified XP/ranks, founding-contributor onboarding energy, green "live" ping dots.

### Social & contact

- Email: `team@codyza.com`
- GitHub org: `github.com/codyza-com`
- Domain: `codyza.com`

---

## Stitch Notes

- Default to **dark-only** layouts on `#050508` background with `SpaceScene` or subtle grid — avoid light themes.
- Headlines: **Syne bold** with gradient accent spans on key words.
- Primary CTA: purple-blue gradient button; secondary: ghost outline.
- Use **mono uppercase micro-labels** for section badges and status.
- Cards: frosted glass with thin white/6–8% borders, 16–24px radius.
- Hero pattern: full-viewport centered copy + terminal or ID card visual, orbital rings at bottom.
- Member-facing UI reuses same tokens but denser data tables and dashboard layouts under `MemberNavbar`.
