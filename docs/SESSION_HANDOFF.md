# Session Handoff — read this first

Written so a fresh AI tool with access to this folder can pick up the work
with zero re-explaining. The founder (casual tone, calls people "bro",
non-technical background, prefers direct honest answers over reassurance —
he has repeatedly caught and corrected inflated "everything's done!" status
reports from AI assistants, so don't round up) is handing this folder to a
different AI tool to continue the design/build work.

**Read `docs/decisions.md`, `docs/PRD.md`, and `docs/sitemap.md` before making
any design or scope call.** They are the authoritative, binding plan for
this project (see §1 below). Do not re-litigate decisions already marked
DECIDED in `docs/decisions.md` without a very good reason and the founder's
explicit sign-off — several "obvious improvements" (e.g. a decorative hero
globe animation) have already been proposed and explicitly rejected once
(D-008).

---

## 0. Git state — READ THIS FIRST

As of **2026-08-06**, a checkpoint commit (`a2b9ea8`, "Checkpoint: Codyza 2.0
homepage refactor + new public pages (about, join)") captured everything that
had accumulated uncommitted since the last real commit before it
(`e0a5f13`, "wip: sofi-style redesign components"). That gap between
`e0a5f13` and `a2b9ea8` — 137 files — is effectively **this entire visual
redesign**: the whole homepage refactor, the new `/about` and `/join` pages,
the rank-ladder consolidation, the test runner, dark-mode fix, avatar
`next/image` conversions, everything. None of it existed in git history
until that one checkpoint commit.

**Practical implication:** treat `a2b9ea8` as the safe baseline. Before
running any destructive git operation (`reset --hard`, `checkout .`,
`clean -f`, force-push, branch deletion) — check `git status` first and
confirm with the founder. If you're not sure whether something is checked
in, it's safer to assume it might not be and commit again rather than
assume git history has your back.

Local AI-tool state directories (`.claude/`, `.agents/`, `.claude-flow/`,
`.codex/`, `.screenshots/`) were deliberately excluded from that commit —
they're this session's tool config/cache, not project source. Don't assume
they reflect anything meaningful about the project; they're safe to ignore
or clean up.

---

## 1. What this project actually is, and the two things layered on top of each other

**Codyza** is a volunteer tech community/org: contributors ship real
projects, earn XP, rank up an 8-tier ladder, and the public site
(`codyza.com`) exists to build trust and recruit more contributors. Stack:
Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion + Supabase
(Postgres + Auth + Storage) + Vercel. No CMS, no other backend.

There are **two layers of planning documents** in `docs/`, from two
different points in the project's life, and it's important not to confuse
them:

### Layer A — the formal "Codyza 2.0" plan (`docs/decisions.md`, `docs/PRD.md`,
### `docs/sitemap.md`, `docs/brand-direction.md`, `docs/blueprint.md`)

Dated 2026-07-12 through 2026-08-01. This is a full, structured redesign
spec — written in a multi-role format (Product Manager, Information
Architect, Brand Director, etc. — this looks like it was produced by a
multi-agent/swarm-style planning session, not a single conversational
back-and-forth, so treat its claims about "current site state" as
sometimes aspirational rather than verified — see §6 for a confirmed
example). Key binding decisions from `docs/decisions.md`:

- **D-001:** Merged visual direction — light editorial public site,
  **Codyza Blue accent**, Field Journal's lowercase serif headlines +
  mono specimen labels, dark terminal-in-hero, dark "Arcade" member area.
- **D-002:** MVP scope (see PRD §1.4) — no CMS, no replatform, no new
  gamification, no i18n, no payments, no forum, no public dark-mode toggle.
- **D-003:** New top nav = **Home · Projects · Community · News · About ·
  Join · Quest**. New routes: `/community`, `/news`, `/about`, `/join`
  (replacing `/apply`), `/quest`. `/team` → `/about#leadership`.
- **D-004:** News = MDX files in-repo, no CMS.
- **D-005:** Certificate verification via a new, manually-synced Supabase
  `certificates` table — exact-match lookup only, no browse/list endpoint.
- **D-006:** Canonical Codyza Blue = `#302bfb` (deep variant `#1b14ba`).
  **Already applied** in `src/app/globals.css` (`--cz-accent`,
  `--color-codyza-blue`) — confirmed, not just planned.
- **D-007:** Typography = Instrument Serif lowercase display (`-0.03em`,
  line-height 0.95) + Inter body/UI + JetBrains Mono labels. Lowercase
  headlines are **deliberate house style**, not a bug — don't "fix" them.
- **D-008:** A decorative Earth/globe hero animation was **explicitly
  rejected** — a current SaaS hero cliché, threatens the Lighthouse budget.
- **D-009:** Founder answers to open PRD questions (achievements =
  ranks/streaks only, no separate model; contributor consent = onboarding
  + an opt-out toggle; analytics = Vercel Analytics + custom events).
- **D-010:** Member work-tracking (clock-in/out) ships as a pure
  accountability log — **no XP for time logged**, XP stays single-sourced
  from approved submissions only.

`docs/PRD.md` §6 has a full feature spec (purpose/users/journey/data/
states/a11y/security/analytics/acceptance-criteria) for every MVP page.
`docs/sitemap.md` has the exact route tree, nav/footer link groups, slug
rules, and — critically — §7 "Deltas Between This Spec and the Current
Route Tree", which is a literal, dated implementation checklist.

### Layer B — a "six-role strict code review" pass (referenced in git
### history, e.g. commit context around avatar/next-image conversions)

Before this handoff was rewritten, an earlier working session ran a
strict 6-role review (Product Owner, Technical Lead, UI/UX, Frontend,
Backend, QA — average score 5.7/10, kept deliberately strict) and started
fixing findings from it. That review is a published Artifact:
`https://claude.ai/code/artifact/4c6fe425-41d2-4a52-932b-1fc474ec20f0`.
Its fixes (dark-mode contrast bug, homepage split into components, footer
rebuild, `next/image` conversions, etc.) turned out to already be
*executing* the Layer-A PRD's M5 engineering milestone, even though that
session didn't originally frame it that way. **These two layers are not in
conflict — Layer B is Layer A's implementation, just discovered
mid-stream.** The one place they visibly *were* in tension: the founder at
one point proposed a dark/space/galaxy visual theme (see old commits
"Add GalaxyBackground", "sofi-style redesign") that directly contradicts
D-006 (light public site) and D-008 (reject decorative SaaS elements) —
that direction was abandoned (its files were deleted in the same
checkpoint commit `a2b9ea8`) in favor of the D-001-compliant editorial
system. If the founder brings up a dark/galaxy theme again, flag the
tension with D-006/D-008 rather than just building it, and push for
something tied to real Codyza data rather than generic stock space visuals
if it's revisited.

---

## 2. Current build status against the PRD (as of 2026-08-06)

A task list tracking the PRD's M5 engineering build order was created
this session. Status:

| # | Item | Status |
|---|------|--------|
| 1 | Test runner (Vitest) + smoke tests on `src/lib/ranks.ts` | **Done** — 8 tests passing |
| 2 | `/about` page | **Built**, not yet visually verified (see §5) |
| 3 | `/team` redirect retargeted to `/about#leadership` | **Done** |
| 4 | `/join` page + `/apply` → permanent redirect to `/join` | **Built**, not yet visually verified |
| 5 | `/community` hub (stats + podium + contributor directory) | **Not started** |
| 6 | `/quest` public explainer | **Not started** |
| 7 | `/news` feed + `/news/[slug]` (MDX) | **Not started** |
| 8 | `/contact` + `/legal/privacy` + `/legal/terms` | **Not started** |
| 9 | `/certificates/verify` | **Not started — blocked**, needs a new Supabase table (§4) |
| 10 | Unify nav/footer sitewide, retire the old `sofi/` shell | **Not started** |

The founder was explicitly asked "minimal cleanup vs. shell-only migration
vs. build the full PRD" and chose **"build the full PRD"** — so items 5–10
above are wanted, not optional polish. Recommended order: 5 → 6 → 7 → 8
→ 10, with 9 slotted in whenever the founder confirms the Supabase table
exists (item 10, the nav/footer unification, is listed last because the
new 7-item nav shouldn't go live pointing at pages that don't exist yet —
see `docs/sitemap.md` §7 delta #2's explicit warning about the `/team`
redirect 404ing if sequenced wrong; the same logic applies to the nav).

---

## 3. Environment quirk — READ BEFORE running `next dev` / `next build` / `tsc`

**This Mac runs under sustained heavy CPU load** (load average has been
observed between 3 and 8+ across this whole project). This is host-level
CPU contention, not a bug in the Codyza code, and not a network issue
(connectivity to GitHub/Supabase has been explicitly verified fast and
correct).

- `next dev` can take **15+ minutes** just to print "Ready", and then each
  **first** compile of a given route (in dev mode, Next compiles routes
  on-demand on first request) can take several more minutes on top of
  that. Confirmed via `ps -p <pid> -o pid,pcpu,time`: the process
  slowly accumulates CPU seconds over a long wall-clock time — that's
  "slow but alive," not stuck. A genuinely hung process would show 0.00
  accumulated CPU forever.
- `npx tsc --noEmit` will fail with `TS6053: File '.next/types/app/.../
  page.ts' not found` if you run it before any route has been requested
  in dev mode — those files are generated lazily per-route, not at server
  boot. Load the relevant page(s) in a browser first, or just re-run tsc
  after the dev server has been up and hit for a while.
- `npx vitest run` can fail with `Timeout waiting for worker to respond`
  under this same CPU pressure if it tries to spawn forked-process
  workers. **Fix already applied**: `vitest.config.ts` sets
  `pool: "threads"` (lighter-weight than the default forked-process pool)
  — this resolved it. If tests time out again, that's the first thing to
  check.
- **Never run `next build` and `next dev` at the same time** — doing so
  once already corrupted `.next` (`rm -rf .next` fixed it). Fully stop one
  before starting the other.
- **Don't repeatedly kill-and-restart** slow processes as a first
  reaction — it resets progress and has never once been the actual fix.
  Only kill a process if a *newer* one is confirmed (via `ps`) to be
  competing for the same port, or if the founder explicitly asks for a
  retry.
- A stale `tsconfig.tsbuildinfo` (TypeScript's incremental-build cache)
  can also throw `TS6053` for files that no longer exist after a rename/
  delete — safe to `rm tsconfig.tsbuildinfo` and re-run if that happens;
  it just triggers a full rebuild instead of an incremental one.
- **A full production build (`npm run build`) has never once been
  confirmed to complete successfully in this environment** — every prior
  attempt was still running (not failed, not crashed) when it was
  eventually stopped for time. If asked to verify the build, expect to
  need real elapsed time (tens of minutes) and don't edit source files
  while it's running.

---

## 4. Blocked on the founder — don't attempt these yourself

1. **Two SQL statements need to run in the Supabase dashboard** before
   bounty-completion or clock-in/out can be tested. Status as of last
   check: founder was unsure whether these have been run — confirm with
   them again before assuming either way, and don't claim these features
   are "tested" until they explicitly confirm it:

   ```sql
   alter table submissions add column bounty_id uuid references bounties(id);
   ```

   ```sql
   create table work_sessions (
     id                uuid primary key default gen_random_uuid(),
     contributor_id    uuid references contributors(id),
     codyza_id         text not null,
     bounty_id         uuid references bounties(id) null,
     group_id          uuid references project_groups(id) null,
     label             text null,
     started_at        timestamptz not null default now(),
     ended_at          timestamptz null,
     duration_minutes  integer null,
     summary           text null,
     status            text not null default 'active',
     created_at        timestamptz not null default now()
   );
   ```

   No DB credentials exist in these AI-tool environments, and it's the
   founder's production database — don't try to run these yourself.

2. **A third new table will be needed for `/certificates/verify`** (PRD
   §6.10 / D-005): `certificates` (id/code, contributor codyza_id,
   program, issued_at, status). Same deal — founder provisions it by hand
   in Supabase, same pattern as `work_sessions` above.

3. **Real content**: the founder has real trust content (photos, possibly
   case studies) and said he'd send it — don't fabricate testimonials,
   case studies, or additional photos in the meantime.

4. **Pricing for the web-builds service** (if that comes up in Spotlight/
   CTA copy): already explicitly resolved — no real number, but also
   explicitly not "free" (undersells the work). Current copy: "priced
   fairly for your budget." Don't revisit unless the founder brings it up.

---

## 5. Immediate next steps

1. Confirm `npx tsc --noEmit` is clean (see §3 for why it may need a
   warm dev server first) and visually check `/about`, `/join`, and that
   `/apply` correctly 308s to `/join` — none of this was visually
   verified before this handoff was written, only typechecked/read.
2. Continue the build order in §2, item 5 onward (`/community` next).
3. Whenever `/certificates/verify` comes up, stop and ask the founder to
   confirm the `certificates` table exists before writing code against it.
4. Before the nav/footer unification (item 10), get explicit confirmation
   that all the new pages it will link to are live — don't ship a nav
   with dead links.

---

## 6. Discrepancies found between the PRD's claims and actual current code

Worth knowing so you don't propagate PRD claims that turned out to be
inaccurate when checked against the real codebase:

- **PRD's "P2: Leadership names, roles, photos, GitHub/LinkedIn/portfolio
  links" preserve item is not actually true today.** Checked
  `src/constants/team.ts`: `FOUNDING_TEAM`'s social links are placeholder
  URLs (`https://twitter.com`, `https://linkedin.com` — not real
  profiles), and `LEADERSHIP_TEAM` entries have no link fields at all.
  The current live `Team` component doesn't render any social links. The
  new `/about` page built this session intentionally does **not**
  fabricate real-looking social links to satisfy the PRD's parity claim —
  it matches what's actually live (name, role, avatar/initials, bio). If
  real GitHub/LinkedIn/portfolio links are wanted, that needs real URLs
  from the founder, not invented ones.
- **`AGENTS.md` references `node_modules/next/dist/docs/` for
  "breaking changes" in this project's Next.js — that path does not
  exist.** The project's `package.json` was already downgraded (in the
  same uncommitted work later checkpointed at `a2b9ea8`) from a committed
  Next 16.2.6/React 19.2.4 to a real, standard **Next 15.3.5 / React
  18.3.1** — confirmed consistent across `package.json`,
  `package-lock.json`, and installed `node_modules`. Whatever prompted
  that AGENTS.md note no longer applies to the actually-installed stack;
  don't go looking for a docs folder that isn't there.
- **`@clerk/nextjs` is a listed dependency but appears unused** — the
  entire auth system per the PRD and actual `/login`, `/onboarding`, etc.
  pages is Supabase Auth. Nobody has explained why Clerk is in
  `package.json`. Flagged, not removed (wasn't part of any task asked
  this session) — worth asking the founder about before assuming it's
  either load-bearing or safe to delete.
- **`devDependencies` type packages are mismatched with the actual
  runtime**: `@types/react`/`@types/react-dom` are pinned to `^19` while
  the installed `react`/`react-dom` are `^18.3.1`. Pre-existing, not
  something this session caused — flagged in case it's the source of any
  confusing type errors.

---

## 7. Working conventions (carry these forward)

- **Brutal honesty over reassurance.** The founder has repeatedly asked
  "is everything actually done?" specifically because he suspects
  inflated status reports. State what's unverified as unverified.
- **Lowercase serif headlines are intentional** (D-007) — don't "fix"
  them to sentence case. The one deliberate exception the founder
  approved: a homepage CTA section using normal-case Inter instead, for a
  sales-pitch tone.
- Public pages are light/editorial; member/admin (`/member/*`,
  `/admin/*`) are dark "Arcade" — this split is a narrative feature, not
  a user preference, and there's no public dark-mode toggle (PRD §1.4).
- Lenis (smooth-scroll, `src/components/providers/smooth-scroll.tsx`)
  intercepts native scrolling and honors `prefers-reduced-motion`. Plain
  `window.scrollTo()` often won't trigger Framer Motion's `useScroll`/
  `whileInView` the way real wheel input does — dispatch synthetic
  `WheelEvent`s if you need to verify scroll-linked animation
  programmatically.
- The homepage's `src/components/landing/*` components (Nav, Footer,
  ScrollProgress, etc.) are already generic/reusable across any public
  page, not homepage-specific — new pages built this session (`/about`,
  `/join`) use them directly instead of the old `sofi/` shell
  (`src/components/shared/public-shell.tsx` + `sofi-nav.tsx` /
  `sofi-footer.tsx`), specifically to shrink the scope of the eventual
  nav/footer unification (§2, item 10). New pages going forward should do
  the same rather than reaching for `PublicShell`.
- Six existing pages (`/apply`→now redirects, `/projects`,
  `/leaderboard`, `/contributor/[id]`, `/onboarding`, `/submit`) still
  render through the old `sofi/` shell and its `sofi-*` CSS classes —
  visually a different system from the homepage/new pages' `cz-*` classes.
  This is why they haven't gotten the same visual pass yet — tracked as
  build-order item 10.
- All public writes are server-validated; RLS on every Supabase table;
  admin checks are server-side via `is_admin`, never trusted from the
  client (PRD §6.0). No secrets in client bundles. No PII in URLs or
  query strings.
