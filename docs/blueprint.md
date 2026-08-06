# Codyza 2.0 Website Blueprint v1.0

Strategic Product & UX Blueprint. Canonical reference for the Codyza 2.0 team
(agents in `.claude/agents/codyza/`, roster in `TEAM.md`).

## Vision

Codyza is a technology organization where ambitious builders collaborate on real-world
products, gain practical experience, and launch meaningful software together. The public
website builds trust and attracts contributors; Codyza Quest is the internal operating
platform.

## Core Principles

- Evolve the current Codyza website rather than replacing it.
- Preserve leadership, contributors, projects, leaderboard, Codyza IDs, application flow,
  member portal, admin portal, and Quest.
- Storytelling over marketing.
- Real products, real people, real launches.
- Apple-level simplicity, GitHub authenticity, Stripe storytelling, Codyza identity.

## Information Architecture

- **Top navigation:** Home • Projects • Community • News • About • Join • Quest
- **Supporting pages:** Leadership, Contributor Profiles, Case Studies, Certificates,
  Contact, Legal.

## Homepage Story

1. Hero
2. Why Codyza Exists
3. Products We Build
4. Meet the Builders
5. Inside Codyza Quest
6. Launch Timeline
7. Join Codyza

Purpose: visitors should leave wanting to build with Codyza.

## Visual Design

Light editorial public experience with Codyza Blue accent, generous whitespace, large
typography, real screenshots, subtle Earth animation in hero, Apple-inspired motion,
no generic SaaS dashboard aesthetic.

> ⚠️ **Open decision:** this section conflicts with the locked direction in `REDESIGN.md`
> (warm-paper "Field Journal" with sage/terracotta accents, dark terminal object in hero).
> See `docs/decisions.md` → D-001. Do not implement hero/accent changes until resolved.

## Quest Integration

Quest is the internal volunteer operating platform supporting Codyza.com.

**Workflow:** Discover Codyza → Apply → Review → Accepted → Quest Onboarding →
Dashboard → Tasks → Projects → Certificates.

Quest remains the source of truth for volunteer progress, tasks, submissions,
announcements, certificates, and leaderboard. Public-approved data flows back to
Codyza.com.

## Features to Preserve

Leadership profiles with photos and links, contributor profiles, Codyza IDs, leaderboard,
achievements, public projects, case studies, application system, member portal, admin
portal, certificate verification, Codyza News.

## Quest Features

Volunteer dashboard, admin dashboard, role-based access, announcements, progress
tracking, task assignment, submissions, break requests, certificate eligibility, points
leaderboard, project management.

## Technical Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Supabase, PostgreSQL,
Vercel, Row-Level Security.

## Implementation Roadmap

1. **Phase 1:** Brand & Product Strategy
2. **Phase 2:** Design System
3. **Phase 3:** Wireframes
4. **Phase 4:** High-fidelity UI
5. **Phase 5:** Engineering
6. **Phase 6:** QA, Accessibility, SEO, Launch

Maintain a design decision log (`docs/decisions.md`) throughout development.

## Long-term Ecosystem

The Codyza ecosystem includes Codyza.com, Codyza Quest, Najikei, NepalBuddy, future
products, unified contributor profiles, shared design language, and a scalable
architecture for future expansion.
