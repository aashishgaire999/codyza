# Codyza 2.0 Decision Log

Every major decision gets an entry: context, decision, rejected alternatives, owner.
Maintained by all roles; the Product Manager keeps it consistent.

---

## D-001 — Public-site visual direction (DECIDED)

- **Date raised:** 2026-07-12
- **Status:** DECIDED 2026-07-12 by founder
- **Context:** Two user-provided directions conflict.
  - `REDESIGN.md` (user-locked 2026-07-11): light **"Field Journal"** public site —
    warm paper `#F7F6F2`, black ink, sage `#5E7359` / terracotta `#B8734A` accents,
    lowercase serif headlines, dark terminal object in hero; dark "Arcade" member area.
  - `docs/blueprint.md` (Blueprint v1.0, provided 2026-07-12): light **editorial**
    public experience with **Codyza Blue** accent, large typography, real screenshots,
    **subtle Earth animation in hero**, Apple-inspired motion.
- **Common ground (already decided):** light public site, dark member area, generous
  whitespace, large typography, storytelling structure, no generic SaaS aesthetic,
  kill rainbow gradients and the old nebula-purple system.
- **Divergence to resolve:** accent color (sage/terracotta vs Codyza Blue), headline
  voice (lowercase serif journal vs editorial), hero object (dark terminal window vs
  subtle Earth animation).
- **Options:**
  1. Field Journal as-is (REDESIGN.md wins; blueprint's visual section superseded).
  2. Blueprint editorial + Codyza Blue (REDESIGN.md public palette superseded; Arcade
     member area kept).
  3. Merge: editorial layout + Codyza Blue as the protected brand accent, keep the
     journal's mono specimen labels and terminal-in-hero as the Quest glimpse.
- **Decision:** Option 3 — **Merge.** Editorial layout with **Codyza Blue** as the
  protected brand accent, keeping the Field Journal's mono specimen labels and the
  dark terminal-in-hero as the glimpse into Quest. Dark "Arcade" member area unchanged.
- **Rejected alternatives:** (1) Field Journal as-is — loses the protected Codyza Blue
  brand accent the blueprint mandates; (2) Blueprint editorial as-is — loses the
  distinctive journal personality and risks generic-editorial sameness.
- **Consequences:** Brand & Creative Director defines the merged identity
  (`docs/brand-direction.md`); Design-System Architect retokenizes `globals.css`
  (`--cz-accent` family moves from sage/terracotta to Codyza Blue) in Phase 2;
  `REDESIGN.md`'s public palette section is superseded where it conflicts.

---

## D-002 — Codyza 2.0 MVP scope cut (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Product Manager (PRD v1.0 §1.4/§9); founder may amend
- **Context:** Blueprint v1.0 lists a broad IA plus a long-term ecosystem. Without a
  scope gate, 2.0 risks bloating into a CMS + Quest rebuild + social platform.
- **Decision:** MVP = evolve all existing routes (home, projects, leaderboard,
  contributor profiles, apply→join, auth, member portal, admin portal) onto the D-001
  design system, plus new: `/community`, `/about`, `/quest` explainer, `/news`
  (MDX-lite), `/certificates/verify` (lite), `/contact`, `/legal/*`. Future phase:
  case studies, automated Quest sync, achievements v2, admin audit log, contact form.
  Cut entirely (non-goals): CMS, replatform, Quest rebuild, new gamification
  mechanics, public API, native app, i18n, payments, forum/comments, public dark-mode
  toggle, AI features beyond existing `ai_score`.
- **Rejected alternatives:** (1) Full blueprint incl. case studies and Quest sync in
  one launch — content and Quest-API dependencies would stall the whole release;
  (2) minimal reskin only (no new pages) — fails the blueprint IA (Community, News,
  About, Quest in top nav) and the certificate-verification preserve mandate.
- **Owner:** Product Manager; scope-gate arbiter: Product Director.

---

## D-003 — Information-architecture route mapping (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Product Manager (PRD v1.0 §4/§5); Information Architect to
  encode in `docs/sitemap.md`
- **Context:** Blueprint top nav (Home/Projects/Community/News/About/Join/Quest) must
  map onto existing routes without breaking URLs in the wild ("evolve, don't replace").
- **Decision:**
  - **Community** = new `/community` hub (contributors directory + leaderboard
    surfacing + stats); `/leaderboard` URL is preserved as its own page.
  - **Join** = `/join`, evolved from `/apply`; `/apply` permanently redirects.
  - **About** = new `/about` absorbing `/#about` content and leadership (`/#team`);
    `/team` redirect retargets to `/about#leadership`. Leadership is a section, not a
    standalone route.
  - **Quest** = new public `/quest` explainer page (workflow, scrubbed screenshots,
    session-aware CTA), not a bare link to `/login`.
  - All existing redirect stubs (`/submit`, `/member/submit`, `/member/standup`) kept.
- **Rejected alternatives:** (1) Rename `/leaderboard` to `/community` — breaks a
  shared public URL for zero gain; (2) top-nav "Quest" linking straight to `/login` —
  wastes the blueprint's "Inside Codyza Quest" storytelling and confuses visitors;
  (3) standalone `/leadership` route — thin page, weakens the About narrative.
- **Owner:** Product Manager + Information Architect.

---

## D-004 — News content source: MDX in repo, no CMS (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Product Manager (PRD v1.0 §6.9)
- **Context:** Blueprint requires Codyza News / launch updates. Team must choose an
  authoring backend.
- **Decision:** News entries are MDX files with typed frontmatter committed to the
  repo, statically generated (`/news`, `/news/[slug]`), also feeding the homepage
  Launch Timeline. No CMS, no news table, no admin authoring UI in 2.0.
- **Rejected alternatives:** (1) Supabase `news` table + admin editor — builds a mini
  CMS the team must maintain, for a low-frequency feed; (2) external headless CMS —
  new vendor, new auth surface, violates the no-CMS non-goal; (3) hardcoded constants
  (status quo for timeline content) — not scalable past a handful of entries and no
  per-entry URLs/SEO.
- **Consequences:** publishing requires a git commit + deploy; if that friction proves
  too high for non-technical admins post-launch, revisit with a new decision entry.
- **Owner:** Product Manager; implementation: Frontend Architect.

---

## D-005 — Certificate verification via synced Supabase table (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Product Manager (PRD v1.0 §6.10); schema/RLS by Supabase
  Engineer; abuse controls by AppSec
- **Context:** Public certificate verification is a mandated preserve item, but Quest
  (the source of truth for certificates) has no confirmed API today (open question Q1
  to founder). No certificate feature exists in this repo's code or schema.
- **Decision:** MVP ships `/certificates/verify` backed by a new Supabase
  `certificates` table (non-sequential code, holder codyza_id, program, issued_at,
  status) that admins sync manually from Quest. Exact-match lookup only, rate-limited,
  no listing/enumeration endpoint; revoked and unknown codes return the same
  "not valid" shape. Quest remains the source of truth; the table is a public
  projection. Automated Quest→Codyza sync is future phase.
- **Rejected alternatives:** (1) Wait for a Quest API — blocks a launch-mandated
  preserve item on an external unknown; (2) defer verification to a future phase —
  violates the preserve mandate; (3) verify by calling Quest live at request time —
  couples public uptime to an internal platform with no contract.
- **Owner:** Product Manager; blocked on founder answers Q1/Q2 (certificate ID format
  and backfill list) before build.

---

## D-006 — Canonical Codyza Blue hex (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Brand & Creative Director (Phase 1)
- **Context:** D-001 mandates "Codyza Blue" as the protected accent, but four blues
  exist in the repo: `#3B82F6` (`--color-codyza-blue` in `globals.css` +
  `BRAND_COLORS.blue` in `src/constants/site.ts`), `#2563EB` (`--galaxy-blue`,
  `sofi-landing.css`), `#3B6B8C` (`--cz-ink-blue`, `globals.css`), and the color the
  logo artwork actually is: `public/logo/codyza-mark.png` is a gradient from `#1B14BA`
  to `#302BFB`, with `#302BFB` the dominant pixel color.
- **Decision:** Canonical Codyza Blue = **`#302BFB`**; deep variant **`#1B14BA`** (the
  logo gradient's dark end). Structural accent (`--cz-accent`) = `#302BFB`; action/CTA
  fill (`--cz-accent-2`) = `#1B14BA`. On-dark tint `#8B87FF` for the terminal object
  and Arcade chrome (raw `#302BFB` fails contrast on dark).
- **Rejected alternatives:** (1) `#3B82F6` — stock Tailwind blue-500, doesn't match the
  logo, fails AA text contrast on paper (3.40:1 on `#F7F6F2`); (2) `#2563EB` — stock
  Tailwind blue-600, ambient-only origin; (3) `#3B6B8C` — decorative denim, not the
  brand; (4) inverse role mapping (vivid blue as CTA fill, deep blue structural) — the
  site would read navy instead of Codyza Blue, and a full-saturation button mass
  vibrates against warm paper.
- **Consequences:** Phase 2 updates `--color-codyza-blue` and `BRAND_COLORS.blue` to
  `#302BFB` and retires `--cz-ink-blue`. Contrast verified: `#302BFB` 6.78:1 on
  `#F7F6F2`, 7.33:1 on white; white on `#1B14BA` 11.32:1; `#8B87FF` 6.50:1 on `#0C0C13`.

---

## D-007 — Public display typography: lowercase serif retained (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Brand & Creative Director (Phase 1)
- **Context:** D-001 merged the blueprint's "editorial" voice with the Field Journal;
  the headline treatment (lowercase Instrument Serif per `REDESIGN.md` §3 vs a neutral
  editorial sans) was left open.
- **Decision:** Keep the journal type system exactly: Instrument Serif 400 lowercase
  display (`-0.03em`, line-height 0.95), Inter body/UI, JetBrains Mono labels; trim
  Syne, Space Mono, Fraunces from `src/lib/fonts.ts`. Editorial quality comes from
  scale, whitespace, and restraint — not from the typeface's case. Discipline:
  lowercase serif is display-only; all UI/body text is Inter with normal casing.
- **Rejected alternative:** tight-tracked neutral sans (sentence case) for display —
  collapses into the generic-editorial sameness D-001 already rejected in option 2 and
  discards a shipped, ownable signature.
- **Consequences:** No font changes beyond the REDESIGN.md §3 trim; `docs/brand-direction.md`
  §3 records the casing rules.

---

## D-008 — Blueprint "subtle Earth animation": rejected (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by Brand & Creative Director (Phase 1)
- **Context:** `docs/blueprint.md` visual section proposed a subtle Earth animation in
  the hero; D-001 kept the terminal-in-hero, leaving the Earth idea unplaced.
- **Decision:** Rejected everywhere on the public site. The hero's one object is the
  terminal (narratively load-bearing — the glimpse of Quest); a globe is a current SaaS
  hero cliché and threatens the 60fps / Lighthouse ≥90 budget. The blueprint's intent
  ("builders around the world") is served by the momentum band's "building from"
  locations as mono-label coordinates/city names with count-up stats.
- **Rejected alternative:** globe as a secondary section element — still reads as
  template decoration; a future map moment, if ever, must be a static editorial map
  graphic, not an animated sphere.
- **Consequences:** Blueprint visual-design section's "subtle Earth animation in hero"
  is superseded; recorded in `docs/brand-direction.md` §4.

---

## D-009 — Founder answers to PRD open questions Q1/Q3/Q4/Q5 (DECIDED)

- **Date:** 2026-07-12
- **Status:** DECIDED by founder (Q2 still open)
- **Decisions:**
  - **Q1 — Quest API:** No API; manual sync confirmed. D-005's manually-synced
    `certificates` table stands; automated Quest→Codyza sync stays future phase.
  - **Q3 — Achievements:** Ranks + streaks only; no separate badge list exists.
    P7 is satisfied by ranks/streaks in MVP; no achievements data model needed.
  - **Q4 — Contributor consent:** Onboarding implies consent, **plus** a public-profile
    opt-out toggle in member settings (one visibility flag + RLS check; hidden members
    disappear from profile, leaderboard, and community directory). MVP scope.
  - **Q5 — Analytics:** Vercel Analytics + lightweight custom event layer. Cookieless,
    no consent banner; privacy policy written accordingly.
- **Still open:** **Q2** — certificate ID format + backfill list. Blocks only the
  `/certificates/verify` build (§6.10), not schema design.
- **Owner:** Product Manager to reflect in PRD; Supabase Engineer adds the Q4
  visibility flag to the schema plan.

---

## D-010 — Member work-tracking: clock-in/out activity log (DECIDED)

- **Date:** 2026-08-01
- **Status:** DECIDED by founder
- **Context:** Founder wants visibility into which members are actively contributing
  ("Clock In → Do the Work → Add a Summary → Clock Out"), motivated in part by the
  discovery that the bounty system's completion loop was broken (see the standalone
  fix shipped ahead of this: `submissions.bounty_id` links a submission back to the
  bounty it fulfills, and admin-approval now marks that bounty `completed`). PRD §1.4
  lists "no new gamification mechanics" as a non-goal for 2.0 — this decision exists
  to record why the feature below doesn't violate that.
- **Decision:** Ship a `work_sessions` table and clock-in/out UI as a **pure
  accountability/activity log** — no XP is awarded for time logged. XP continues to
  flow only from approved submissions, keeping one single XP-awarding code path
  (`admin/page.tsx`'s `updateSubStatus`). A session may optionally attach to a claimed
  bounty or a group, or be free-form text — attachment is not required, since bounty
  supply is too thin today to force it. Visibility into active sessions and logged
  hours is **admins only** for this version.
- **Superseded**: `docs/PRD.md` §5's disposition of `/member/standup` ("kept, redirects
  to `/member`") is superseded — that route is repurposed as the member-facing
  clock-in/out page instead of remaining a dead redirect.
- **Rejected alternatives:** (1) Award XP per hour logged — trivially gameable (clock
  in, walk away, clock out later) with no approval gate, unlike submissions; would
  also add a second XP-awarding code path. (2) Require a claimed bounty to clock in —
  would make the feature unusable for most members given today's thin bounty supply.
  (3) Member-to-member visibility (e.g. groupmates see each other's sessions) — more
  build surface and peer-exposure for a v1 that's meant to answer a founder-level
  question first.
- **Consequences:** `work_sessions` is provisioned by hand in the Supabase dashboard,
  consistent with every other table in this app (no migration tooling exists in this
  repo). If usage data later suggests time-based incentives are worth it, that would
  be a new, separate decision — not a reversal of this one.
- **Owner:** Founder; implementation tracked outside the decision log.

---

## D-011 — Homepage hero is frozen (DECIDED)

- **Date:** 2026-08-06
- **Status:** DECIDED by founder
- **Context:** The homepage hero has been iterated into its approved state: the
  full-bleed supplied video, the “building alone gets lonely.” headline, supporting
  copy, “join the crew” primary action, “see what we build” secondary action, current
  typography, positioning, sizing, animation, responsive behavior, and navigation
  relationship. The founder explicitly requested that this hero never be redesigned
  or altered during future UI/UX work.
- **Decision:** Freeze the homepage hero exactly as implemented in
  `src/components/landing/codyza-hero-section.tsx` and its associated `.cz-hero*`
  rules in `src/app/globals.css`. Future design work may change every section below
  the hero, but must not modify the hero’s content, video source or playback behavior,
  layout, colors, type treatment, CTAs, motion, spacing, layering, or responsive
  presentation.
- **Supersedes:** D-001/PRD §6.1 only where they require a terminal object in the
  homepage hero. The approved video hero is now the binding implementation.
- **Change control:** Any hero change, including a seemingly small polish or technical
  adjustment, requires a new explicit founder instruction that clearly reverses or
  amends this decision. Do not infer permission from a broader homepage redesign.
- **Owner:** Founder.

---

## D-013 — Codyza becomes an admin-managed publishing platform (DECIDED)

- **Date:** 2026-08-08
- **Status:** DECIDED by founder
- **Context:** Repository-authored news and fixed public copy make regular publishing dependent on code changes. The founder wants the website to operate as a tool: admins manage site content, images, news, and member announcements; authenticated members can comment on news; chat and board-meeting workflows will follow.
- **Decision:** Add a Supabase-backed content layer for editable site blocks, media assets, news posts, member comments, and announcements. Admin writes remain server-only and require the admin access credential; public reads expose only published content; comment writes require an authenticated contributor. Keep repository news as a fallback during migration.
- **Supersedes:** D-002 and D-004 where they prohibit a CMS and comments. Their remaining scope and information-architecture decisions still apply.
- **Clock-in/out:** D-010 remains binding. Work sessions are accountability records, not an XP source, and must enforce one active session per member.
- **Galaxy direction:** Cosmic visuals belong to the persistent site background and member/admin atmosphere, not a boxed decorative section or a standalone image.
- **Owner:** Founder.

---

## D-012 — Public site uses a page-by-page design synthesis (DECIDED)

- **Date:** 2026-08-07
- **Status:** DECIDED by founder
- **Context:** Three exploratory directions were reviewed: an editorial journal,
  a proof-first project ledger, and a people-first crew studio, followed by a
  cinematic application-page study. The founder chose to take the strongest idea
  from each direction rather than force one layout pattern across every page.
- **Decision:** Codyza's public experience is one shared visual system with
  purpose-specific page expressions: the homepage uses the editorial story; Projects
  uses the public proof ledger; Community/About use the crew studio and named-person
  storytelling; Join uses the cinematic dark video treatment; Quest visualizes the
  dark Arcade operating system. Navigation, footer, Codyza Blue, warm paper,
  typography, spacing, interaction feedback, and motion rules remain consistent so
  the result reads as one brand rather than a collage.
- **Constraint:** D-011 remains fully binding. The approved homepage hero is not part
  of this synthesis and stays frozen exactly as implemented.
- **Rejected alternatives:** (1) apply one mockup wholesale to every route — weakens
  each page's purpose; (2) combine every decorative idea on every page — produces a
  template-like, incoherent result; (3) replace the approved homepage hero with the
  cinematic experiment — contradicts D-011.
- **Owner:** Founder.
