# Codyza 2.0 — Sitemap & Navigation Spec

- **Version:** 1.0
- **Date:** 2026-07-12
- **Owner:** Information Architect (`codyza-information-architect`)
- **Status:** M1 deliverable — encodes D-003 (route mapping, DECIDED) within D-002
  (MVP scope, DECIDED). This document is the canonical route/navigation contract;
  nav implementation and the redirect table (M5c) build from here.
- **Canonical inputs:** `docs/decisions.md` (D-002, D-003, D-004, D-005) ·
  `docs/PRD.md` §3–§5 · `docs/blueprint.md` (IA section) · `REDESIGN.md` ·
  actual route tree in `src/app/`

**Legend for dispositions** (matches PRD §5):

| Marker | Meaning |
|--------|---------|
| **Exists** | Route exists today; re-skin to 2.0 tokens only |
| **Evolved** | Route exists today; meaningful UX/content changes in 2.0 |
| **New** | Route does not exist today; built for 2.0 |
| **Redirect** | Route exists only to forward; never in navigation |

---

## 1. Full Route Tree (Codyza 2.0)

### 1.1 Public (light editorial, Codyza Blue, per D-001)

```
/                              Evolved    7-section homepage story (PRD §6.1)
/projects                      Evolved    approved-submissions grid, ?tech= filter
/projects/[slug]               New        case studies — FUTURE PHASE (D-002); reserve namespace now
/community                     New        community hub: stats + top builders + contributor directory (D-003)
/leaderboard                   Evolved    URL preserved as its own page; surfaced from /community (D-003)
/contributor/[id]              Evolved    public profile by Codyza ID (see §4 slug rules)
/news                          New        launch/update feed, MDX in repo (D-004)
/news/[slug]                   New        single news entry, statically generated
/about                         New        mission + story + #leadership section (absorbs /#about, /#team)
/join                          New*       application flow, evolved from /apply content (D-003)
/quest                         New        public Quest explainer with session-aware CTA (D-003)
/certificates/verify           New        exact-match certificate lookup, MVP-lite (D-005)
/contact                       New        static: email, Slack gate, socials — no form in MVP
/legal/privacy                 New        static privacy policy
/legal/terms                   New        static terms
```

\* `/join` is a new URL carrying the existing `/apply` feature (wizard + `/api/apply`
contract preserved). Disposition of the *feature* is Evolved; the *route* is New.

### 1.2 Redirects (never in navigation; all preserved forever — URLs are in the wild)

| Route | Target | Type | Notes |
|-------|--------|------|-------|
| `/apply` | `/join` | **Permanent (308)** | D-003. Old emails/links must keep working. Implement server-side (`next.config.ts` `redirects()` or route-level `permanentRedirect`), not a client spinner — the current `/apply` is a full page, not a redirect (see §7). |
| `/team` | `/about#leadership` | **Permanent (308)** | D-003 retargets the existing stub (today it points at `/#team`). |
| `/submit` | `/member/projects` | Kept | Existing stub, kept as-is per D-003. Currently a client-side `router.replace`; acceptable, server redirect preferred when touched. |
| `/member/submit` | `/member/projects` | Kept | Existing stub, kept as-is. |
| `/member/standup` | `/member` | Kept | Existing stub, kept as-is. |
| `/#about`, `/#team` | content moves to `/about` | Anchor migration | Homepage keeps sections but the canonical home of this content becomes `/about`. Any 2.0 homepage anchors that survive must not 404 old fragment links (fragments degrade gracefully — no redirect needed, but in-site links must be updated to `/about` / `/about#leadership`). |

### 1.3 Auth — the "airlock" (dark member theme)

```
/login                         Evolved (visual)   password + magic-link modes preserved; ?next= param (§5.3)
/forgot-password               Evolved (visual)
/set-password                  Evolved (visual)   invite/reset landing
/onboarding                    Evolved (visual)   profile + avatar crop + CZX ID assignment; session-gated
/auth/callback                 Exists             route handler, unchanged
```

### 1.4 Member portal (dark "Arcade"; session-gated, `/login?next=…` when logged out)

```
/member                        Evolved    dashboard: XP, rank, streak, submissions, notifications
/member/projects               Evolved    project list + submission form
/member/bounties               Evolved    browse/claim bounties
/member/groups                 Evolved    project groups + roles
/member/settings               Evolved    profile, skills, avatar
/member/submit                 Redirect   → /member/projects (kept)
/member/standup                Redirect   → /member (kept)
```

### 1.5 Admin portal (server-verified `is_admin`; friendly unauthorized state for non-admin members)

```
/admin                         Evolved    contributors CRUD, submissions review, applications queue
/admin/analytics               Evolved    growth, XP distribution, throughput
```

### 1.6 API routes (all Kept — contracts owned by Backend & API Architect)

```
/api/apply · /api/submit · /api/bounties · /api/groups · /api/member/update
/api/notifications · /api/reactions · /api/avatar · /api/onboarding/create-profile
/api/admin/invite · /api/admin/verify
```

**New API surface (MVP):** certificate lookup — read-only, exact-match, rate-limited,
no list endpoint (D-005; suggested path `/api/certificates/verify` or a server action —
Backend Architect decides; either way it must not be enumerable).

**Future phase:** Quest sync endpoints (PRD §9), `/projects/[slug]` case-study data.

### 1.7 Non-routes (deliberately absent — do not create)

- `/leadership` — leadership is `/about#leadership`, not a standalone route (D-003).
- `/certificates` (index) — no browse/list of certificates ever (D-005 anti-enumeration).
- `/news/tags/*`, author pages, RSS-as-page — News is a lite feed (D-004), not a blog engine.
- `/community/[anything]` — the directory links out to `/contributor/[id]`; no nested
  community routes in MVP.
- Any public dark-mode toggle route/param (PRD §1.4).

---

## 2. Navigation

### 2.1 Top navigation (public pages)

Per D-003 / Blueprint IA, in this exact order:

| Label | Href | Notes |
|-------|------|-------|
| Home | `/` | wordmark also links home; "Home" may be implicit (wordmark-only) on desktop |
| Projects | `/projects` | |
| Community | `/community` | new hub; `/leaderboard` is reachable *through* it, not from top nav |
| News | `/news` | |
| About | `/about` | replaces old `About → /#about` and `Team → /#team` links |
| Join | `/join` | primary CTA styling (accent fill) — visually distinct from links |
| Quest | `/quest` | session-aware (below) — links to the explainer, **never** straight to `/login` (D-003 rejected alternative 2) |

This replaces `NAV_LINKS` in `src/constants/site.ts` (currently About → `/#about`,
Projects, Leaderboard, Team → `/#team`). Leaderboard leaves the top nav; its URL is
preserved and it is surfaced prominently on `/community` and in the footer.

**Session-aware Quest CTA** (applies to the nav's Quest affordance and the CTA block
on `/quest` itself, PRD §6.8):

| Session state | Nav "Quest" item | `/quest` page CTA |
|---------------|------------------|-------------------|
| Logged out | links to `/quest` | primary "Join" → `/join`; secondary "Log in" → `/login?next=/member` |
| Logged in (member/admin) | links to `/quest`; nav additionally shows "Open dashboard" → `/member` (replaces or sits beside "Join") | primary "Open dashboard" → `/member` |

Session detection is server-side (Supabase SSR session); render logged-out defaults
statically and enhance — never block public paint on an auth check.

**Mobile:** drawer with the same seven items in the same order; Join keeps CTA styling;
drawer is keyboard-operable with focus trap + Esc (PRD §6.0).

### 2.2 Member navigation (dark Arcade — unchanged IA)

Dashboard (`/member`) · Projects (`/member/projects`) · Bounties (`/member/bounties`) ·
Groups (`/member/groups`) · Settings (`/member/settings`) · notification bell ·
link to own public profile (`/contributor/[id]`) · sign out. Admins additionally see
Admin (`/admin`).

### 2.3 Footer (every public page)

Four groups; replaces the current `sofi-footer` link set (which still points at `/apply`):

| Group | Links |
|-------|-------|
| **Explore** | Projects `/projects` · Community `/community` · Leaderboard `/leaderboard` · News `/news` |
| **Organization** | About `/about` · Quest `/quest` · Join `/join` · Contact `/contact` |
| **Trust** | Verify a certificate `/certificates/verify` · Privacy `/legal/privacy` · Terms `/legal/terms` |
| **Elsewhere** | GitHub, Instagram, Slack gate (`SOCIAL_LINKS`) · mailto `SITE_CONFIG.email` |

Plus wordmark and the "recently at codyza" timeline strip (REDESIGN §homepage-9), which
in 2.0 is fed by News entries (D-004) and links to `/news`. PRD §6.14 acceptance:
Contact, Privacy, Terms must be linked from every public page — the footer satisfies this.

Member/admin pages use a minimal footer (or none) — the Arcade is an app surface, not
a marketing surface.

---

## 3. Content Taxonomy & Cross-Linking

Four public content types, one identity spine (the Codyza ID):

### 3.1 Projects

- **Source:** `submissions` where `status = approved` (+ named flagship constants:
  Najikei, NepalBuddy).
- **Categorized by:** tech stack (`tech_stack[]` → filter pills, URL-addressable
  `?tech=`), recency (`created_at`), and — future phase — case-study flag
  (`/projects/[slug]`).
- **Cross-links:** project card → builder attribution → `/contributor/[id]`;
  project card → external GitHub/live URLs; `/projects` page CTA → `/join`;
  homepage §3 "Products We Build" → `/projects`.
- **Never public:** pending/rejected submissions, `ai_score`.

### 3.2 Contributors

- **Source:** `contributors` public fields (codyza_id, name, github, xp, rank, streak,
  role, avatar_url). Email and `is_admin` are never in a public payload.
- **Categorized by:** rank (8-tier ladder — the shared `RANK_XP` constant), XP
  (leaderboard order), streak, role.
- **Cross-links (the identity spine):**
  `/community` directory card → `/contributor/[id]` → their approved projects
  (subset of `/projects` data) → GitHub. `/leaderboard` rows → `/contributor/[id]`.
  Homepage §4 "Meet the Builders" → `/community` and `/about#leadership`.
  Certificate verification result → holder's `/contributor/[id]` (D-005).
- **Leadership** is a curated constant (`src/constants/team.ts`), not a contributor
  query; it lives at `/about#leadership` and on homepage §4. Leaders who are also
  contributors link to their `/contributor/[id]` where a Codyza ID exists.

### 3.3 News

- **Source:** MDX files in repo with typed frontmatter: `title`, `date`, `summary`,
  `tag`, optional hero image (D-004).
- **Categorized by:** `tag` — exactly one of `launch | update | announcement` — and
  reverse-chronological date. Tags render as mono specimen labels; no tag index pages
  in MVP (filtering, if any, is client-side on `/news`).
- **Cross-links:** `/news` feed → `/news/[slug]`; entries tagged `launch` feed the
  homepage §6 Launch Timeline and the footer "recently at codyza" strip; launch
  entries link to the shipped project on `/projects` (frontmatter may carry an
  optional `projectUrl`/`projectName`).

### 3.4 Certificates

- **Source:** Supabase `certificates` table — public *projection* of Quest, synced
  manually by admins (D-005). Quest remains source of truth.
- **Categorized by:** nothing publicly — exact-code lookup only, no browse, no list,
  no enumeration. Revoked and unknown codes return the same "not valid" shape.
- **Cross-links:** valid result → holder name, program, issue date, and link to
  `/contributor/[id]`. `/quest` explainer mentions certificates and links to
  `/certificates/verify` for verifiers.

### 3.5 Taxonomy invariants

- The **Codyza ID (CZX-…)** is the only public join key between content types.
- Every content type's public page carries exactly one primary CTA, and every
  public journey can terminate at `/join` within one click (storytelling arc,
  PRD §1.2).
- Achievements = ranks + streaks in MVP (pending founder Q3); no separate
  achievements taxonomy until decided.

---

## 4. Slug Rules

### 4.1 Contributor slugs = Codyza IDs (not names)

**Today** (`src/app/contributor/[id]/page.tsx`): the `[id]` param is uppercased
(`rawId.toUpperCase()`) and matched against `contributors.codyza_id` with `.single()`;
unknown IDs → `notFound()`. The page itself prints the share URL lowercase
(`codyza.com/contributor/czx-…`).

**2.0 specification (keeps this behavior, makes it canonical):**

- The contributor slug **is the Codyza ID** (`CZX-NNN`), never a name slug. Names
  change and collide; the CZX ID is the stable public credential (PRD P4).
- Lookup is **case-insensitive**: normalize param to uppercase before querying
  (existing behavior, kept).
- **Canonical URL form is lowercase**: `/contributor/czx-042` — matching the share
  URL already printed on the profile card. Uppercase variants must resolve (they do,
  via normalization); canonical/OG metadata and all internal links use lowercase.
- No name-based vanity slugs in 2.0 (would require a slug column, uniqueness policy,
  and rename handling — out of MVP scope; new decision entry required to add them).

### 4.2 News slugs

- Kebab-case, derived from the MDX filename (`content/news/<slug>.mdx` — final
  location per Frontend Architect, PRD §6.9): lowercase a–z, 0–9, hyphens; no dates
  in the slug (date lives in frontmatter). Example: `/news/najikei-launch`.
- Slugs are immutable once published (URLs are in the wild); fixing a slug means a
  redirect entry, not a rename.

### 4.3 Case-study slugs (future phase — reserve the convention now)

- `/projects/[slug]`, kebab-case product name (`/projects/najikei`). Must not collide
  with `/projects` query-param filtering (`?tech=` stays a param, never a path).

### 4.4 General URL conventions

- All paths lowercase, hyphen-separated, no trailing slashes, no file extensions.
- Collections are plural (`/projects`, `/certificates/verify`); singular pages are
  concepts (`/about`, `/quest`, `/join`, `/contact`).
- Section anchors are kebab-case nouns: `/about#leadership`, homepage section ids
  (`#hero`, `#why`, `#products`, `#builders`, `#quest`, `#timeline`, `#join`).
- Filters/state live in query params (`?tech=`, `?next=`), never in path segments.
- No PII in any URL or query string, ever (Codyza IDs are public and allowed).

### 4.5 Breadcrumbs

The public site is intentionally shallow (max depth 2), so **no global breadcrumb
component**. Depth-2 pages carry a single mono-label "back" affordance in the
specimen-label style instead:

| Page | Back affordance |
|------|-----------------|
| `/contributor/[id]` | "← community" → `/community` (**changes from today's "← back to leaderboard"**; when referred from `/leaderboard` the link may point back there — default is `/community`, the canonical people hub per D-003) |
| `/news/[slug]` | "← news" → `/news` |
| `/projects/[slug]` (future) | "← projects" → `/projects` |
| `/legal/*` | "← home" → `/` |

Member/admin areas use the persistent member nav (§2.2), not breadcrumbs.
`BreadcrumbList` structured data is emitted on depth-2 public pages for SEO even
though no visual breadcrumb trail renders (SEO Engineer owns markup).

---

## 5. Codyza-to-Quest Journey Map

The public site is "paper"; Quest/member is the dark "Arcade"; auth is the airlock.
Every hand-off from public → auth/member is enumerated here — no other public
surface may link into `/member/*` or `/admin/*` directly.

### 5.1 The primary journey (visitor → contributor)

```
Discover                    Apply                     Accepted                     Operate
────────────────────────    ─────────────────────     ─────────────────────────    ──────────────────
/  (hero terminal ····· glimpse of Quest)
/  §5 "Inside Quest" ─────→ /quest ─── "Join" ──────→ /join (wizard, ~3 min)
/  §7 "Join Codyza" ─────────────────────────────────→ /join
/projects · /community · /about · /news  (every page's single CTA) ─→ /join
                                                       │ submit → /api/apply
                                                       │ admin reviews (/admin)
                                                       │ invite email (/api/admin/invite)
                                                       ▼
                                        /set-password → /onboarding (CZX ID minted)
                                                       ▼
                                                    /member  (dark Arcade)
```

### 5.2 All public → auth/member hand-off points

| Public surface | Hand-off | Destination |
|----------------|----------|-------------|
| Top nav "Join" (every public page) | apply | `/join` |
| Top nav "Quest" | explainer first | `/quest` (never directly `/login` — D-003) |
| `/quest` CTA, logged out | join / log in | `/join` · `/login?next=/member` |
| `/quest` CTA, logged in | open dashboard | `/member` |
| Nav session slot, logged in | open dashboard | `/member` |
| Homepage §5 "Inside Codyza Quest" | learn | `/quest` |
| Homepage §7 / every page's terminal CTA | apply | `/join` |
| Invite email (accepted applicant) | activate | `/set-password` → `/onboarding` → `/member` |
| `/login` (direct or via `?next=`) | authenticate | `next` target or `/member` |
| Member's own profile `/contributor/[id]` | edit | `/member/settings` (shown only to the profile owner) |

### 5.3 Return paths (Arcade → paper) and gate rules

- Member nav links to the member's public `/contributor/[id]` ("view public profile")
  and the wordmark returns to `/`.
- Approved submissions surface publicly on `/projects` within the ISR window (≤60s).
- **Gate rules:** `/member/*` and `/onboarding` require a session → redirect to
  `/login?next=<attempted-path>`; `next` is validated same-origin (open-redirect
  guard, PRD §6.11). `/admin/*` additionally requires server-verified `is_admin`;
  authenticated non-admins get a friendly unauthorized state, not a redirect loop.
  Already-onboarded users hitting `/onboarding` → `/member`.
- Quest data flows back one way: Quest (source of truth) → admin-synced
  `certificates` table → `/certificates/verify` (D-005). No public page reads Quest
  live.

---

## 6. Sitemap.xml / SEO Notes (hand-off to SEO Engineer)

- `sitemap.xml` includes all public routes in §1.1 (including every `/news/[slug]`
  and every `/contributor/[id]` canonical-lowercase URL); excludes redirects (§1.2),
  auth (§1.3), member (§1.4), admin (§1.5), and API routes.
- Auth, member, admin: `noindex` + disallowed in `robots.txt`.
- `/certificates/verify` is indexed (the page), but lookup results are never
  crawlable URLs (no `?code=` permalinks — result renders in-page).
- Adding one News MDX file must update the feed, homepage timeline, and sitemap with
  no code changes (D-004 / PRD §6.9 acceptance).

---

## 7. Deltas Between This Spec and the Current Route Tree (implementation checklist, M5)

Recorded so nothing lands silently; none of these relitigate D-003 — they are the
work D-003 creates:

1. **`/apply` is a full page today, not a redirect** (`src/app/apply/page.tsx` +
   `layout.tsx`). M5: create `/join` carrying the wizard; convert `/apply` to a
   permanent server-side redirect.
2. **`/team` redirects to `/#team`** (`src/app/team/page.tsx`). M5: retarget to
   `/about#leadership` once `/about` exists — not before, or the redirect 404s.
3. **`NAV_LINKS` (`src/constants/site.ts`) is the old nav** (About→`/#about`,
   Projects, Leaderboard, Team→`/#team`). M5: replace with §2.1; remove Leaderboard
   from top nav (URL preserved).
4. **Footer (`sofi-footer.tsx`) links `/apply` and `/#about`**, and its "contact"
   is a mailto. M5: repoint to `/join`, `/about`, `/contact`, and add the Trust
   group (§2.3).
5. **`/submit` and `/member/submit`/`/member/standup` are client-side redirects**
   (spinner + `router.replace`). Kept per D-003; prefer server redirects when these
   files are next touched (SEO + no-JS correctness), no dedicated work item.
6. **`/contributor/[id]` back-link points to `/leaderboard`**; 2.0 default becomes
   `/community` (§4.5).
7. **Missing routes to create:** `/community`, `/news`, `/news/[slug]`, `/about`,
   `/join`, `/quest`, `/certificates/verify`, `/contact`, `/legal/privacy`,
   `/legal/terms` — all New in §1.1.
8. **Data-boundary flags (for AppSec/Supabase Engineer, not IA scope):**
   `/contributor/[id]` selects `*` from `contributors` and selects `ai_score` in its
   submissions query — both wider than the public-payload rules in PRD §6.0/§6.2/§6.5.
   Flagged, not fixed here.
9. **`next.config.ts` has no `redirects()` block** — the permanent redirects in §1.2
   (`/apply`, `/team`) belong there (or as route-level `permanentRedirect`); verify
   against this repo's Next.js docs (`node_modules/next/dist/docs/`) before
   implementing (AGENTS.md caveat).
