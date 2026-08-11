# Codyza 2.0 — UX Research: Personas & Trust Analysis

**Author:** UX Researcher (codyza-ux-researcher) · **Phase:** 1 — Brand & Product Strategy
**Date:** 2026-07-12 · **Status:** v1.0 — feeds `docs/PRD.md` and the homepage story
**Inputs:** `docs/blueprint.md` (Blueprint v1.0), `docs/decisions.md` (D-001 decided: merged
editorial + Codyza Blue direction), `REDESIGN.md`, and the current implementation in
`src/app/`, `src/components/`, `src/constants/`.

---

## 1. Method

Heuristic audit of the live codebase (no source modified):

- Homepage: `src/app/page.tsx` + copy in `src/constants/landing.ts`, `src/constants/site.ts`
- Apply flow: `src/app/apply/page.tsx` + `src/components/landing/apply-section.tsx`
- Contributor profile: `src/app/contributor/[id]/page.tsx`
- Leaderboard: `src/app/leaderboard/page.tsx`
- Projects: `src/app/projects/page.tsx` + `src/components/shared/specimen-card.tsx`
- Team: `src/app/team/page.tsx` (redirects to `/#team`) + `src/constants/team.ts`

Each finding below cites the file where the evidence lives. "Blueprint" = `docs/blueprint.md`.
The core test applied throughout is the blueprint's own bar: **"real products, real people,
real launches"** — does the current site *prove* those three claims to each persona?

---

## 2. Personas

### P1 — Sunita, Student Builder (17–22, CS student, Kathmandu)

- **Goals:** Ship her first real project with teammates; something to show besides
  tutorial clones; find mentors; a line on her resume that isn't a certificate mill.
- **Fears:** Being too junior to be accepted; hidden fees appearing later; joining a dead
  community; her application vanishing into a void; being embarrassed in public code review.
- **Needs to trust Codyza:** Proof beginners are welcome and succeed (a visible beginner
  → shipped story); proof the community is alive *this week* (recent activity, dated
  launches); explicit "$0 forever" (present today — `StatsBand` in `src/app/page.tsx`);
  a low-stakes application with a clear "what happens next" (present — `APPLY_ROADMAP`
  in `src/constants/landing.ts`).
- **Journey today:** Home → hero ("building alone gets lonely.") resonates emotionally →
  scroll-scrub chapters (ship/learn/grow) → About stats → `/apply` 5-step form →
  submitted screen → waits for email. **Break point:** between hero and About she never
  sees another student like her; team cards show initials, projects show no faces or dates.

### P2 — Marcus, Early-Career Developer (22–28, bootcamp grad / junior dev, US)

- **Goals:** Real production experience (PRs, reviews, deploys) to escape the "junior with
  no experience" trap; references; a public portfolio URL a hiring manager will believe.
- **Fears:** Wasting months in a ghost-town Discord clone; contributing to projects that
  never launch; "XP" being a meaningless gamification gimmick; the org disappearing and
  taking his track record with it.
- **Needs to trust Codyza:** Live URLs that actually resolve; GitHub repos with real commit
  history he can inspect before applying; a named human reviewing applications; evidence
  contributors turned participation into jobs or launches.
- **Journey today:** Home → `/projects` (SpecimenCards link to code + live —
  `src/components/shared/specimen-card.tsx`, this is the strongest trust surface today) →
  clicks a contributor profile → `/leaderboard` → `/apply`. **Break point:** project cards
  are text-only (no screenshots, no dates, no "what shipped when"), and if the Supabase
  `submissions` table is sparse, he lands on "Nothing live yet — you could fix that"
  (`src/app/projects/page.tsx`) — fatal for someone auditing whether this is real.

### P3 — Priya, Designer (20–30, UI/UX, wants shipped product work)

- **Goals:** Design work in production, not Dribbble shots; collaborate with devs who
  implement her designs; case studies with real users.
- **Fears:** Being the only designer among engineers; "design" being an afterthought;
  no visible design output anywhere on the site.
- **Needs to trust Codyza:** Visible design craft on the site itself (present — the
  Field-Journal system is distinctive); a designer role in the apply flow (present —
  `ROLES` includes "Design" in `src/components/landing/apply-section.tsx`); at least one
  designer on the team or leaderboard; project pages that show *interfaces*, not just
  tech-stack chips.
- **Journey today:** Home → hero copy says "devs, designers, and dreamers" → `/projects` →
  **Break point:** every project card is code-framed (GitHub link, tech stack, AI score);
  zero screenshots or design artifacts anywhere. The apply flow's GitHub-username step
  (`apply-section.tsx` step 1) hard-assumes she has a GitHub presence; there is no
  portfolio/Behance/Figma alternative. The form silently tells designers "this is for devs."

### P4 — Dipesh, Active Contributor / Volunteer (existing member)

- **Goals:** Grow XP and rank; get his shipped work showcased publicly; earn a certificate
  he can put on LinkedIn; not lose progress if the platform changes (Quest migration).
- **Fears:** XP/rank resets during the 2.0 redesign; his public profile URL breaking;
  approved projects disappearing; certificates promised but never verifiable.
- **Needs to trust Codyza:** Continuity guarantees (blueprint's "evolve, don't replace");
  his profile at `/contributor/czx-XXXX` staying live and shareable (present —
  `src/app/contributor/[id]/page.tsx` even prints the public link); a certificate that a
  third party can verify; visible rank ladder (present — `RANK_XP` in the profile page).
- **Journey today:** Login → member portal (`src/app/member/`) → submit work
  (`src/app/member/submit/`) → approval → appears on public profile and homepage Projects.
  This loop exists and is the healthiest journey on the site. **Break point:** the public
  payoff is thin — his profile has no bio, no links besides GitHub, no certificate section,
  and the "ai_score X/10" badge on his work is unexplained and can read as demeaning.

### P5 — Rachel, Recruiter / Hiring Manager (arrives via a candidate's resume or profile link)

- **Goals:** Verify in under 2 minutes that a candidate's Codyza claim is real: did they
  actually ship, when, and at what level? Is "Senior Engineer @ Codyza rank" a credential
  or a game badge?
- **Fears:** Certificate-mill inflation; unverifiable claims; mistaking a gamified rank
  ("Software Engineer", "Distinguished Engineer" — `RANK_XP` in
  `src/app/contributor/[id]/page.tsx`) for a job title on a background check.
- **Needs to trust Codyza:** A certificate verification page (URL + ID → valid/invalid,
  issue date, scope); clear labeling that ranks are community XP tiers, not employment
  titles; an About/organization page (who runs this, since when, legal entity); dated
  project evidence; a hiring contact (exists as `hrEmail: "hiring@codyza.com"` in
  `src/constants/site.ts` but is rendered nowhere).
- **Journey today:** Candidate's profile link → `/contributor/czx-XXXX` → maybe
  `/leaderboard` → looks for "About us" → **Break point:** there is no About page
  (`/#about` anchor only), no certificate verification route anywhere in `src/app/`,
  no news/launch log, no way to contact for hiring, and rank names collide with real
  job titles with zero explanation.

### P6 — Tom, Business / Partner (small-business owner or community partner, e.g. Marshall MN)

- **Goals:** Get an affordable website built (the `Spotlight` offer in `src/app/page.tsx`:
  "need a website? Skilled volunteers design and build your site at a low cost"); or
  sponsor/partner with a legitimate youth-builder organization.
- **Fears:** Handing money to an anonymous internet collective; no portfolio of client
  work; no process, timeline, or accountability; the only contact being a mailto link.
- **Needs to trust Codyza:** Named leadership with photos and LinkedIn (data exists in
  `src/constants/team.ts` but photos/links are not rendered on the homepage Team section);
  local press proof (present — Marshall Independent / Chamber logos in `FEATURED_IN`,
  `src/constants/landing.ts` — the single best trust asset for this persona); examples of
  delivered client sites; a real inquiry flow instead of a bare `mailto:`.
- **Journey today:** Local press or word of mouth → homepage → sees the Spotlight banner in
  the hero → clicks → his email client opens. **Break point:** the entire "web builds"
  service is one mailto link with no portfolio, pricing frame, process, or named contact.

### P7 — Ayush/Admin, Codyza Administrator (founder / leadership operating the org)

- **Goals:** Review applications fast (48h promise in `SITE_CONFIG.reviewCycle`); approve
  submissions; keep public data accurate; grow membership without the site over-promising;
  keep public/private boundaries safe.
- **Fears:** The site promising things ops can't deliver (48h reviews, certificates);
  stale public numbers making Codyza look dead; PII leaking through public profiles;
  applications lost silently.
- **Needs to trust the system:** Admin portal reliability (`src/app/admin/`); an audit
  trail from application → acceptance → CZX ID; control over what's public (avatar, role,
  streak are exposed on `/contributor/[id]` and `/leaderboard` today); confidence that
  the apply POST actually persists.
- **Journey today:** `/login` → `/admin` → analytics, application review, verify route
  (`src/app/api/admin/verify/route.ts`). **Break point:** the public apply form
  fire-and-forgets its POST (`fetch("/api/apply", …).catch(console.error)` in
  `apply-section.tsx` `onSubmit`) and shows success regardless — an applicant can see
  "got it — we'll read this" while the application was never received. That failure lands
  on the admin as "Codyza ghosted me" reputation damage.

---

## 3. Trust-Problem Analysis

Test: does the current site *prove* "real products, real people, real launches"?
Findings ordered by severity. (T# ids are referenced by §5 recommendations.)

### T1 — Certificates are promised but cannot be verified (CRITICAL)

- Marketing copy promises "Developer Certificates … tied to actual work, deployments,
  and public GitHub activity" (`src/components/landing/features-section.tsx`, lines 88–92).
- There is **no certificate page, no `/verify` or `/certificates` route, no certificate
  data on contributor profiles** — nothing under `src/app/` renders or validates a
  certificate. A recruiter given a Codyza certificate today has literally no way to check
  it, which is worse than not offering certificates: an unverifiable credential pattern-
  matches to a certificate mill. Blueprint explicitly requires "public certificate
  verification" as a feature to preserve/build.

### T2 — "Real people" are initials, not people (CRITICAL)

- The homepage Team section (`Team()` in `src/app/page.tsx`) renders colored initial
  blocks — no photographs, and the GitHub/Twitter/LinkedIn links that exist in
  `src/constants/team.ts` are never rendered. Two of the five links that do exist are
  placeholders (`https://twitter.com`, `https://linkedin.com`) and both founders share
  the org GitHub URL.
- `/team` is just a redirect to the anchor (`src/app/team/page.tsx`); there is no
  leadership page. The blueprint mandates preserving "leadership profiles with photos and
  links." For P5 (recruiter) and P6 (partner), anonymous initials + dead links read as
  "this might be one person with alt accounts."

### T3 — "Real launches" have no dates, faces, or evidence beyond a link (HIGH)

- Project cards (`src/components/shared/specimen-card.tsx`, `ProjectCard` in
  `src/app/page.tsx`) show name, description, tech chips, and code/live links — but **no
  screenshot, no ship date, no builder name (only a CZX id), no case study**. `created_at`
  is fetched (`src/app/projects/page.tsx`) but never displayed.
- The unexplained `ai_score X/10` badge invites the wrong question ("an AI graded this?")
  and undermines the human-review story told in the apply flow.
- Empty states actively damage the core claim: "Nothing live yet — you could fix that"
  (`src/app/projects/page.tsx`, and homepage `Projects()`) tells a first visitor that
  "real products, real launches" is currently zero. Same for the leaderboard empty state
  ("Empty so far…", `src/app/leaderboard/page.tsx`). Honest, but placed as the *proof
  section* of the homepage it falsifies the pitch.

### T4 — No About, no News, no organizational identity (HIGH)

- The blueprint IA calls for Home • Projects • Community • News • About • Join • Quest.
  Current nav (`NAV_LINKS` in `src/constants/site.ts`) is About(anchor) / Projects /
  Leaderboard / Team(anchor). There is **no About page, no News/launch log, no Community
  page, no Contact page, no Legal pages** in `src/app/`.
- Nothing states who operates Codyza, since when, or from where (beyond the
  "building from 🇺🇸 Minnesota / 🇳🇵 Kathmandu" line in `StatsBand`). "Why Codyza Exists"
  — the second beat of the blueprint's homepage story — has no home; the closest is the
  `MANIFESTO_COPY` paragraph buried mid-page in `About()`.
- `hiring@codyza.com` exists in config but appears on no page; a recruiter has no
  designated door.

### T5 — The application success screen can lie (HIGH)

- `onSubmit` in `src/components/landing/apply-section.tsx` fires the POST in the
  background and immediately renders success ("got it — we'll read this… Expect a reply
  by {day}"). A network failure, API error, or spam rejection is swallowed
  (`.catch(console.error)`). The applicant gets no application ID, no confirmation email
  promise, and no way to check status. For P1's biggest fear — "my application vanished" —
  the current design makes it possible and undetectable. It also sets a 48-hour clock
  ("a founder reads every one within 48 hours", `APPLY_ROADMAP`) that ops must hit
  forever; every miss converts a hopeful applicant into an anti-referral.

### T6 — Ranks collide with real job titles, XP is unexplained (MEDIUM)

- `RANK_XP` (`src/app/contributor/[id]/page.tsx`) names tiers "Software Engineer,"
  "Senior Engineer," "Staff Engineer," "Distinguished Engineer." A profile's metadata
  even renders "`{name} — {role} at Codyza. Rank: {rank}`" (generateMetadata, same file) —
  in a Google result this is indistinguishable from an employment claim. No page explains
  how XP is earned, what a rank means, or that Codyza is a volunteer community, exposing
  both the contributor and Codyza to credibility backfire when a recruiter probes.

### T7 — Numbers that read as small or fake (MEDIUM)

- `About()` and `StatsBand` (`src/app/page.tsx`) print live Supabase counts with no
  floor: "0 live projects / 0 members" is a possible render (counts initialize at 0 and
  stay there on fetch failure). "day N since launch" counts from a hardcoded
  `LAUNCH_DATE = 2026-03-15` — trivia that proves nothing about activity.
- The hero's CZX ID card is explicitly fake: `name="sample member"`, `id="0042"`
  (`About()` in `src/app/page.tsx`) — adjacent to real-people claims, a sample artifact
  weakens rather than strengthens (a real founder's card would prove the system exists).
- The chapter visual hardcodes "1,150 xp · czx-0042" and "live at codyza.app"
  (`ChapterVisual` in `src/app/page.tsx`) — decorative fake data on a site whose whole
  pitch is "real."

### T8 — "Featured in" over-claims (MEDIUM)

- `FEATURED_IN` (`src/constants/landing.ts`) links to LinkedIn (Codyza's own company
  page — self-reference, not press) and to the *homepages* of the Marshall Chamber and
  Marshall Independent, not to the actual articles/mentions. A skeptic who clicks gets no
  corroboration, converting the site's best third-party proof into a suspected fabrication.
  Link the coverage itself.

### T9 — The designer path is silently dev-only (MEDIUM)

- Apply step 2 demands a GitHub username with live validation and no alternative
  (`apply-section.tsx`); homepage proof surfaces (repos, tech chips, terminal, XP) are all
  code-framed. P3 concludes "designers welcome" is copy, not reality. Also the apply
  placeholder is a real personal username (`placeholder="aashishgaire999"`) — leaks a
  founder's handle into every applicant's form.

### T10 — Web-builds service has zero substantiation (LOW for core mission, HIGH for P6)

- The hero `Spotlight` (`src/app/page.tsx`) sells a paid-ish service ("low cost") with
  no portfolio, process, or named owner — one `mailto:`. Either substantiate it with a
  small page (past builds, process, who answers) or remove it from the hero; as-is it
  reads like a classified ad taped onto the manifesto and dilutes the nonprofit-crew story
  ("$0 forever" and "need a website? low cost" sit in the same viewport).

### What already works (preserve in 2.0)

- **Contributor profiles** with public URL, rank, XP progression, streaks, approved
  project list (`src/app/contributor/[id]/page.tsx`) — the skeleton of verifiable identity.
- **Projects with code + live links** (`specimen-card.tsx`) — inspectable evidence.
- **Local press logos** (Marshall) — rare, real third-party proof; deepen, don't drop.
- **Honest, human apply flow** — 5 questions, named expectations, GitHub live-preview
  delight (`apply-section.tsx`), "a founder reads every one."
- **$0 forever / no gatekeeping** stats and the Slack members-only gate
  (`SlackGate` in `src/app/page.tsx`) — scarcity done honestly.
- **Distinctive visual voice** — nothing about the site feels like a template, which
  itself is a trust signal (per blueprint's anti-generic principle).

---

## 4. Comprehension Test (first-time visitor, ~5-second heuristic)

Question: within seconds of landing on `/`, can a visitor answer **what Codyza is, who
it's for, and what to do next?**

**Above the fold today** (`Hero()` in `src/app/page.tsx`): headline "building alone gets
lonely." + a terminal animation + the web-builds Spotlight + nav with an "apply" pill.

| Question | Verdict | Evidence |
|---|---|---|
| What is Codyza? | **FAIL above fold.** | The hero headline names a *feeling*, not the thing. The defining sentence ("a community of devs, designers, and dreamers shipping real projects together") exists but sits at the *bottom* of a 100dvh hero (`Hero()`), below the Spotlight, typically requiring a scroll. The `<title>`/OG description carry it, but the viewport doesn't. |
| Who is it for? | **PARTIAL.** | "devs, designers, and dreamers" — only if you reach that sentence. Nothing above the fold signals experience level, age, or "students welcome." |
| What do I do next? | **PASS (weak context).** | The "apply" pill is persistently visible in the nav, but applying is a high-commitment first CTA when the visitor doesn't yet know what they're applying *to*. No low-commitment path (see projects / read the story) is offered above the fold. |
| Is it alive/real? | **FAIL above fold.** | "now onboarding founding contributors" + a live-dot is the only signal, and it's below the headline block. No recent-launch, member-count, or dated-activity signal in the first viewport. |
| Noise check | **FAIL.** | The Spotlight ("need a website?") is a *second audience's* CTA inserted between headline and manifesto — the single biggest comprehension tax in the hero. The scroll % counter and "©2026 / 001" specimen labels are charming but answer none of the three questions. |

**Additional comprehension failures deeper in:**

- The scroll-scrubbed Chapters section (`ChaptersScrub`) pins ~3 viewports of scroll
  before the visitor reaches "what is codyza" (`About()`, labeled "005"). Skimmers who
  scroll fast get fragments; the answer to "what is this?" arrives 4 sections deep.
- Nav labels "about" and "team" are anchors into the homepage — from `/projects` they
  navigate back and jump-scroll, a disorienting pattern for first-timers.
- Nothing anywhere says the word that categorizes Codyza (volunteer community?
  nonprofit? club? collective?) — every persona must infer the organizational species.

**Conclusion:** the current homepage optimizes for *mood* first, *meaning* fourth. The
blueprint's homepage story (Hero → Why → Products → Builders → Quest → Timeline → Join)
fixes the ordering; the hero itself must carry a one-line definition and a real-activity
signal without losing the emotional headline.

---

## 5. Prioritized Recommendations

For the PRD (P0 = launch-blocking for 2.0's trust goals). Mapped to the blueprint
homepage story: **Hero → Why Codyza Exists → Products We Build → Meet the Builders →
Inside Codyza Quest → Launch Timeline → Join.**

### P0 — Prove the claims

1. **Ship public certificate verification** (fixes T1). Route like
   `/certificates/[id]` + `/verify`: certificate holder, scope of work, issue date,
   linked contributor profile, validity check. Until it exists, soften the certificate
   promise in `features-section.tsx` to match reality. *Homepage slot: Inside Codyza Quest.*
2. **Make the team human** (fixes T2). Real photographs, real per-person GitHub/LinkedIn,
   short first-person bios; a proper `/about` (or leadership section) replacing the
   `/#team` anchor; remove placeholder social URLs from `src/constants/team.ts`.
   *Homepage slot: Meet the Builders.*
3. **Evidence-grade project cards → case studies** (fixes T3). Add screenshot, ship date
   (`created_at` is already fetched), builder name + avatar linked to profile; 1–3 flagship
   case studies (problem → build → launch → proof). Explain or remove `ai_score`.
   *Homepage slot: Products We Build.*
4. **Truthful application confirmation** (fixes T5). Await the POST, handle failure
   visibly, return an application reference, send a confirmation email. Keep the 48h
   promise only if the admin flow can honor it; otherwise state the real cycle.
   *Homepage slot: Join.*

### P1 — Answer the 5-second test

5. **Hero rewrite** (fixes comprehension FAILs). Keep the emotional headline; add a
   one-line definition subhead in the first viewport ("Codyza is a free volunteer crew of
   students, devs, and designers shipping real products together") + one live-proof line
   (latest launch, dated) + dual CTA ("see what we're building" as the low-commitment
   sibling of "apply"). Move the web-builds Spotlight out of the hero to its own small
   page or footer strip (fixes T10). *Homepage slot: Hero.*
6. **Create "Why Codyza Exists" as a named early section** — promote `MANIFESTO_COPY`
   from mid-page to beat #2, add founding story (when, where, by whom) to anchor
   organizational identity (partially fixes T4). *Homepage slot: Why Codyza Exists.*
7. **Build the missing IA**: `/about`, `/news` (launch log doubles as the "Launch
   Timeline" section and the site's freshness signal), `/community`, contact (including
   surfacing `hiring@codyza.com` for recruiters), legal pages (fixes T4). Align nav with
   blueprint IA: Home • Projects • Community • News • About • Join • Quest.

### P2 — De-risk the details

8. **Rename or contextualize ranks** (fixes T6): either non-title names or an
   always-adjacent explainer ("community XP tier, not a job title") + a public "how XP
   works" page; fix `generateMetadata` on `/contributor/[id]` so search snippets don't
   read as employment.
9. **Honest-but-strategic numbers and empty states** (fixes T7): floor/suppress stats
   when counts are low ("founding cohort forming" beats "0 members"); replace decorative
   fake data (sample CZX card, hardcoded xp figures) with a real founder's card and real
   figures; replace "day N since launch" with a dated recent-activity stat.
10. **Fix press links** (fixes T8): link the actual Marshall Independent article and
    Chamber listing, not homepages; label the LinkedIn item "follow us," not "featured in."
11. **Open the designer path** (fixes T9): apply step 2 accepts GitHub *or*
    portfolio/Figma/Behance; show at least one design artifact among project evidence;
    neutral placeholder text instead of a founder's real username.

### Cross-discipline flags (for the owning roles)

- **Content Strategist:** hero definition line, rank explainer, empty-state copy, press
  labeling (recs 5, 8, 9, 10).
- **Information Architect:** missing routes and nav realignment (rec 7); `/team` redirect.
- **Backend/Supabase + IAM:** certificate schema and verification route (rec 1); apply
  POST persistence + confirmation email (rec 4); audit which contributor fields
  (avatar, role, streak, join date) should be public-by-default on `/contributor/[id]`.
- **Product Manager:** the 48h review promise is an ops SLA embedded in copy
  (`SITE_CONFIG.reviewCycle`) — confirm it's sustainable before 2.0 restates it.
- **Brand & Creative Director:** Spotlight/web-builds placement conflicts with the
  "$0 forever" story in the same viewport (rec 5 / T10).

---

## 6. Open Questions for the PRD

1. Do certificates exist operationally today (issued PDFs? Quest records?), or is this a
   2.0 net-new build? Determines whether T1 is a truth-in-copy fix or a feature.
2. What real press coverage exists to deep-link for T8?
3. Is web-builds a real revenue/service line worth its own page, or hero noise to cut?
4. What is the actual current member/project count — do we need "founding cohort" framing
   (rec 9) or do the real numbers already carry the story?
5. Quest data flow: which Quest fields are approved for public display on Codyza.com
   (blueprint: "public-approved data flows back") — needed before enriching profiles.
