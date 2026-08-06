export const LANDING_MARQUEE_WORDS = [
  "react", "next.js", "typescript", "python", "node.js", "tailwind",
  "supabase", "postgresql", "docker", "vercel", "openai", "graphql",
  "rust", "go", "figma", "aws",
] as const

export const FEATURED_IN = [
  {
    name: "LinkedIn",
    logo: "/press/linkedin.svg",
    logoWidth: 32,
    logoHeight: 32,
    href: "https://www.linkedin.com/company/codyza",
  },
  {
    name: "Marshall Area Chamber",
    logo: "/press/marshall-area-chamber.jpg",
    logoWidth: 800,
    logoHeight: 230,
    href: "https://marshallmn.org",
  },
  {
    name: "Marshall Independent",
    logo: "/press/marshall-independent.png",
    logoWidth: 430,
    logoHeight: 61,
    href: "https://www.marshallindependent.com",
  },
] as const

export const BUILDING_LOCATIONS = [
  "🇺🇸 Minnesota, US",
  "🇳🇵 Kathmandu, NP",
  "+ you?",
] as const

export const APPLY_ROADMAP = [
  { num: "01", title: "you write 5 honest answers", desc: "about 3 minutes total" },
  { num: "02", title: "a founder reads every one", desc: "within 48 hours" },
  { num: "03", title: "you get a codyza id", desc: "something like czx-0042" },
  { num: "04", title: "you join the next standup", desc: "welcome to the crew" },
] as const

export const CREW_PILLARS = [
  {
    title: "real projects",
    desc: "Things people actually use, not tutorial clones",
  },
  {
    title: "real teammates",
    desc: "Devs, designers, students from everywhere",
  },
  {
    title: "real momentum",
    desc: "Standups, reviews, deploys — the rhythm of shipping",
  },
] as const

export const MANIFESTO_COPY =
  "Tutorials end. Courses finish. Bootcamps cost money. And after all of it, you're often still on your own — wondering if anyone will ever see what you build. Codyza is the crew that gathers around your first real project. We build together. We review code together. We deploy together. Free to join, and a place worth staying."

export const CHAPTER_WORDS = [
  { num: "002", word: "learn" },
  { num: "003", word: "grow" },
  { num: "004", word: "ship" },
] as const

export const CHAPTER_PANELS = [
  {
    id: "learn",
    num: "002",
    word: "learn",
    headline: "grow skills alongside the crew.",
    accent: "learn by doing, together.",
    body:
      "No lectures in a vacuum. Pair on features, get feedback on your PRs, and level up through the rhythm of building — not binge-watching courses.",
    highlights: ["pair programming", "honest feedback", "ship to learn"],
    visual: "skills",
  },
  {
    id: "grow",
    num: "003",
    word: "grow",
    headline: "earn your place in the community.",
    accent: "xp · leaderboard · network.",
    body:
      "Show up, ship work, and climb the board. Codyza connects you with contributors worldwide — references, collabs, and a crew that remembers your name.",
    highlights: ["earn XP", "public profile", "global crew"],
    visual: "community",
  },
  {
    id: "ship",
    num: "004",
    word: "ship",
    headline: "build things people actually use.",
    accent: "you ship. we deploy.",
    body:
      "Skip the tutorial treadmill. At Codyza you work on real products with a crew — standups, pull requests, and live URLs that prove you can ship.",
    highlights: ["live deploys", "code review", "production URLs"],
    visual: "deploy",
  },
] as const
