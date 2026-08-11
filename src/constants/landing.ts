export const LANDING_MARQUEE_WORDS = [
  "react", "next.js", "typescript", "python", "node.js", "tailwind",
  "supabase", "postgresql", "docker", "vercel", "openai", "graphql",
  "rust", "go", "figma", "aws",
] as const

export const FEATURED_IN = [
  {
    name: "Marshall Independent",
    logo: "/press/marshall-independent.png",
    logoWidth: 430,
    logoHeight: 61,
    href: "https://www.marshallindependent.com/?s=Codyza",
  },
  {
    name: "Marshall Area Chamber of Commerce",
    logo: "/press/marshall-area-chamber.jpg",
    logoWidth: 800,
    logoHeight: 230,
    href: "https://business.marshallmn.org/list/member/codyza-3727?fl=2",
  },
  {
    name: "LinkedIn",
    logo: "/press/linkedin.svg",
    logoWidth: 32,
    logoHeight: 32,
    href: "https://www.linkedin.com/company/codyza/",
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
    id: "claim",
    num: "002",
    word: "claim",
    headline: "pick work with a clear outcome.",
    accent: "real needs · clear ownership.",
    body:
      "Choose an open bounty, understand the goal, and take responsibility for getting it over the line.",
    highlights: ["open bounties", "clear XP", "claim ownership"],
    visual: "bounty",
  },
  {
    id: "build",
    num: "003",
    word: "build",
    headline: "work with a small crew.",
    accent: "people · roles · shared missions.",
    body:
      "Join a focused group, see who owns what, and keep the work moving without building alone.",
    highlights: ["project groups", "shared mission", "visible activity"],
    visual: "group",
  },
  {
    id: "ship",
    num: "004",
    word: "ship",
    headline: "turn finished work into proof.",
    accent: "submit · review · verify.",
    body:
      "Submit the repository and live URL. Once reviewed, the work becomes part of your public Codyza record.",
    highlights: ["GitHub + live URL", "crew review", "verified profile"],
    visual: "submission",
  },
] as const
