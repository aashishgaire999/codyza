# Codyza Redesign Plan

> **2026-07-12 — partially superseded by D-001 (`docs/decisions.md`):** the public-site
> direction is now a *merge* — editorial layout with **Codyza Blue** as the protected
> accent (replacing sage/terracotta), keeping the mono specimen labels and the dark
> terminal-in-hero. The dark "Arcade" member area and the two-scope token skeleton below
> remain valid. See `docs/brand-direction.md` for the merged identity.

Full-site redesign: colors, structure, layout, storytelling, motion, UI/UX cleanup.
Direction (user-locked 2026-07-11): **Hybrid split** — light **"Field Journal"** for the
public site, dark **"Arcade / Mission Control"** for the member + admin area. The theme
switch is a *narrative feature*: the public site is the printed prospectus; logging in is
stepping inside the machine. Auth pages are the dark doorway.

---

## 1. Design Direction

One story told by the whole site: *a lone builder finds a crew, ships something real, and levels up.*

- **Public — Field Journal:** warm paper, black ink, lowercase serif headlines, mono
  specimen labels, sage/terracotta accents. A dark terminal window sits on the paper like
  a photograph taped into a journal — the one glimpse of the world behind the login.
- **Member — Arcade:** near-black, violet glow, XP bars, rank badges, dense data. The
  reward for joining is *entering the dark UI you saw through the terminal*.
- **Auth = the airlock:** dark theme, minimal, calm — paper → void transition.
- **Kill:** rainbow 4-stop gradients, the old space/nebula purple system, competing glass
  styles. Two themes, one shared skeleton (type, spacing, mono index labels, radius).

---

## 2. Color System (two scoped token layers, one skeleton)

Tokens live in `globals.css`; scopes `.codyza-public` (light) and `.codyza-member` (dark)
remap the same semantic names, and shadcn vars map onto them per scope. No raw hex in components.

### Public — Field Journal (light)

| Token | Value | Usage |
|---|---|---|
| `--cz-bg` | `#F7F6F2` | Warm paper page background |
| `--cz-surface` | `#FFFFFF` | Cards, specimen panels, form cards |
| `--cz-ink` | `#111110` | Primary text |
| `--cz-muted` | `rgba(17,17,16,0.58)` | Secondary text (≥4.5:1 on paper) |
| `--cz-faint` | `rgba(17,17,16,0.40)` | Micro-labels only |
| `--cz-border` | `rgba(17,17,16,0.12)` | Hairline rules |
| `--cz-accent` | `#5E7359` (sage) | Labels, links, live/active, specimen spines |
| `--cz-accent-2` | `#B8734A` (terracotta) | Primary CTA fill, highlights — CTA-only |
| `--cz-terminal` | `#0C0C13` | The dark terminal/ID-card objects on paper |

### Member — Arcade (dark)

| Token | Value | Usage |
|---|---|---|
| `--cz-bg` | `#060609` | Page background (no pure #000) |
| `--cz-surface` | `#0C0C13` | Cards, nav |
| `--cz-ink` | `#F5F5F7` | Primary text |
| `--cz-muted` | `rgba(255,255,255,0.60)` | Secondary text |
| `--cz-border` | `rgba(255,255,255,0.08)` | Hairlines |
| `--cz-accent` | `#8B5CF6` (violet) | XP, CTAs, focus, rank glow |
| `--cz-accent-soft` | `rgba(139,92,246,0.14)` | Tints, badges |

### Shared status colors (both scopes, semantic ONLY)

`--cz-green #22C55E` live/success · `--cz-amber #F59E0B` pending · `--cz-red #EF4444` error.
(Verify green/amber contrast per scope; darken on paper: green `#15803D`, amber `#B45309`.)

Rules:
- Public accents: sage is structural, terracotta is *action* — if everything is terracotta,
  nothing is. Member accent: violet only.
- Status colors are semantic and never decorative.
- Both scopes map shadcn vars (`--background`, `--primary`, …) so shadcn UI inherits per area.

## 3. Typography (trim 6 fonts → 3)

| Role | Font | Notes |
|---|---|---|
| Display / headlines | **Instrument Serif** (400) | lowercase, `letter-spacing -0.03em`, `line-height 0.95` |
| Body / UI | **Inter** (400/500/600) | 16px base, `line-height 1.6–1.75`, max ~65ch |
| Mono labels / terminal | **JetBrains Mono** (400/600/700) | 10–11px uppercase-tracked micro-labels, code, CZX IDs, XP |

- **Remove Syne, Space Mono, Fraunces** from `src/lib/fonts.ts` → smaller bundle, faster LCP.
- Type scale: hero `clamp(3rem, 9vw, 7rem)` · section `clamp(2rem, 5.5vw, 4rem)` ·
  card title `1.375rem` · body `1rem` · small `0.8125rem` · micro `0.625–0.6875rem`.
- Tabular figures for XP, stats, leaderboards.

## 4. Layout System

- Container `max-w-[1320px]`, gutters `px-5 sm:px-8 lg:px-10`; member area `max-w-6xl`.
- Spacing on 4/8 rhythm; section padding `py-24 md:py-32`; hero `min-h-dvh`.
- Section separators: 1px `--cz-border` hairlines + mono index labels (`005 / what is codyza`) —
  this numbering IS the layout signature, keep it on every page including member area.
- Radius scale: pills `9999px` · inputs/buttons `10px` · cards `16px` · panels/terminal `20px`.
- Asymmetric editorial grids on landing (`1.05fr/0.95fr` splits), dense clean tables in member/admin.
- z-index scale: content 0–10 · sticky nav 50 · drawer 60–70 · modal 80 · toast 90.

## 5. Storytelling — Landing Narrative Arc

Section order (mostly exists; refine, don't rebuild):

1. **Hero — the hook.** "building alone gets lonely." staggered line reveal on paper +
   the dark terminal animation as the "window into the crew". Live-dot status line as social proof.
2. **Proof strip.** featured-in marquee (pause on hover, static when reduced-motion).
3. **Chapters — the journey.** ship / learn / grow as full-screen scroll-scrubbed panels
   (see §6). This is the emotional core: each chapter = one verb, one visual, one payoff.
4. **Manifesto — what is codyza.** "you don't need another course. you need a crew." +
   CZX ID card (the artifact you get) + live counts from Supabase.
5. **Receipts — currently shipping.** real project cards, real deploys. Empty state stays
   an invitation ("nothing live yet — you could fix that").
6. **Momentum — stats band.** count-up day/projects + building-from locations.
7. **Faces — the crew.** team cards.
8. **The ask — apply CTA.** one primary action, glow, ~3 min promise.
9. **Footer.** wordmark, recently-at-codyza timeline, slack gate.

Inner pages inherit the arc in miniature: mono index label → serif headline → content → single CTA.

## 6. Motion System

**Stack: Framer Motion (already installed) + Lenis for smooth scroll. No GSAP** — FM 12's
`useScroll`/`useTransform` covers scrub/parallax; one less dependency.

Tokens (CSS vars + FM constants in `src/lib/motion.ts`):
- Durations: micro `150–200ms` · standard `250–300ms` · entrance `400ms` · exits ~65% of enter.
- Easing: enter `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) · exit `ease-in` · springs for cards/modals.
- Stagger: 40ms per item, cap 6 items.

Choreography:
- **Smooth scroll:** Lenis on public pages only (native scroll in member/admin — it's a tool).
- **Chapters scrub:** pin the 3-panel section, `useScroll` progress drives per-panel
  opacity/translate + background hue shift. This is the ONLY pinned section on the page.
- **Reveals:** one shared `<FadeInView>` (exists) — opacity + 24px translateY, `whileInView`, once.
- **Hero:** line-by-line mask reveal; terminal types after headline settles; terminal drifts
  `scrollY * 0.1` (exists, keep).
- **Micro-interactions:** cards scale `1 → 1.01` + border-accent on hover; buttons press `0.97`;
  arrow icons translate on hover; nav background blurs in after 40px scroll.
- **Ambient:** public = subtle paper grain + at most one slow-drifting decor element
  (no starfield on paper); member = starfield/aurora glow lives HERE, behind the login.
  `transform/opacity` only, `will-change` scoped, paused when tab hidden.

Hard rules: transform/opacity only · no pinning beyond Chapters · everything interruptible ·
full `prefers-reduced-motion` fallback (static marquee, no pin, instant reveals) ·
60fps budget — test on mid-range mobile.

## 7. UI/UX Cleanup (debt that blocks the redesign)

- [ ] Consolidate CSS: `hybrid-design.css` graduates into the real theme layer (scoped
      `.codyza-public` / `.codyza-member` tokens in `globals.css`); re-skin the `cz-*`
      component classes in `sofi-landing.css` via variables instead of duplicating them;
      **delete** `globals.css.bak`.
- [ ] Delete dead components: `ParticleField`, `GlowOrb`, `AuthCard`*, `StatCounter`,
      unused landing sections (`FeaturesSection`, `HowItWorksSection`) — or mount them deliberately.
- [ ] One navbar system: unify `Navbar` / `SmartNavbar` into one component with variants.
- [ ] Fix `BRAND_COLORS` drift in `constants/site.ts` (purple `#8b5cf6` vs `#7c3aed`) → tokens.
- [ ] Accessibility pass: muted text ≥4.5:1, visible focus rings (`--cz-accent`), heading
      hierarchy, `aria-live` on scroll progress %, 44px touch targets, keyboard nav on drawer.
- [ ] Forms (apply/auth/settings): visible labels, inline validation on blur, error + recovery
      text, loading buttons, autofocus first invalid field.
- [ ] `min-h-dvh` everywhere `100vh` is used; no horizontal scroll at 375px.

## 8. Page-by-Page Rollout

**Phase 0 — Foundation** (do first, everything depends on it)
Tokens in `globals.css` · trim fonts · `src/lib/motion.ts` · Lenis provider · unified navbar.

**Phase 1 — Landing polish**
Chapters → pinned scrub · hero line-mask reveal · marquee hover-pause · CSS consolidation · delete dead files.

**Phase 2 — Public pages** (each: index label + serif headline + same tokens)
`/projects` (filter pills, card grid), `/leaderboard` (rank tiers via accent intensity, tabular nums),
`/contributor/[id]` (public CZX card as hero), `/apply` (wizard with progress + step transitions).

**Phase 3 — Auth** (`/login`, `/forgot-password`, `/set-password`, `/onboarding`)
The airlock: dark member theme, minimal centered cards, terminal-frame styling, calm motion (fade only).

**Phase 4 — Member area** (dashboard, projects, groups, bounties, settings)
Same tokens, denser layout, native scroll, XP/rank as the visual reward system
(accent progress bars, rank badges), skeleton loading states.

**Phase 5 — Admin + analytics**
Function over flourish: clean tables, status chips from semantic colors, accessible charts.

**Phase 6 — QA gate (definition of done)**
375/768/1024/1440px · reduced-motion run-through · keyboard-only run-through ·
contrast audit · Lighthouse ≥90 perf / ≥95 a11y on `/` · dead-code sweep.

---

*Generated 2026-07-11 · design-engine baseline: Community/Forum landing pattern, Modern Dark
(cinematic) style, motion dial 8/10. Supersedes visual direction in DESIGN.md (keep DESIGN.md
as inventory reference until Phase 1 lands, then update it).*
