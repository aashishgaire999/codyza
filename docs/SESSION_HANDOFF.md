# Session Handoff — read this first in a new chat

Written to let a fresh Claude Code session pick up this work with zero
re-explaining. The founder (casual tone, calls me "bro", non-technical
background, prefers direct honest answers over reassurance) asked for this
because a long session needs to continue in a new chat without interruption.

**Nothing in this file is a git commit — all work described below is
currently uncommitted on `main`** (126 modified files as of this writing).
Do not `git reset`, `git stash`, or `git clean` anything without checking
`git status` first and confirming with the user — that would destroy real,
unsaved work.

---

## 0. Read this before touching `next dev` or `next build`

This is the single most important operational fact for continuing this
project in this environment.

**The user's Mac has been running under sustained heavy CPU load
(load average routinely 3–8) for this entire session**, apparently from
other running apps (a second, separate Claude Code session was found
running concurrently at one point — check for that first with
`ps aux | grep claude-code` before assuming it's gone). This is **not**
a bug in the Codyza code. Symptoms and the correct response:

- `next dev` / `next build` processes will often sit at **0% CPU for
  10–40+ minutes** before printing anything, then eventually work
  correctly. This has happened repeatedly and is confirmed to be
  OS-level CPU starvation, not a hang: `ps -p <pid> -o pid,pcpu,time`
  will show almost no accumulated CPU time despite huge wall-clock
  elapsed time. A genuinely stuck process would show 0.00 forever; this
  one slowly accumulates seconds.
- **Do not repeatedly kill and restart** as the first reaction — that
  resets progress and has never once been the fix. Only kill a process
  if you've confirmed via `ps` that a *newer* one is competing for the
  same port, or if the user explicitly asks you to retry.
- **Never run `next build` and `next dev` at the same time.** Doing so
  once already corrupted `.next` earlier this session (`rm -rf .next`
  fixed it). Always fully stop one before starting the other.
- To wait on a slow process without polling manually, use a background
  Bash command with a `while kill -0 <pid>; do sleep 5; done` loop and
  `run_in_background: true`, so the harness notifies you when it
  resolves instead of you burning turns on manual `sleep`.
- A **production build (`npm run build`) has never once completed
  successfully** in this environment across many attempts this session
  — every attempt was still running (not failed, not crashed) when it
  was eventually killed to free the port for something more urgent.
  This is the single biggest unverified risk on the project. If asked
  to verify the build, expect to need 20–60+ minutes of real elapsed
  time, and don't edit any source file while a build is running (it
  reads files as it compiles; a mid-build edit can produce a
  build result that doesn't match either the old or new code).
- Network connectivity itself is fine — this was explicitly tested
  (`curl` to github.com, supabase.com, and the project's actual Supabase
  REST endpoint all return fast, correct responses). The slowness is
  pure CPU scheduling starvation, not a network or Supabase issue.
- If the user says "show me the site" — start the dev server via the
  Claude_Browser `preview_start` tool with name `codyza-dev`, then poll
  in a background loop, and be honest that it may take a while. Don't
  promise "quick."

---

## 1. What this whole session has been about

The founder asked for a full "strict" six-role code review (Product
Owner, Technical Lead, UI/UX Designer, Frontend Developer, Backend
Developer, QA/Performance Specialist) of the Codyza site, then said
"let's start fixing our site as per the six roles and our plan."
Everything below is progress against that review. The review report
itself is a published Artifact:

**https://claude.ai/code/artifact/4c6fe425-41d2-4a52-932b-1fc474ec20f0**

(Six-role scores, average 5.7/10, kept deliberately strict — not
encouraging. If you need to re-publish/update it, use the Artifact tool
with that same URL passed as `url` to keep the link stable.)

---

## 2. What's actually done (verified, not just attempted)

- **Sitewide dark-mode contrast bug fixed.** The site was silently
  switching to `.dark` CSS based on OS preference (`next-themes`
  `enableSystem`), but public pages hardcode light-theme colors — text
  like "XP Progress" labels rendered white-on-white for any visitor
  with system dark mode. Fixed in
  `src/components/providers/theme-provider.tsx`
  (`defaultTheme="light" enableSystem={false}`). The member dashboard's
  own manual dark-mode toggle (`src/components/shared/theme-toggle.tsx`)
  is untouched and still works.
- **Homepage (`src/app/page.tsx`) fully refactored**: was 1,355 lines,
  now 50 lines, composing 10 new component files under
  `src/components/landing/`: `scroll-progress.tsx`, `nav.tsx`,
  `spotlight.tsx`, `chapters.tsx`, `features.tsx`, `about.tsx`,
  `projects.tsx`, `stats-band.tsx`, `team.tsx`, `apply-cta.tsx`,
  `footer.tsx`. Typecheck confirmed clean after the split.
- **Chapters section** (`ship`/`learn`/`grow` story) reordered to
  learn → grow → ship (was ship → learn → grow, per user's explicit
  request that "first you learn and grow and ship"), unified into one
  consistent two-column layout (previously each panel had a different,
  inconsistent structure), and each panel got a real designed diagram
  (dark terminal window, PR-review card, crew-avatar cluster) with
  staggered Framer Motion reveal animation, replacing generic
  translucent ghost icons. Numbering in `src/constants/landing.ts`
  (`CHAPTER_PANELS`) updated to match the new order.
- **Footer rebuilt** (`src/components/landing/footer.tsx`): removed a
  literal empty `<div />` that was wasting half the footer's width and
  pushing everything else into a big dead gap; now one compact block
  (wordmark + live "recently at codyza" activity feed, then a single
  horizontal nav row) instead of two sparse stacked rows.
- **"Get your website" / Spotlight CTA rebuilt**
  (`src/components/landing/spotlight.tsx`): was a wide card with only
  two small elements pushed to opposite edges (huge dead middle gap);
  now a proper two-column layout — left side has a real 3-step process
  list, right side has an actual contact card (icon, "Start a project"
  title, email, "Send an email" link) instead of a bare pill. Copy uses
  normal sentence case and the site's actual Inter/Instrument Serif
  fonts (was using the sitewide lowercase-mono micro-label convention,
  which read as too "developer-tool" for a sales pitch — this was an
  explicit, deliberate exception to the site's D-007 casing rule for
  this one section only, per the founder's direct instruction).
  Pricing language is deliberately non-numeric ("priced fairly for
  your budget", not "affordable" alone, not a dollar figure, not
  "free") — see §4 for why.
- **All 6 remote-avatar `<img>` tags converted to `next/image`**
  across: `src/components/landing/team.tsx` (×2),
  `src/app/contributor/[id]/page.tsx`,
  `src/components/shared/leaderboard-podium.tsx`,
  `src/app/member/page.tsx`, `src/app/member/projects/page.tsx`.
  `next.config.ts` updated to whitelist `*.supabase.co` in
  `images.remotePatterns` (previously only GitHub avatar domains were
  allowed). Typecheck confirmed clean.
  - **Two `<img>` tags were deliberately left alone** and should stay
    that way: `src/app/onboarding/page.tsx` (line ~217) and
    `src/components/member/avatar-upload.tsx` use the browser's global
    `Image()` constructor (for canvas-based photo cropping) elsewhere
    in the same file — importing `next/image`'s default export as
    `Image` would silently shadow that constructor and break the
    cropping code. `avatar-upload.tsx` **was** still converted, but
    carefully: imported as `import NextImage from "next/image"` (not
    `Image`), and given `unoptimized={preview.startsWith("blob:") ||
    preview.startsWith("data:")}` since its preview can be either a
    real remote URL or a local blob URL after cropping — Next's image
    optimizer cannot fetch `blob:` URLs server-side, so `unoptimized`
    is required for that case specifically. `onboarding.tsx`'s preview
    is *always* a blob (first-time photo picker, nothing saved yet),
    so there's no optimization value there and it was left as plain
    `<img>` on purpose.
- **Earlier in the session** (before the six-role review existed):
  fixed a Lenis/Framer-Motion scroll-freeze bug, fixed an undefined-font
  CSS bug, connected the homepage Team section and Footer to live
  Supabase data, shortened an overly-long pinned scroll section, fixed
  oversized section padding sitewide (`.cz-section` clamp reduced),
  fixed duplicate page `<title>` tags on the contributor and admin
  analytics pages, consolidated 5 duplicate rank-ladder implementations
  into one canonical `src/lib/ranks.ts`.
- **Bounty-completion and clock-in/out features** were built earlier
  this session (submission form bounty picker, admin approval marking
  bounties complete, a full clock-in/out timesheet page at
  `/member/standup`, an admin "sessions" tab). Code is done and
  typechecks, but **cannot be exercised at all** until the two SQL
  statements in §3 are run — see there.
- A real photo (team receiving a "1st Dollar Award" from the Marshall
  Area Chamber) was cropped to 16:9
  (`public/press/1st-dollar-award-crop.jpg`, cropped from
  `~/Downloads/IMG_9122.JPG` — original untouched) but **not yet placed
  anywhere on the site**. Ask the user where they want it before adding
  it.

---

## 3. Blocked on the user — do not attempt these yourself

1. **Two SQL statements must be run in the Supabase dashboard** before
   bounty-completion or clock-in/out can be tested at all. As of the
   last check-in, the user confirmed **these have not been run yet**:

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

   Don't try to run these yourself (no DB credentials in this
   environment, and it's the user's production database) — just remind
   the user if it comes up, and don't claim those features are "tested"
   until they confirm it's done.

2. **Real content**: the user said they have some real trust content
   (photos, possibly case studies) and "will send it" — don't fabricate
   testimonials, case studies, or additional photos in the meantime.

3. **Pricing for the web-builds service**: explicitly resolved — the
   user does NOT want a real number shown (case-by-case, volunteer-run)
   but also explicitly does NOT want to say "free" (undersells the
   work / invites being judged as low-quality). The current copy
   ("priced fairly for your budget") is the agreed solution. Don't
   revisit this unless the user brings it up again.

---

## 4. Open question awaiting the user's decision

**Do not unilaterally act on this — ask first if it hasn't been answered
yet.** While fixing a "duplicate Slack-gate button" item from the
review (Technical Lead finding), it became clear the issue is bigger
than a simple duplicate: `/apply`, `/projects`, `/leaderboard`,
`/contributor/[id]`, `/onboarding`, and `/submit` all render through
`src/components/shared/public-shell.tsx`, which uses an entirely
different, older nav/scroll-progress/footer system
(`src/components/landing/sofi/sofi-nav.tsx`,
`sofi-scroll.tsx`, `sofi-footer.tsx` — note `sofi-footer.tsx` is what
actually still uses the "duplicate" `SlackGateButton` component) than
the homepage's new `Nav`/`ScrollProgress`/`Footer`. This is *why* those
six pages never got the same design pass as the homepage — they're
running on a parallel, older shell entirely.

Two options were presented to the user, answer not yet received:

1. **Minimal**: just clean up the literal duplicate component, leave
   the six pages as-is on the old shell.
2. **Real fix**: migrate those six pages onto the same `Nav`/`Footer`
   the homepage now uses, so the whole site is one consistent system.

Given the review specifically penalized inconsistency across pages,
option 2 is the better fix, but it's a bigger visual change touching
6 live pages — get explicit confirmation before doing it.

---

## 5. Still open / not started (from the six-role review)

Go re-read the review artifact for full detail
(https://claude.ai/code/artifact/4c6fe425-41d2-4a52-932b-1fc474ec20f0),
but the short version of what's untouched:

- **Zero automated tests exist** — no jest/vitest/playwright installed
  at all (`package.json` devDependencies confirmed clean of any test
  runner as of this writing). This was flagged as the QA role's biggest
  complaint (4/10, the lowest of all six scores).
- **Production build still unverified** — see §0.
- **No mobile-viewport testing** has happened at all this session;
  every visual check was done at desktop widths (1280px).
- **No Lighthouse/axe accessibility audit** has been run. Manual code
  inspection found decent signals (alt text on all images,
  `aria-hidden` on decoratives, `aria-expanded`/`aria-label` on
  interactive controls, Escape-to-close on menus, `focus-visible`
  states in CSS) but nothing has been run through an actual tool or a
  real screen reader.
- **No rate limiting** visible on public-facing API routes
  (`/api/submit`, `/api/avatar`, etc.) — flagged as a Backend Developer
  finding, not yet addressed.
- **Team, About, Projects, Leaderboard, and contributor-profile pages**
  never got the same hands-on visual design pass the homepage did this
  session (tied to the open shell/footer question in §4).
- **No conversion analytics** on the `/apply` funnel.

---

## 6. Working conventions established this session (follow these)

- The founder wants **brutal honesty over reassurance** — when
  something isn't done, say so plainly; don't round up. This whole
  session has repeatedly caught and corrected optimistic self-reporting
  ("everything done?" was asked multiple times specifically because
  the user suspects inflated status reports).
- **Casing/typography rule (D-007 in `docs/decisions.md`)**: lowercase
  serif headlines + normal-case Inter body text is the *deliberate*
  house style almost everywhere. Don't "fix" lowercase headlines
  thinking they're a bug — they're not, except where the user has
  explicitly carved out an exception (the Spotlight/"Get your website"
  section, per §2).
- Always verify visually via the dev server + `read_console_messages`
  + DOM inspection (`javascript_tool` with `getComputedStyle` /
  `getBoundingClientRect`) rather than assuming code changes worked —
  this environment's screenshot tool has occasionally rendered stale
  or mis-scaled content after a `resize_window` call; if a screenshot
  looks wrong (content crammed in a corner, huge black area), check
  the actual viewport size via JS before assuming the page is broken —
  it's sometimes a tool rendering glitch, not a real bug. Opening a
  fresh tab (`tabs_create`) has reliably fixed this when it happens.
- Lenis (smooth-scroll) intercepts native scrolling; plain
  `window.scrollTo()` often doesn't trigger Framer Motion's
  `useScroll`/`whileInView` the way a real user's wheel scroll would.
  For DOM verification of scroll-linked animation, dispatch synthetic
  `WheelEvent`s instead of using `scrollTo` directly.
- Read `docs/decisions.md` before making any brand/design-direction
  call — it's the founder's authoritative decision log (D-001 through
  D-010+) and several generic "obvious improvements" (a decorative
  hero globe/Earth animation, for instance — D-008) have already been
  explicitly rejected once.
- The founder proposed a dark/space/galaxy visual theme at one point.
  Flagged (not refused) as being in real tension with D-006 (light
  theme, "Codyza Blue") and D-008 (rejects generic decorative SaaS
  hero elements) — no decision made either way yet. If revisited,
  push for a version tied to something real about Codyza (e.g. real
  contributor data), not generic stock space footage, and confirm
  genuinely copyright-free asset sourcing before committing.

---

## 7. Suggested immediate next step

Ask the user: (a) which of the two options in §4 they want, and
(b) whether they've run the SQL migrations in §3 yet. Both are cheap
yes/no answers that unblock real subsequent work (either a page-shell
migration, or live end-to-end testing of the bounty/clock-in
features). While waiting on those, safe unblocked work includes:
installing a minimal test runner and writing a few smoke tests (QA
finding, zero risk of breaking anything), or a mobile-viewport visual
pass of the homepage sections already fixed this session.
