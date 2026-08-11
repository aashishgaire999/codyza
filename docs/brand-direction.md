# Codyza 2.0 — Brand Direction (merged identity, implements D-001)

Owner: Brand & Creative Director · Date: 2026-07-12 · Status: Phase 1 deliverable
Implements: `docs/decisions.md` D-001 (merge). Supersedes the public palette section of
`REDESIGN.md` where they conflict. Consumed by: Design-System Architect (Phase 2).

---

## 0. Canonical Codyza Blue (D-006)

**Codyza Blue is `#302BFB`.** Deep variant **`#1B14BA`**.

How this was established — four blues exist in the repo today:

| Candidate | Where | Verdict |
|---|---|---|
| **`#302BFB`** | Dominant pixel color of the actual logo (`public/logo/codyza-mark.png`, `codyza-logo.png`); the logo mark is a gradient from `#1B14BA` (deep end) to `#302BFB` (bright end) | **Canonical.** It is the color the logo literally is. |
| `#3B82F6` | `--color-codyza-blue` in `src/app/globals.css` and `BRAND_COLORS.blue` in `src/constants/site.ts` | Rejected. This is stock Tailwind `blue-500` — the definition of an AI-template color — and it does not match the logo. It also fails text contrast on paper (3.40:1 on `#F7F6F2`). Phase 2 must update both definitions to `#302BFB`. |
| `#2563EB` | `--galaxy-blue` base in `src/app/sofi-landing.css` | Rejected as brand color. Stock Tailwind `blue-600`, ambient-only. |
| `#3B6B8C` | `--cz-ink-blue` in `globals.css` (`.cz-landing`) | Rejected as brand color. A decorative denim from the journal exploration; retire it (see handoff) so the site has one blue family, not two. |

Why `#302BFB` also wins on merit, not just provenance: it is a vivid indigo-blue that no
Tailwind default produces, it is instantly distinguishable from the generic
SaaS blue (`#3B82F6`) and from Stripe's blurple, and it passes AA for normal text on both
site backgrounds — **6.78:1 on `#F7F6F2`**, **7.33:1 on `#FFFFFF`** — where `#3B82F6`
fails both.

Protection rules:

- The logo and Codyza Blue are never recolored, gradient-mapped, or transparency-washed.
- Codyza Blue is never used as a text color on dark surfaces (`#302BFB` on `#0C0C13` is
  2.58:1). On the dark terminal object and in the Arcade, use the bright tint
  `#8B87FF` (6.50:1 on `#0C0C13`) or white.
- No other saturated hue may appear on the public site except the semantic status colors
  (success/pending/error), which are never decorative.

---

## 1. Brand personality — why this is not a template

One story: *a lone builder finds a crew, ships something real, and levels up.* The public
site is the printed editorial prospectus; logging in is stepping inside the machine.

The ownable elements — the things that make this recognizably Codyza and that no
generic generator produces:

1. **Mono specimen labels.** JetBrains Mono 10–11px, letter-spaced, lowercase, in Codyza
   Blue: `005 / what is codyza`, CZX IDs, coordinates, timestamps. Every page carries the
   numbered-index labeling system, public and member alike. This is the layout signature.
2. **The terminal-in-hero.** A dark (`#0C0C13`) terminal window sitting on the light page
   like a photograph taped into a journal — the single glimpse of Quest, the world behind
   the login. It is the only dark object on the public site, which is exactly why it works.
3. **Editorial typography and layout.** Oversized lowercase serif display headlines,
   generous whitespace, asymmetric grids (`1.05fr/0.95fr`), hairline rules with index
   labels instead of card-grid section dividers.
4. **Real screenshots, real people, real launches.** Product sections show actual deploys
   and actual UI, contributor sections show real names, photos, GitHub/LinkedIn links,
   Codyza IDs and XP. No illustrations of abstract people high-fiving, no fabricated
   dashboards, no stock photos.
5. **Storytelling structure.** The homepage is a narrative arc (hook → proof → journey →
   manifesto → receipts → momentum → crew → ask), not a feature list. Inner pages inherit
   it in miniature: mono index label → serif headline → content → single CTA.
6. **The theme switch as narrative.** Light editorial outside, dark Arcade inside. The
   reward for joining is entering the dark UI you saw through the terminal.

The litmus test for every screen: *if you swap the logo, could this be any startup's
site?* If yes, it fails review.

---

## 2. The merged public-site palette

Scope: the light public token layer (REDESIGN.md §2 calls it `.codyza-public`; today the
values live in `.cz-landing` in `globals.css` and `.codyza-public` in
`hybrid-design.css` — Phase 2 consolidates them). **Only the accent family changes; the
paper/ink skeleton is untouched.**

| Token | Value | Replaces | Usage |
|---|---|---|---|
| `--cz-bg` | `#F7F6F2` | — (unchanged) | Warm paper page background |
| `--cz-surface` | `#FFFFFF` | — (unchanged) | Cards, specimen panels, forms |
| `--cz-ink` | `#111110` | — (unchanged) | Primary text |
| `--cz-muted` | `rgba(17,17,16,0.58)` | — (unchanged) | Secondary text |
| `--cz-faint` | `rgba(17,17,16,0.40)` | — (unchanged) | Micro-labels only (non-essential) |
| `--cz-border` | `rgba(17,17,16,0.12)` | — (unchanged) | Hairline rules |
| **`--cz-accent`** | **`#302BFB`** | sage `#5E7359` | **Codyza Blue.** Structural: mono specimen labels, links, live/active dots, specimen spines, focus rings, selection tint base |
| **`--cz-accent-2`** | **`#1B14BA`** | terracotta `#B8734A` | **Codyza Blue Deep** (the dark end of the logo gradient). Action: primary CTA fill with white text, pressed/hover state of accent elements. CTA-only, exactly as terracotta was |
| `--cz-accent-soft` | `rgba(48,43,251,0.08)` | new | Tint washes, hover backgrounds |
| `--cz-accent-badge` | `rgba(48,43,251,0.14)` | new | Badges, pills, selection `::selection` |
| `--cz-accent-bright` | `#8B87FF` | new | Codyza Blue **on dark surfaces only** — inside the terminal object and Arcade chrome |
| `--cz-terminal` | `#0C0C13` | — (unchanged) | The dark terminal/ID-card objects on paper |

Verified contrast (WCAG relative luminance):

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| `#302BFB` text on `#F7F6F2` | 6.78:1 | ≥4.5:1 | Pass |
| `#302BFB` text on `#FFFFFF` | 7.33:1 | ≥4.5:1 | Pass |
| `#FFFFFF` text on `#302BFB` | 7.33:1 | ≥4.5:1 | Pass |
| `#1B14BA` text on `#F7F6F2` | 10.46:1 | ≥4.5:1 | Pass |
| `#FFFFFF` text on `#1B14BA` (primary CTA) | 11.32:1 | ≥4.5:1 | Pass |
| `#8B87FF` text on `#0C0C13` (terminal) | 6.50:1 | ≥4.5:1 | Pass |
| `#302BFB` non-text (focus ring, spine) vs paper | 6.78:1 | ≥3:1 | Pass |

(For reference, the outgoing accents: sage `#5E7359` was 4.77:1 on paper — barely passing;
terracotta `#B8734A` was 3.47:1 — failing as text, which is why it was CTA-fill-only.)

Role logic, inherited from the journal's scarcity rule ("if everything is terracotta,
nothing is"): **the vivid blue is structural and small** — labels, links, dots, 3px
spines — so the page reads as ink-on-paper with electric-blue annotations. **The deep
blue is the action mass**: the primary CTA is a solid `#1B14BA` block with white text,
the heaviest object on the page, like a stamp of ink. Hover on the CTA brightens to
`#302BFB` (paper → energy). One primary CTA per view.

Rejected mapping (recorded): the inverse — vivid `#302BFB` as CTA fill and deep
`#1B14BA` for labels/links. Rejected because the site would no longer *read* as
Codyza Blue (the ubiquitous structural color would be navy), and a full-saturation
`#302BFB` button mass on warm paper vibrates against `#F7F6F2` more than it invites.

Shared status colors: unchanged from REDESIGN.md §2 — on paper use green `#15803D`,
amber `#B45309`, red `#EF4444`; semantic only, never decorative.

Member "Arcade" scope: **unchanged per D-001.** Violet `#8B5CF6` remains the member
accent. Codyza Blue appears in the member area only via the logo and, where needed,
`--cz-accent-bright` in chrome — it does not replace violet.

---

## 3. Typography — editorial voice vs journal headlines (D-007)

**Resolution: keep the journal's type system exactly as specified in REDESIGN.md §3.**
Instrument Serif 400, lowercase, tight (`-0.03em`, line-height 0.95) for display;
Inter for body/UI; JetBrains Mono for specimen labels, code, IDs, XP. Trim
Syne, Space Mono, Fraunces from `src/lib/fonts.ts`.

Reasoning: the blueprint's "editorial, large typography" and the journal's lowercase
serif are not in conflict — the *editorial* quality comes from scale, whitespace,
hairline rules, asymmetric grids, and restraint, not from the typeface's case. The
lowercase serif is one of the few genuinely ownable moves in the system; in Codyza Blue
context it reads as a literary magazine headline, which is precisely "Stripe
storytelling" territory. Discipline that makes it editorial rather than twee:

- Lowercase serif is for **display only** (hero + section headlines). Card titles, table
  headers, nav, buttons, and all member/admin UI are Inter with normal casing.
- Body copy is never serif, never lowercase-forced. Max ~65ch, 1.6–1.75 line-height.
- Mono labels are lowercase-tracked and tiny (10–11px) — annotations, not headings.
- Tabular figures for XP, stats, leaderboards.

Rejected alternative (recorded in `docs/decisions.md` D-007): switching display to a
tight-tracked neutral sans (Inter/grotesque, sentence case) for a "purer" editorial
voice. Rejected because it collapses into the generic-editorial sameness D-001 already
rejected in option 2, and discards a shipped, distinctive signature for no gain.

---

## 4. Hero treatment (D-008)

**Retained (per D-001):** the dark terminal-in-hero on the light page — line-by-line
headline mask reveal, terminal types after the headline settles, terminal drifts at
`scrollY * 0.1`, live-dot status line as social proof. Terminal chrome accents and
"live" indicators inside it use `--cz-accent-bright` / semantic green, never `#302BFB`
directly on the dark surface.

**Earth animation: rejected everywhere on the public site** (recorded in
`docs/decisions.md` D-008). Reasons: (a) the hero already has its one object — two
focal animations in a hero is one too many, and the terminal is the narratively load-
bearing one (it *is* the glimpse of Quest); (b) a rotating globe/Earth in a hero is a
2023–2025 SaaS cliché (GitHub, Vercel, half of YC) — it would inject exactly the
template feel this direction exists to kill; (c) a WebGL/canvas Earth threatens the
60fps mid-range-mobile budget and the Lighthouse ≥90 gate for zero narrative payoff.

The blueprint's underlying intent — "builders around the world" — is served instead by
the existing **momentum band**: "building from" locations rendered as mono-label
coordinates/city names (e.g. `27.7172° N, 85.3240° E / kathmandu`) with count-up stats.
Global reach as journal entries, not a stock globe. If a future phase wants a map
moment, it must be a static editorial map graphic, not an animated sphere.

---

## 5. Forbidden patterns

Reject on sight, any page, any phase:

1. Centered hero with headline + subhead + two side-by-side buttons and nothing else.
2. Three-feature-cards row (icon, title, two lines of copy — times three).
3. Rainbow / multi-stop gradients; any gradient text.
4. Stock glassmorphism (frosted cards with white borders floating over blobs). The nav
   blur-on-scroll is the single sanctioned blur.
5. Nebula purple / starfield / aurora on the **public** site — that world exists only
   behind the login (Arcade) and inside the terminal object.
6. Stock Tailwind palette colors used as brand colors (`#3B82F6`, `#8B5CF6` on public,
   `#06B6D4`, etc.). If a color isn't in the token table above, it doesn't ship.
7. Rotating globes, floating 3D blobs, particle fields on paper.
8. Illustration-pack humans, isometric spaceships, emoji as design elements.
9. "Trusted by" logo walls of companies that never touched Codyza; fabricated
   testimonials; invented metrics.
10. Dark-mode toggle on the public site — the light/dark split is narrative
    (public/member), not a preference.
11. More than one primary CTA per view; more than one pinned scroll section per page
    (Chapters only).
12. Generic copy voice: "Supercharge your workflow", "Unlock your potential",
    exclamation-mark enthusiasm. Codyza speaks in lowercase confidence:
    "building alone gets lonely."

---

## 6. Handoff — Design-System Architect (Phase 2 retokenization)

Scope of Phase 2: retokenize `src/app/globals.css` to the D-001 merged palette. No
layout or component redesign in this pass.

1. **Accent swap in the public scope.** In `globals.css` `.cz-landing`
   (lines ~84–104): retire `--cz-sage` (`#5E7359`), `--cz-sage-light`, `--cz-terracotta`
   (`#B8734A`), `--cz-terracotta-ink` (`#96522E`) and introduce the accent family from
   §2 (`--cz-accent #302BFB`, `--cz-accent-2 #1B14BA`, `--cz-accent-soft`,
   `--cz-accent-badge`, `--cz-accent-bright #8B87FF`). Prefer renaming to the semantic
   `--cz-accent*` names over keeping color-named tokens.
2. **Retire `--cz-ink-blue` (`#3B6B8C`)** (`globals.css` line ~97, used at lines ~549,
   703, 783, 924, 1198). Map its uses onto the accent family — one blue family on the
   site. Line ~1198 is a sage→ink-blue→terracotta gradient; replace with a single-hue
   treatment or a `#1B14BA → #302BFB` logo-gradient if a gradient is warranted there.
3. **Fix the brand constants.** `--color-codyza-blue: #3b82f6` in the `@theme` block
   (`globals.css` line 19) and `BRAND_COLORS.blue: "#3b82f6"` in `src/constants/site.ts`
   → `#302BFB`. Audit `--color-codyza-cyan #06b6d4` usage; it is not part of the merged
   palette (semantic/status only or delete).
4. **Consolidate the scopes.** REDESIGN.md §7: `hybrid-design.css`'s `.codyza-public`
   (`--journal-sage`, `--journal-terracotta`, `--journal-paper #f7f7f7`) graduates into
   the real `.codyza-public` token layer in `globals.css` with the §2 values — note the
   paper drift (`#f7f7f7` vs canonical `#F7F6F2`; canonical wins). `.journal-specimen::before`
   spines and `.journal-label` move from sage to `--cz-accent`.
5. **`::selection`** (`globals.css` ~line 117): sage rgba → `--cz-accent-badge`
   (`rgba(48,43,251,0.14)`).
6. **Focus rings:** `--ring` in the light scope is currently violet `#8B5CF6`; public
   scope focus = `--cz-accent`. Member scope stays violet.
7. **Galaxy/starfield ambient** (`sofi-landing.css` `--galaxy-blue rgba(37,99,235,…)`):
   per REDESIGN §6 this does not belong on paper; where it survives behind the login,
   retint the blue component to the Codyza Blue family.
8. **Member scope: do not touch** the Arcade accent (`#8B5CF6`) — D-001 keeps it.
9. **Contrast gate:** every text use of the new tokens must hold the §2 table ratios;
   re-verify after any value tweak. Status colors on paper: green `#15803D`, amber
   `#B45309`.
10. **No raw hex in components** — everything routes through tokens; delete
    `globals.css.bak` per REDESIGN §7.

Review gate: Brand & Creative Director signs off on Phase 2 by checking a rendered
page against §1 (personality), §2 (ratios), and §5 (forbidden patterns).
