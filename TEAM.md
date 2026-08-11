# Codyza 2.0 Product Team

An integrated 20-person professional product team, defined as Claude Code agents in
`.claude/agents/codyza/`. Each agent carries its role charter, the shared mandatory
ecosystem responsibilities, and the per-feature review checklist from the
Codyza 2.0 Website Blueprint v1.0 (`docs/blueprint.md`).

**Canonical documents:** `docs/blueprint.md` (vision, IA, homepage story, Quest
workflow, stack, roadmap) • `docs/decisions.md` (decision log; D-001 visual direction
is OPEN) • `REDESIGN.md` (current visual system and tokens) • `docs/PRD.md` (to be
written by the Product Manager).

## Roster

| # | Role | Agent | Owns |
|---|------|-------|------|
| 1 | Product Director | `codyza-product-director` | Vision, roadmap, scope gate |
| 2 | Product Manager | `codyza-product-manager` | PRD, milestones, acceptance criteria, decision log |
| 3 | UX Researcher | `codyza-ux-researcher` | Personas, trust problems, comprehension testing |
| 4 | Information Architect | `codyza-information-architect` | Sitemap, navigation, routes, taxonomy |
| 5 | Lead UX Designer | `codyza-lead-ux-designer` | End-to-end user journeys |
| 6 | Senior UI Designer | `codyza-senior-ui-designer` | High-fidelity interfaces, responsive screens |
| 7 | Brand & Creative Director | `codyza-brand-creative-director` | Identity, anti-template review |
| 8 | Design-System Architect | `codyza-design-system-architect` | Tokens + shared component library |
| 9 | Content Strategist / UX Writer | `codyza-content-strategist` | All copy: pages, forms, errors, emails |
| 10 | Motion & Interaction Designer | `codyza-motion-designer` | Motion, transitions, reduced-motion |
| 11 | Senior Frontend Architect | `codyza-frontend-architect` | Next.js architecture, rendering strategy |
| 12 | Senior React/Next.js Developer | `codyza-nextjs-developer` | Public site + shared component implementation |
| 13 | Backend & API Architect | `codyza-backend-api-architect` | APIs, server actions, integration contracts |
| 14 | Supabase & Database Engineer | `codyza-supabase-engineer` | Schema, migrations, RLS, auth, storage |
| 15 | IAM Engineer | `codyza-iam-engineer` | Roles, sessions, privilege boundaries |
| 16 | Application Security Engineer | `codyza-appsec-engineer` | Threat modeling, security review |
| 17 | DevOps & Cloud Engineer | `codyza-devops-engineer` | Vercel, CI/CD, environments, rollback |
| 18 | QA & Test Automation Engineer | `codyza-qa-engineer` | Tests, role testing, launch validation |
| 19 | Accessibility Specialist | `codyza-accessibility-specialist` | WCAG AA, keyboard, screen readers |
| 20 | SEO, Performance & Analytics Engineer | `codyza-seo-performance-engineer` | SEO, Core Web Vitals, analytics |

## Pipeline

```
Product Director + Product Manager
        ↓
Research + Information Architecture
        ↓
UX + Content
        ↓
Brand + UI + Design System
        ↓
Frontend + Backend + Database
        ↓
Security + Accessibility + QA
        ↓
DevOps + SEO + Performance
        ↓
Final Product Review
        ↓
Production Launch
```

No discipline dominates: each role reviews decisions from its own perspective and flags
cross-discipline concerns to the owning role rather than overriding them.

Blueprint roadmap mapping: **Phase 1** Brand & Product Strategy → **Phase 2** Design
System → **Phase 3** Wireframes → **Phase 4** High-fidelity UI → **Phase 5**
Engineering → **Phase 6** QA, Accessibility, SEO, Launch. A design decision log
(`docs/decisions.md`) is maintained throughout.

## How to use the team

- Ask for a role by name: *"Use the codyza-supabase-engineer subagent to design the
  applications schema."*
- Or describe the work — role descriptions are written so the right specialist triggers
  automatically for matching tasks.
- Deliverables live in `docs/`: `docs/PRD.md` (Product Manager), `docs/sitemap.md`
  (Information Architect), `docs/decisions.md` (all roles — decisions and rejected
  alternatives).

## Shared obligations (baked into every agent)

Every role must preserve and improve: Codyza's mission, story, and public content;
leadership names, roles, photos, and social links; contributors and public profiles;
Codyza IDs, XP, achievements, leaderboard; existing and future projects; the application
and acceptance workflow; member and admin portals; Codyza Quest integration (tasks,
submissions, progress, breaks, announcements, certificates); public certificate
verification; news; public/private data controls; and mobile, accessibility, security,
SEO, and performance quality.

For every major feature or page, the team defines: purpose, users, journey, data,
public/private boundaries, desktop/tablet/mobile behavior, loading/empty/error/success/
unauthorized states, accessibility, security, analytics events, acceptance criteria, and
the decision with rejected alternatives.

The final result must feel like one coherent Codyza ecosystem, not separate templates.
