# Codyza 2.0 — Product Requirements Document

- **Version:** 1.0
- **Date:** 2026-07-12
- **Owner:** Product Manager (`codyza-product-manager`)
- **Status:** Phase 1 deliverable — ready for team review
- **Canonical inputs:** `docs/blueprint.md` (Blueprint v1.0) · `docs/decisions.md`
  (D-001 DECIDED: merged visual direction) · `REDESIGN.md` (token skeleton, motion
  system, rollout order) · `TEAM.md` (roster + pipeline) · existing implementation
  in `src/app/`

---

## 1. Vision, Goals, and Non-Goals

### 1.1 Vision (from Blueprint v1.0)

Codyza is a technology organization where ambitious builders collaborate on real-world
products, gain practical experience, and launch meaningful software together. The public
website builds trust and attracts contributors; **Codyza Quest** is the internal
operating platform and the source of truth for volunteer progress. Public-approved data
flows back to Codyza.com.

### 1.2 Core principles (binding on every requirement below)

1. **Evolve, don't replace.** Codyza 2.0 is an evolution of the running site at
   `src/app/`. Every existing route, feature, and record survives (kept, evolved, or
   merged) — nothing is silently dropped. See §5 (route mapping) and §8 (preserve
   checklist).
2. **Storytelling over marketing.** Pages follow the narrative arc (mono index label →
   serif headline → content → single CTA), not SaaS-template blocks.
3. **Real products, real people, real launches.** All public numbers, projects, and
   profiles come from live Supabase data — no fake counters, no stock imagery.
4. **One coherent ecosystem.** Light editorial public site with Codyza Blue accent +
   journal specimen labels + terminal-in-hero (D-001); dark "Arcade" member/admin area;
   auth as the dark "airlock" between them.

### 1.3 Goals (measurable)

| # | Goal | Metric / target |
|---|------|-----------------|
| G1 | Build public trust | A first-time visitor can answer "what is Codyza, who builds here, what have they shipped" from the homepage alone (comprehension-tested by UX Researcher, ≥80% pass) |
| G2 | Attract contributors | Application starts ↑; apply funnel instrumented end-to-end (`cz_apply_*` events, §7) |
| G3 | Complete the blueprint IA | All top-nav and supporting pages exist and pass QA gates (§6) |
| G4 | Preserve everything | 100% of §8 checklist verified pre-launch; zero data loss |
| G5 | Quality bars | Lighthouse ≥90 performance / ≥95 accessibility on `/`, `/projects`, `/join`; WCAG 2.1 AA; no horizontal scroll at 375px; full `prefers-reduced-motion` fallback |
| G6 | SEO | Every public page has unique metadata, OG image, and is statically renderable or ISR (no client-only public pages) |

### 1.4 Non-goals (scope gate — explicitly cut to prevent bloat)

These are **out of scope for Codyza 2.0** (any phase) unless a new decision log entry
reverses them:

- **No replatform.** Stack stays Next.js + TypeScript + Tailwind + shadcn/ui + Framer
  Motion + Supabase + Vercel. No new framework, no GSAP (per REDESIGN §6), no new
  hosting.
- **No CMS.** News/case-study content is authored as MDX/typed constants in the repo
  (D-004). No Contentful/Sanity/headless CMS, no in-app admin content editor.
- **No rebuild of Quest itself.** Codyza.com integrates with Quest data; it does not
  reimplement Quest's task/submission/break/announcement engine. Quest remains the
  source of truth (Blueprint §Quest Integration).
- **No new gamification mechanics.** XP, ranks (8-tier ladder in
  `src/app/contributor/[id]/page.tsx`), streaks, and bounties are preserved and
  re-skinned — no new point economies, seasons, or quests invented for 2.0.
- **No public API / developer platform.** Internal API routes only.
- **No native/mobile app**, no PWA offline mode.
- **No internationalization** (English only for 2.0).
- **No payments, donations, or e-commerce.**
- **No forum, comments, or DMs.** Community page is profiles + leaderboard +
  achievements, not a social network. Existing `reactions` feature is kept as-is.
- **No public dark-mode toggle.** The light-public / dark-member split is a narrative
  feature (REDESIGN §1), not a user preference.
- **No AI features beyond the existing `ai_score`** on submissions.
- **No blog engine** — News is a lightweight launch/update feed, not long-form
  publishing (D-004).

---

## 2. Users

| Persona | Description | Primary surfaces |
|---------|-------------|------------------|
| **Visitor** | Prospective contributor, curious dev, recruiter, press | Home, Projects, Community, News, About, Join, Quest explainer, certificate verification |
| **Applicant** | Visitor mid-application or awaiting decision | Join/apply flow, email touchpoints |
| **Member (contributor)** | Accepted volunteer with a Codyza ID | Auth, onboarding, member portal (dashboard, projects, bounties, groups, settings), public profile |
| **Admin** | Codyza leadership operating the org | Admin portal, analytics, review queues, everything members see |
| **Verifier** | Employer/school checking a certificate or profile | `/certificates/verify`, `/contributor/[id]` |

Roles are enforced server-side: `contributors.is_admin` gates admin; Supabase Auth
session gates member; everything else is public. The IAM Engineer owns the role model;
this PRD defines the boundaries per feature (§6).

---

## 3. Information Architecture (target)

Per Blueprint v1.0:

- **Top navigation:** Home · Projects · Community · News · About · Join · Quest
- **Supporting pages:** Leadership (section of About), Contributor Profiles, Case
  Studies (future phase, under Projects), Certificates, Contact, Legal
- **Authenticated:** Member portal (`/member/*`), Admin portal (`/admin/*`), auth
  pages (`/login`, `/forgot-password`, `/set-password`, `/onboarding`)

Current nav (`src/constants/site.ts` `NAV_LINKS`: About → `/#about`, Projects,
Leaderboard, Team → `/#team`) is replaced by the blueprint nav. The Information
Architect owns `docs/sitemap.md`; the mapping below is the product contract.

---

## 4. Page Inventory (blueprint IA)

| Nav item | Route | Status vs today | MVP? |
|----------|-------|-----------------|------|
| Home | `/` | **Evolved** — restructure into 7-section homepage story | MVP |
| Projects | `/projects` | **Evolved** — richer cards, filters, case-study hooks | MVP |
| Community | `/community` | **New** — hub aggregating contributors, leaderboard, achievements (D-003) | MVP |
| News | `/news` | **New** — launch/update feed (MDX, D-004) | MVP (lite) |
| About | `/about` | **New page, existing content** — mission/story + Leadership section (absorbs `/#about`, `/#team`, `/team`) | MVP |
| Join | `/join` | **Evolved** — application flow moves from `/apply` (redirect kept) | MVP |
| Quest | `/quest` | **New** — public explainer of Codyza Quest + login CTA (D-003) | MVP |
| Leadership | `/about#leadership` | Section of About (not a standalone route) | MVP |
| Contributor Profiles | `/contributor/[id]` | **Kept/Evolved** | MVP |
| Leaderboard | `/leaderboard` | **Kept/Evolved** — URL preserved, surfaced via Community | MVP |
| Case Studies | `/projects/[slug]` | **New** | Future |
| Certificates | `/certificates/verify` | **New** (preserve-mandated; D-005) | MVP (lite) |
| Contact | `/contact` | **New** — simple contact page | MVP (lite) |
| Legal | `/legal/privacy`, `/legal/terms` | **New** | MVP (lite) |

---

## 5. Existing-Route Mapping (every route in `src/app/` → its 2.0 destination)

**Legend:** Kept = same route, re-skinned to 2.0 tokens only. Evolved = same route,
meaningful UX/content changes. Merged = content absorbed elsewhere; route becomes a
redirect. New = does not exist today.

### Public pages

| Existing route | 2.0 destination | Disposition |
|----------------|-----------------|-------------|
| `/` (`src/app/page.tsx`, 1155-line landing) | `/` restructured to the 7-section homepage story (§6.1) | **Evolved** |
| `/projects` | `/projects` | **Evolved** |
| `/leaderboard` | `/leaderboard`, linked from `/community` | **Kept/Evolved** |
| `/team` (currently redirects to `/#team`) | Redirect target changes to `/about#leadership` | **Merged** into About |
| `/contributor/[id]` | `/contributor/[id]` | **Kept/Evolved** |
| `/apply` | `/join` (301-style redirect from `/apply` retained forever — the URL is in the wild) | **Merged** into Join |
| `/submit` (redirects to `/member/projects`) | Redirect kept as-is | **Kept** |

### Auth + onboarding (the "airlock" — dark member theme per REDESIGN Phase 3)

| Existing route | 2.0 destination | Disposition |
|----------------|-----------------|-------------|
| `/login` | `/login` (password + magic-link modes preserved) | **Kept/Evolved** (visual) |
| `/forgot-password` | `/forgot-password` | **Kept/Evolved** (visual) |
| `/set-password` | `/set-password` | **Kept/Evolved** (visual) |
| `/onboarding` (profile + avatar crop + CZX ID assignment) | `/onboarding` | **Kept/Evolved** (visual) |
| `/auth/callback` (route handler) | Unchanged | **Kept** |

### Member portal (dark "Arcade")

| Existing route | 2.0 destination | Disposition |
|----------------|-----------------|-------------|
| `/member` (dashboard: XP, rank, streak, submissions, quests) | `/member` | **Evolved** |
| `/member/projects` (project list + submission form) | `/member/projects` | **Evolved** |
| `/member/bounties` (browse/claim) | `/member/bounties` | **Kept/Evolved** |
| `/member/groups` (project groups + roles) | `/member/groups` | **Kept/Evolved** |
| `/member/settings` (profile, skills, avatar) | `/member/settings` | **Kept/Evolved** |
| `/member/submit` (redirects to `/member/projects`) | Redirect kept | **Kept** |
| `/member/standup` (redirects to `/member`) | Redirect kept | **Kept** |

### Admin portal

| Existing route | 2.0 destination | Disposition |
|----------------|-----------------|-------------|
| `/admin` (contributors CRUD, submissions review, applications) | `/admin` | **Evolved** |
| `/admin/analytics` | `/admin/analytics` | **Kept/Evolved** |

### API routes (all **Kept**; contracts owned by Backend & API Architect — no breaking changes without a decision-log entry)

`/api/apply` · `/api/submit` · `/api/bounties` · `/api/groups` · `/api/member/update` ·
`/api/notifications` · `/api/reactions` · `/api/avatar` · `/api/onboarding/create-profile` ·
`/api/admin/invite` · `/api/admin/verify`

**New API surface (MVP):** certificate lookup (read-only, §6.10). **New (future):**
Quest sync endpoints (§9).

### Data model in use today (Supabase)

`contributors` (CZX ID, XP, rank, streak, is_admin, skills, bio, avatar_url) ·
`submissions` (project, URLs, tech_stack, ai_score, xp_earned, status) ·
`applications` · `notifications` · `reactions` · `bounties` · `project_groups` ·
`group_members` · `xp_history` · `avatars` (storage bucket).
**New tables (MVP):** `certificates` (D-005). All schema changes go through the
Supabase Engineer with RLS review.

---

## 6. Feature Specifications

Every feature below follows the mandatory checklist: purpose, users, journey, data,
public/private boundaries, responsive behavior, states, accessibility, security,
analytics, acceptance criteria. Shared requirements first to avoid repetition:

### 6.0 Shared requirements (apply to every page unless overridden)

- **Visual:** D-001 merged direction. Public pages: light editorial, Codyza Blue
  accent, mono specimen labels, hairline section rules with index numbering. Member/
  admin: dark Arcade tokens. No raw hex in components — tokens only (REDESIGN §2).
- **Responsive:** must be fully usable at 375 / 768 / 1024 / 1440 px. No horizontal
  scroll at 375px. Touch targets ≥44px. `min-h-dvh` instead of `100vh`.
- **States:** every data-driven view defines loading (skeleton, not spinner-only, in
  member/admin; lightweight placeholder on public ISR pages), empty (on-brand
  invitation copy, never a bare "no data"), error (message + retry action, never a
  blank screen or raw error), success, and — for gated pages — unauthorized
  (redirect to `/login?next=…` for unauthenticated; friendly "not authorized" for
  authenticated non-admins hitting `/admin`).
- **Accessibility:** WCAG 2.1 AA. Text contrast ≥4.5:1 (muted text included), visible
  focus rings using the accent token, logical heading hierarchy (exactly one `h1`),
  keyboard-operable everything (including mobile drawer and modals with focus trap +
  Esc), `aria-live` for async status (form submit, scroll progress %), all images
  with meaningful `alt`, forms with visible labels and programmatic error association.
  Full `prefers-reduced-motion` fallback: static marquee, no pinned scrub, instant
  reveals.
- **Security:** all writes validated server-side (client validation is UX only).
  Supabase RLS on every table; anon key never grants write beyond intended public
  flows; admin checks server-side via `is_admin`, never trusted from the client.
  Rate-limit public write endpoints (`/api/apply`, certificate lookup). No secrets in
  client bundles. Private fields (email, is_admin, internal notes) never selected
  into public page payloads.
- **SEO/perf:** public pages are Server Components with ISR (`revalidate`) or static;
  unique `<title>`/description/OG per page; LCP image optimized via `next/image`.
- **Analytics:** page views auto-tracked; feature events per section below, named
  `cz_<area>_<action>` (§7).

---

### 6.1 Homepage (`/`) — Evolved

- **Purpose:** convert curiosity into trust and applications; visitors leave wanting
  to build with Codyza.
- **Users:** Visitor (primary), Applicant, Verifier.
- **Journey:** land → hook (hero + terminal glimpse of Quest) → understand why Codyza
  exists → see real products → meet real builders → glimpse Quest → see launch
  momentum → apply.
- **Structure (Blueprint homepage story, mapped onto the existing landing which
  already has hero/proof/chapters/manifesto/receipts/momentum/faces/ask):**
  1. **Hero** — editorial headline, Codyza Blue accent, dark terminal-in-hero
     (existing `TerminalAnimation` kept per D-001), live status line from real data.
  2. **Why Codyza Exists** — evolves the existing manifesto/chapters content.
  3. **Products We Build** — real approved `submissions` + flagship projects
     (Najikei, NepalBuddy); links to `/projects`.
  4. **Meet the Builders** — leadership (`FOUNDING_TEAM`/`LEADERSHIP_TEAM` constants:
     names, roles, photos, GitHub/LinkedIn/portfolio links — preserved verbatim) +
     top contributors; links to `/community` and `/about#leadership`.
  5. **Inside Codyza Quest** — the terminal narrative expanded; links to `/quest`.
  6. **Launch Timeline** — real launches/news; links to `/news`.
  7. **Join Codyza** — single primary CTA to `/join` ("~3 minutes" promise kept).
- **Data:** approved submissions (count + latest), contributor count, leadership
  constants, latest news entries. All server-fetched, ISR ≤60s.
- **Public/private:** fully public. Only public contributor fields (never email).
- **Responsive:** hero terminal scales down and may stack below headline at <768px;
  chapters scroll-scrub degrades to stacked static panels on mobile and
  reduced-motion.
- **States:** live counters render `0`-safe with invitation copy ("nothing live yet —
  you could fix that", existing pattern kept); Supabase failure → sections render
  with static fallback content, never a broken section.
- **Accessibility:** terminal animation is decorative (`aria-hidden`) with text
  alternative; scroll-scrub fully keyboard/reduced-motion safe.
- **Analytics:** `cz_home_hero_cta_click`, `cz_home_section_view` (per section id),
  `cz_home_apply_click`, `cz_home_quest_click`.
- **Acceptance criteria:**
  - [ ] All 7 blueprint sections present in order, each with mono index label.
  - [ ] Every number shown traces to a live Supabase query or a named constant (QA
        verifies against DB).
  - [ ] Leadership cards show name, role, photo, and working GitHub/LinkedIn/portfolio
        links — parity with the current site (screenshot diff).
  - [ ] With Supabase unreachable (mocked), page renders all sections with fallbacks.
  - [ ] Reduced-motion run-through: no pinning, no autoplaying marquee, content
        identical.
  - [ ] Lighthouse ≥90 perf / ≥95 a11y on mobile emulation.

### 6.2 Projects (`/projects`) — Evolved

- **Purpose:** prove "real products, real launches" with a browsable record.
- **Users:** Visitor, Verifier, Member.
- **Journey:** browse grid → filter by tech → open GitHub/live URL → (future) open
  case study → CTA to join.
- **Data:** `submissions` where `status = approved` (project_name, github_url,
  live_url, description, tech_stack, xp_earned, codyza_id, created_at) + counts.
  Existing ISR (`revalidate = 60`) kept. Contributor attribution links to
  `/contributor/[id]`.
- **Public/private:** approved submissions only — pending/rejected never leak.
  `ai_score` is **not** shown publicly (internal review signal).
- **Responsive:** card grid 1-col (mobile) / 2-col (tablet) / 3-col (desktop);
  filter pills horizontally scrollable on mobile.
- **States:** loading = ISR (no client spinner); empty = invitation copy; filter with
  zero results = "no projects with X yet" + clear-filter action; error = cached/ISR
  fallback.
- **Accessibility:** filter pills are buttons with `aria-pressed`; card link target is
  the whole card with a single accessible name.
- **Analytics:** `cz_projects_filter` (tech), `cz_projects_card_click` (project,
  destination: github|live|case_study).
- **Acceptance criteria:**
  - [ ] Every approved submission in the DB appears; no non-approved row appears
        (QA seeds one of each status and verifies).
  - [ ] Tech filter is URL-addressable (`?tech=…`) and shareable.
  - [ ] External links open in new tab with `rel="noopener"`.
  - [ ] `ai_score` absent from the rendered HTML and the page's data payload.

### 6.3 Community (`/community`) — New (D-003)

- **Purpose:** one front door for "the people of Codyza": contributors, leaderboard,
  achievements — the blueprint's Community nav item.
- **Users:** Visitor, Member (pride/sharing), Verifier.
- **Journey:** land → see community stats (members, total XP, active streaks) → top
  builders (podium reuse from `/leaderboard`) → browse contributor directory →
  open a profile → CTA to join.
- **Data:** `contributors` public fields (codyza_id, name, github, xp, rank, streak,
  role, avatar_url) + aggregate stats; achievements once modeled (open question Q3).
- **Public/private:** public fields only; **email never queried on public pages**;
  contributors can appear only after completing onboarding (implicit consent —
  confirm with founder, open question Q4).
- **Responsive:** directory grid 1/2/3-col; stats band stacks on mobile.
- **States:** empty directory = invitation copy; search/filter zero-results state;
  ISR for load; error = fallback stats band hidden, directory shows retry.
- **Accessibility:** directory is a `ul` of linked cards; rank communicated by text +
  badge, never color alone.
- **Analytics:** `cz_community_profile_click`, `cz_community_leaderboard_click`,
  `cz_community_join_click`.
- **Acceptance criteria:**
  - [ ] `/community` in top nav; links through to `/leaderboard` and profiles.
  - [ ] Rendered payload contains no email addresses or `is_admin` flags (QA inspects
        HTML + network).
  - [ ] Directory paginates or lazy-loads past 50 contributors (no unbounded list).

### 6.4 Leaderboard (`/leaderboard`) — Kept/Evolved

- **Purpose:** public proof-of-work ranking (existing feature, preserved).
- **Users:** Visitor, Member.
- **Journey:** view podium (top 3) → scan top-100 table → open profiles.
- **Data:** existing query (top 100 contributors by XP: codyza_id, name, github, xp,
  rank, streak, role, avatar_url). Existing `LeaderboardPodium`, `RankBadge`
  components evolve to 2.0 tokens.
- **Public/private:** as §6.3.
- **Responsive:** table collapses to stacked rows at <768px with rank, name, XP
  primary; tabular figures for XP (REDESIGN §3).
- **States:** empty = invitation; error currently logs and returns `[]` — 2.0 must
  show a visible error state with retry, not a silently empty board.
- **Accessibility:** real `<table>` semantics (or list with proper roles); podium
  order also in DOM order for screen readers.
- **Analytics:** `cz_leaderboard_profile_click` (rank position).
- **Acceptance criteria:**
  - [ ] Order matches `ORDER BY xp DESC` exactly (QA cross-checks DB).
  - [ ] XP values use tabular numerals; streak and rank tier visible per row.
  - [ ] Simulated fetch error shows retry UI, not an empty leaderboard.

### 6.5 Contributor Profile (`/contributor/[id]`) — Kept/Evolved

- **Purpose:** shareable public identity — the CZX ID is a credential (Verifier
  persona) and a badge of pride (Member persona).
- **Users:** Verifier, Visitor, Member (own profile).
- **Journey:** arrive via leaderboard/community/shared link → see CZX ID card, rank,
  XP progress to next rank (existing 8-rank ladder preserved), streak, approved
  projects → open GitHub/projects.
- **Data:** contributor public fields by `codyza_id` (case-insensitive, existing
  uppercase normalization kept); their approved submissions; XP-to-next-rank math
  (existing `RANK_XP` ladder — becomes a shared constant, single source of truth,
  currently duplicated across files).
- **Public/private:** public fields + approved submissions only. Email, pending
  submissions, admin flags never rendered.
- **Responsive:** CZX ID card as hero object scales to full-width on mobile.
- **States:** unknown ID → `notFound()` (existing, kept) with branded 404 + link to
  `/community`; zero projects → invitation copy.
- **Accessibility:** ID card contents readable as text (not image-only); rank/XP bar
  has text equivalent.
- **Security:** `id` param sanitized (existing uppercase + `.single()` lookup);
  no enumeration concerns beyond public data.
- **Analytics:** `cz_profile_view` (own vs other), `cz_profile_project_click`.
- **Acceptance criteria:**
  - [ ] Metadata: title `Name (CZX-…) | Codyza` + OG card renders on link unfurl.
  - [ ] Rank ladder math verified: profile at 1499 XP shows "Associate Engineer",
        1 XP to "Software Engineer" boundary behaves correctly at exactly 1500.
  - [ ] Invalid/missing ID returns 404 status (not soft error page).

### 6.6 About + Leadership (`/about`) — New page, existing content

- **Purpose:** mission, story, and leadership in one canonical place (currently
  scattered across `/#about`, `/#team`, `/team` redirect).
- **Users:** Visitor, Verifier, press.
- **Journey:** story of why Codyza exists → how it works (Quest workflow overview) →
  leadership grid → CTA to join or contact.
- **Data:** leadership constants (names, roles, photos, GitHub/LinkedIn/portfolio —
  preserved 1:1 from `src/constants/team.ts`); org story copy (Content Strategist).
- **Public/private:** fully public.
- **Responsive:** leadership grid 1/2/4-col; photos `next/image` with proper alt
  ("Name, Role at Codyza").
- **States:** static page — only image-load fallbacks (initials avatar).
- **Accessibility:** leadership social links have distinct accessible names
  ("Name on GitHub"), not repeated "GitHub" ×N.
- **Analytics:** `cz_about_leader_link_click` (person, network).
- **Acceptance criteria:**
  - [ ] `/team` and `/#team` land on leadership content (redirects verified).
  - [ ] Every leader from the current site appears with identical name, role, photo,
        and links (parity checklist against production).
  - [ ] Page is fully static (no runtime data dependency).

### 6.7 Join (`/join`) — Evolved from `/apply`

- **Purpose:** convert intent into applications; the funnel's bottom.
- **Users:** Applicant.
- **Journey:** read expectations ("five questions, ~3 minutes, a real person reads
  every answer" — existing promise kept) → multi-step wizard with progress →
  submit → confirmation with what-happens-next → admin reviews (§6.13) → accepted →
  invite email → onboarding (§6.11).
- **Data:** writes to `applications` via `/api/apply` (existing contract kept).
- **Public/private:** form is public; submitted applications visible only to admins.
  Applicant PII (email, answers) never readable via anon RLS.
- **Responsive:** wizard single-column, one question per step on mobile; step
  transitions honor reduced-motion.
- **States:** per-field inline validation on blur with recovery text; submit button
  loading state; success = confirmation screen with timeline expectation; error =
  preserved form data + retry (never lose the applicant's answers); duplicate
  application (same email) = friendly "already applied" message.
- **Accessibility:** visible labels, `aria-invalid` + described-by error text,
  autofocus first invalid field on failed submit, progress announced.
- **Security:** server-side validation of all fields; rate limiting per IP/email on
  `/api/apply`; honeypot or equivalent spam control (no CAPTCHA vendor — keep it
  human-friendly; AppSec to spec).
- **Analytics:** `cz_apply_start`, `cz_apply_step` (n), `cz_apply_submit`,
  `cz_apply_error`, `cz_apply_duplicate` — full funnel.
- **Acceptance criteria:**
  - [ ] `/apply` permanently redirects to `/join`; deep links and old emails still work.
  - [ ] Submitting with an invalid field focuses that field and reads the error to
        screen readers.
  - [ ] A network failure mid-submit preserves every entered answer.
  - [ ] Duplicate email produces the friendly state, not a server error.
  - [ ] New row appears in `applications` and in the admin queue within 5s.

### 6.8 Quest (`/quest`) — New public explainer (D-003)

- **Purpose:** the blueprint puts Quest in the top nav; visitors need to understand
  the internal platform without logging in. This page is the bridge: what Quest is,
  the workflow (Apply → Review → Accepted → Onboarding → Dashboard → Tasks →
  Projects → Certificates), real screenshots of the dark Arcade UI, and the payoff
  framing ("the dark UI you glimpsed in the terminal").
- **Users:** Visitor, Applicant, Verifier (context for certificates).
- **Journey:** read workflow → see screenshots → CTA: members "Log in", visitors
  "Join".
- **Data:** static content + optionally live counts (members, tasks completed).
- **Public/private:** screenshots must be scrubbed of real member PII (use seeded
  demo data for captures — QA verifies).
- **States/responsive/a11y:** static page rules (§6.0); workflow diagram must have a
  text/list equivalent.
- **Analytics:** `cz_quest_login_click`, `cz_quest_join_click`.
- **Acceptance criteria:**
  - [ ] Logged-in members see "Open dashboard" (→ `/member`); logged-out see
        "Log in" + "Join" (session-aware CTA).
  - [ ] All 8 workflow stages from the blueprint are named on the page.
  - [ ] No real member name/email/ID visible in any screenshot.

### 6.9 News (`/news`, `/news/[slug]`) — New, MVP-lite (D-004)

- **Purpose:** launch updates and announcements ("Codyza News" preserve item;
  homepage Launch Timeline source).
- **Users:** Visitor, Member.
- **Journey:** scan reverse-chronological feed → read entry → share.
- **Data:** MDX files in-repo (`content/news/*.mdx` — final location per Frontend
  Architect) with typed frontmatter: title, date, summary, tag
  (launch|update|announcement), optional hero image. Statically generated.
- **Public/private:** fully public.
- **Responsive/states:** feed stacks on mobile; empty feed = "first launch coming
  soon" invitation; unknown slug = 404.
- **Accessibility:** entries are articles with dates in `<time>`; feed navigable by
  headings.
- **Analytics:** `cz_news_entry_view` (slug), `cz_news_share_click`.
- **Acceptance criteria:**
  - [ ] Adding one MDX file and deploying publishes the entry, updates the feed, the
        homepage Launch Timeline, and the sitemap — no code changes.
  - [ ] Each entry has unique metadata + OG image (fallback template OG allowed).
  - [ ] Feed renders correctly with 0, 1, and 20+ entries.

### 6.10 Certificate Verification (`/certificates/verify`) — New, MVP-lite (D-005)

- **Purpose:** public certificate verification is a mandated preserve item; employers
  must be able to confirm a Codyza certificate is genuine.
- **Users:** Verifier (primary), Member (sharing their cert).
- **Journey:** enter certificate ID (from the certificate document) → see verdict:
  valid (holder name, CZX ID link, program, issue date) or not found.
- **Data:** new Supabase `certificates` table (id/code, contributor codyza_id,
  title/program, issued_at, status), populated manually by admins from Quest until a
  Quest API exists (D-005; Quest stays source of truth — this table is a synced
  public projection). Read-only public endpoint or server action.
- **Public/private:** lookup by exact code only — **no browse/list endpoint** (no
  enumeration of all certificates); revoked certs return "not valid".
- **Responsive:** single centered form, works at 375px.
- **States:** idle → loading → valid / not-found / revoked / rate-limited / error.
  "Not found" copy must not distinguish "never existed" from "revoked" beyond
  valid/not-valid (AppSec guidance).
- **Accessibility:** result announced via `aria-live`; form labeled.
- **Security:** rate-limit lookups; codes non-sequential (no guessing); RLS: anon can
  select only via the exact-match path.
- **Analytics:** `cz_cert_verify_attempt`, `cz_cert_verify_result` (valid|invalid).
- **Acceptance criteria:**
  - [ ] Valid code → holder name, program, issue date, and link to their
        `/contributor/[id]`.
  - [ ] Invalid and revoked codes → same-shaped "not valid" result.
  - [ ] 20 rapid lookups from one client triggers rate limiting with a clear message.
  - [ ] No API response or page ever lists multiple certificates.

### 6.11 Auth + Onboarding (`/login`, `/forgot-password`, `/set-password`, `/onboarding`, `/auth/callback`) — Kept/Evolved

- **Purpose:** the "airlock" between paper and Arcade; also where accepted applicants
  become contributors with a CZX ID.
- **Users:** Member, Applicant (accepted), Admin.
- **Journey (preserved):** invite/magic link or password login → (first time)
  `/set-password` → `/onboarding` (name, avatar upload with crop — existing
  `react-easy-crop` flow kept — CZX ID assignment via
  `/api/onboarding/create-profile`) → `/member`.
- **Data:** Supabase Auth; `contributors` insert on onboarding; `avatars` storage.
- **Public/private:** auth pages public; onboarding requires session;
  `shouldCreateUser: false` on magic link (existing — no self-signup) is preserved.
- **Responsive:** centered card ≤420px, full-width on mobile.
- **States:** loading buttons; auth errors humanized ("wrong email or password", not
  raw Supabase errors); magic-link-sent confirmation state (existing, kept); expired
  link state on `/set-password`; onboarding avatar upload progress + failure retry;
  already-onboarded user hitting `/onboarding` → redirect to `/member`.
- **Accessibility:** forms per §6.0; password visibility toggle with accessible
  label; error text associated to fields.
- **Security (IAM + AppSec own the review):** session cookies via Supabase SSR
  helpers; `next` redirect param validated against same-origin paths (open redirect
  guard); no user enumeration in error copy; avatar uploads validated
  (type/size) server-side.
- **Analytics:** `cz_auth_login` (method: password|magic), `cz_auth_error`,
  `cz_onboarding_complete`.
- **Acceptance criteria:**
  - [ ] Full accepted-applicant path (invite → set password → onboard → dashboard)
        passes E2E without manual DB edits.
  - [ ] Magic link cannot create a new user for an unknown email.
  - [ ] `login?next=https://evil.example` does not redirect off-origin.
  - [ ] Onboarding assigns the next sequential CZX ID exactly once (no dupes under
        double-submit — QA tests rapid double click).
  - [ ] All four pages render in the dark member theme (visual regression).

### 6.12 Member Portal (`/member`, `/member/projects`, `/member/bounties`, `/member/groups`, `/member/settings`) — Kept/Evolved

- **Purpose:** the contributor's operating surface — dashboard (XP, rank, streak,
  quests), project submission, bounty claiming, group membership, profile settings.
  The visual reward for joining (dark Arcade).
- **Users:** Member; Admin (as a member).
- **Journey:** log in → dashboard shows XP/rank progress + recent submissions +
  notifications → submit a project (name, GitHub/live URLs, description, tech stack
  via `/api/submit`) → track status pending → approved (+XP) → claim bounties →
  view groups → update settings (name, github, role, bio, skills, avatar via
  `/api/member/update`).
- **Data:** `contributors` (own row), `submissions` (own), `bounties`,
  `project_groups` + `group_members`, `notifications`, `xp_history`, `reactions`.
- **Public/private:** members see their own data + shared community data (bounties,
  groups). RLS must scope writes to own rows; a member must not be able to update
  another contributor or claim on someone's behalf (current bounty claim passes
  contributor id from client — Backend + IAM must enforce server-side identity;
  flagged as a 2.0 hardening requirement).
- **Responsive:** member nav collapses to drawer on mobile (keyboard navigable);
  dense tables become stacked cards <768px.
- **States:** skeleton loading on all data panels (REDESIGN Phase 4); empty states
  (no submissions yet → "ship your first project" CTA; no open bounties; no groups);
  error with retry per panel; unauthorized → `/login?next=` (existing layout
  redirect kept, evolved to preserve `next`).
- **Accessibility:** XP progress bars with text values; status conveyed by label +
  color; notification bell with unread count in accessible name.
- **Security:** all mutations authenticate via session server-side;
  submission/settings inputs validated server-side; avatar upload constraints.
- **Analytics:** `cz_member_submit_project`, `cz_member_bounty_claim`,
  `cz_member_settings_save`, `cz_member_notification_open`.
- **Acceptance criteria:**
  - [ ] Every existing capability (submit project, claim bounty, view groups, edit
        settings + skills + avatar, notifications, standup/submit redirects) works
        post-redesign — full parity E2E suite.
  - [ ] Dashboard XP/rank/next-rank math matches `/contributor/[id]` for the same
        user (shared ladder constant).
  - [ ] A member cannot mutate another member's data (QA attempts forged requests).
  - [ ] Approved submission reflects on public `/projects` within ISR window (≤60s).
  - [ ] Every panel has visible skeleton, empty, and error states (storybook or
        forced-state QA pass).

### 6.13 Admin Portal (`/admin`, `/admin/analytics`) — Evolved

- **Purpose:** operate the org: review applications, approve/reject submissions
  (awarding XP), manage contributors (edit XP/rank/role, delete), invite accepted
  applicants, view analytics.
- **Users:** Admin only.
- **Journey:** review application → invite (`/api/admin/invite`) → applicant onboards;
  review submission → approve (XP awarded, appears publicly) or reject (feedback);
  manage contributor records; monitor analytics (growth, XP distribution,
  submission throughput).
- **Data:** all tables; `applications` full PII visible here only.
- **Public/private:** hard admin boundary: server-verified `is_admin` on every admin
  page load **and** every admin API route (`/api/admin/*` — existing `verify`
  route pattern extended). Non-admin members get a friendly unauthorized state, not
  a crash; unauthenticated get `/login`.
- **Responsive:** desktop-first is acceptable, but must be *usable* (not pixel-
  perfect) at 768px; tables scroll within their own container on small screens.
- **States:** loading skeletons on queues; empty queues ("inbox zero" state); action
  confirmations for destructive ops (delete contributor requires typed confirmation);
  optimistic UI allowed only with rollback on failure; error toasts with retry.
- **Accessibility:** function over flourish (REDESIGN Phase 5): real tables, status
  chips with text, keyboard-operable modals, charts with data-table fallback.
- **Security (AppSec sign-off required):** admin mutations audit-friendly (who/when
  captured — at minimum `updated_by`/timestamps; full audit log is future phase);
  analytics page must not use anon client for privileged aggregates if RLS blocks
  them (current `NEXT_PUBLIC` anon usage in `admin/analytics/page.tsx` reviewed by
  Supabase Engineer).
- **Analytics:** `cz_admin_application_decision` (accept|reject),
  `cz_admin_submission_decision`, `cz_admin_contributor_edit`.
- **Acceptance criteria:**
  - [ ] Non-admin member requesting `/admin` or any `/api/admin/*` gets 403/redirect —
        verified with a real non-admin session, and API checks are server-side.
  - [ ] Approve-submission flow: status→approved, XP added to contributor,
        `xp_history` row written, public projects page updated.
  - [ ] Deleting a contributor requires explicit confirmation and cannot happen from
        a single click.
  - [ ] Analytics numbers match direct DB queries for the same period (QA spot-check).

### 6.14 Contact (`/contact`) + Legal (`/legal/privacy`, `/legal/terms`) — New, MVP-lite

- **Purpose:** blueprint supporting pages; trust + compliance basics.
- **Contact:** static page — org email, Slack gate (existing `SlackGateButton`
  pattern), socials from `SOCIAL_LINKS`. **No contact form in MVP** (cut to prevent
  spam-handling scope; email link suffices — revisit on demand).
- **Legal:** static privacy policy + terms authored by Content Strategist with
  founder review (what data is collected: applications, contributor profiles,
  analytics).
- **States/a11y/responsive:** static-page rules (§6.0).
- **Acceptance criteria:**
  - [ ] Footer links to Contact, Privacy, Terms from every public page.
  - [ ] Privacy policy names the actual data collected by §6.7 and §6.12 flows and
        the analytics tool chosen in Q5.

---

## 7. Analytics Plan

- **Convention:** `cz_<area>_<action>` (+ typed payload). Events enumerated per
  feature in §6. Page views + Core Web Vitals tracked on all routes.
- **Funnels:** (a) Visitor → apply start → apply submit; (b) Invite → onboarded →
  first submission; (c) Home section-scroll depth.
- **Privacy:** no PII in event payloads (codyza_id allowed — it is public; email never).
- **Tool:** owner = SEO/Performance & Analytics Engineer; recommendation Vercel
  Analytics + a lightweight event layer. Final tool choice is **open question Q5**
  (must be reflected in the privacy policy).

---

## 8. Features-to-Preserve Checklist (launch blocker — QA signs each)

| # | Preserve item | Where it lives today | 2.0 home | Verified |
|---|---------------|----------------------|----------|----------|
| P1 | Mission, story, public content | `/` sections, `src/constants/landing.ts` | `/` + `/about` | ☐ |
| P2 | Leadership names, roles, photos, GitHub/LinkedIn/portfolio links | `src/constants/team.ts`, `/#team` | `/about#leadership` + homepage §4 | ☐ |
| P3 | Contributors + public profiles | `contributors` table, `/contributor/[id]` | Same route, evolved | ☐ |
| P4 | Codyza IDs (CZX-…) | `contributors.codyza_id`, onboarding assignment, ID card component | Unchanged; ID card evolved | ☐ |
| P5 | XP, ranks (8-tier ladder), streaks | `contributors`, `xp_history`, rank ladder constants | Unchanged; ladder becomes single shared constant | ☐ |
| P6 | Leaderboard | `/leaderboard` | Same route + `/community` surfacing | ☐ |
| P7 | Achievements | Rank badges + streaks (no separate table found) | Community/profile; model per Q3 | ☐ |
| P8 | Existing projects + future case studies | `submissions` (approved), `/projects` | Same route; case studies future phase | ☐ |
| P9 | Application + acceptance workflow | `/apply`, `/api/apply`, `applications`, `/api/admin/invite` | `/join` (redirect from `/apply`), same APIs | ☐ |
| P10 | Member portal (dashboard, projects, bounties, groups, settings, notifications, reactions) | `/member/*` | Same routes, evolved | ☐ |
| P11 | Admin portal + analytics | `/admin`, `/admin/analytics` | Same routes, evolved | ☐ |
| P12 | Quest integration (tasks, submissions, progress, breaks, announcements, certificates) | Submissions/XP flows in-app; Quest concepts | `/quest` explainer (MVP) + sync architecture (future, §9) | ☐ |
| P13 | Public certificate verification | Not implemented in this repo | `/certificates/verify` (new, D-005) | ☐ |
| P14 | News + launch updates | Homepage timeline content | `/news` + homepage Launch Timeline | ☐ |
| P15 | Public/private data controls | RLS + route guards | Hardened per §6.12/§6.13 | ☐ |
| P16 | Mobile, a11y, security, SEO, performance quality | Partial | §6.0 gates + Phase 6 | ☐ |
| P17 | Redirect routes (`/team`, `/submit`, `/member/submit`, `/member/standup`) | Redirect stubs | Kept (targets updated where noted) | ☐ |

---

## 9. MVP vs Future Phase

### MVP (Codyza 2.0 launch)

Everything in §6 marked MVP: evolved Home/Projects/Leaderboard/Profile/Join/Auth/
Member/Admin + new Community, About, Quest explainer, News (MDX), Certificate
verification (synced table), Contact, Legal — on the D-001 merged design system.

### Explicitly future phase (post-launch backlog, in priority order)

1. **Case studies** (`/projects/[slug]`): narrative write-ups for flagship projects
   (Najikei, NepalBuddy) — depends on Content Strategist bandwidth, not engineering.
2. **Quest live sync:** automated data flow Quest → Codyza.com (certificates,
   announcements, task progress) replacing manual sync; requires a Quest API contract
   (Q1). Includes surfacing Quest announcements in the member portal.
3. **Achievements system v2:** first-class achievements model + profile badges (Q3).
4. **Admin audit log:** full who-did-what history for admin mutations.
5. **News authoring UX:** only if MDX-in-repo proves too much friction for
   non-technical admins (would reverse D-004 via a new decision entry).
6. **Contact form** with spam handling (currently cut, §6.14).
7. **OG image generation** per profile/project (template OG ships in MVP).

### Cut entirely (see §1.4 non-goals)

CMS, i18n, payments, forum/comments, public API, native app, new gamification.

---

## 10. Milestones (aligned to the blueprint's 6 phases)

| Milestone | Blueprint phase | Deliverables | Exit criteria |
|-----------|-----------------|--------------|---------------|
| **M1 — Strategy** | Phase 1: Brand & Product Strategy | This PRD; `docs/brand-direction.md` (Brand Director, per D-001); `docs/sitemap.md` (Information Architect); personas + trust-problem findings (UX Researcher) | Founder approves PRD scope + answers open questions Q1–Q5; D-001 identity documented |
| **M2 — Design System** | Phase 2: Design System | `globals.css` retokenized (`--cz-accent` → Codyza Blue per D-001; two-scope skeleton from REDESIGN §2 kept); fonts trimmed 6→3; `src/lib/motion.ts`; shared component inventory (navbar unification, EditorialHero, SpecimenCard, CZX card, RankBadge on new tokens) | Zero raw hex in changed components; both scopes pass contrast audit; unified navbar replaces Navbar/SmartNavbar |
| **M3 — Wireframes** | Phase 3: Wireframes | Wireframes for all MVP pages incl. all §6.0 states (loading/empty/error/unauthorized drawn, not implied) | PM + Lead UX sign off; every §6 journey traceable through wireframes |
| **M4 — High-fidelity UI** | Phase 4: High-fidelity UI | Hi-fi for public pages, auth, member, admin at 375/768/1024/1440; motion specs; content by Content Strategist (real copy, no lorem) | Brand anti-template review passed; a11y design review (contrast, focus order) passed |
| **M5 — Engineering** | Phase 5: Engineering | Build order: (a) foundation tokens/fonts/nav → (b) homepage → (c) public pages incl. new Community/About/Quest/News/Certs/Contact/Legal → (d) auth → (e) member → (f) admin. Schema: `certificates` table + RLS review of all tables; API hardening (§6.12 bounty-claim identity, §6.13 admin checks) | All §6 MVP acceptance criteria demoable; parity E2E suite green; preserve checklist §8 items P1–P15 implemented |
| **M6 — Launch** | Phase 6: QA, A11y, SEO, Launch | Full QA pass (all acceptance boxes), WCAG AA audit, keyboard + reduced-motion run-throughs, Lighthouse gates, SEO (metadata, sitemap.xml, robots, redirects), analytics live, rollback plan (DevOps) | §8 checklist 100% signed; G5/G6 targets met; founder go/no-go |

### Dependencies between workstreams

- **D-001 consequences first:** `docs/brand-direction.md` (Brand Director) blocks M2
  retokenization; M2 blocks all visual work in M4–M5.
- **Sitemap (M1)** blocks nav implementation and redirect table (M5c).
- **Content Strategist** copy blocks M4 hi-fi for About/Quest/News/Legal (new pages
  have no existing copy to fall back on).
- **Supabase Engineer** `certificates` schema + RLS review blocks §6.10 build and the
  §6.12/§6.13 hardening; hardening should not wait for visual work (can start in M2
  window).
- **Quest data contract (Q1)** blocks only future-phase item 2 — MVP deliberately
  does not depend on it (D-005).
- **QA** parity E2E suite should be written against the *current* site during M2–M4
  so M5 refactors are regression-guarded (test-first on existing behavior).
- **Next.js caveat:** this repo's Next.js has breaking changes — engineers read
  `node_modules/next/dist/docs/` before writing code (AGENTS.md).

---

## 11. Open Questions for the Founder

| # | Question | Blocking | Status |
|---|----------|----------|--------|
| Q1 | Does Codyza Quest expose (or plan) an API/export for certificates, announcements, and progress? MVP assumes **no** and uses a manually-synced `certificates` table (D-005) — confirm | Future-phase Quest sync only | **ANSWERED (D-009):** no API; manual sync confirmed |
| Q2 | Certificate ID format + the set of existing certificates to backfill (if any) | §6.10 build | **OPEN** |
| Q3 | Are "achievements" today anything beyond ranks + streaks (e.g., a Quest-side badge list)? Determines whether P7 needs a data model in MVP or is satisfied by ranks/streaks | §6.3/§6.5 scope | **ANSWERED (D-009):** ranks + streaks only; no MVP data model |
| Q4 | Contributor consent: is completing onboarding sufficient consent for public listing (profile, leaderboard, community directory), or do we need an opt-out flag in settings? | §6.3 launch | **ANSWERED (D-009):** onboarding = consent **plus** opt-out toggle in settings (MVP) |
| Q5 | Analytics tool approval (recommendation: Vercel Analytics + lightweight event layer) — affects privacy policy | M5 instrumentation + §6.14 legal copy | **ANSWERED (D-009):** Vercel Analytics + event layer |

---

## 12. Decision References

- **D-001** (DECIDED): merged visual direction — editorial layout, Codyza Blue accent,
  journal mono specimen labels, terminal-in-hero, dark Arcade member area.
- **D-002:** MVP scope cut (this PRD §1.4/§9).
- **D-003:** IA route mapping — Community hub, `/apply`→`/join`, `/team`→`/about`,
  `/quest` public explainer.
- **D-004:** News = MDX in repo, no CMS.
- **D-005:** Certificate verification via synced Supabase table, exact-match lookup only.

See `docs/decisions.md` for context and rejected alternatives.
