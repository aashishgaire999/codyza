export const SITE_CONFIG = {
  name: "Codyza",
  domain: "codyza.com",
  url: "https://codyza.com",
  tagline: "Build. Learn. Deploy. Grow Together.",
  description:
    "A futuristic developer ecosystem where beginners and intermediates collaborate on real-world projects, build SaaS products, deploy AI tools, and grow through gamified contributor systems.",
  ogImage: "/og-image.png",
  email: "team@codyza.com",
  hrEmail: "hiring@codyza.com",
  standupDay: "Tuesday",
  standupTime: "6pm UTC",
  reviewCycle: "48h",
} as const

export const BRAND_COLORS = {
  background: "#050508",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#22c55e",
} as const

export const SOCIAL_LINKS = {
  github: "https://github.com/codyza-com",
  instagram: "https://www.instagram.com/codyza_",
  slack: "https://join.slack.com/t/codyza/shared_invite/zt-3zhylkmp1-JU9qG2GrdokWJyWbu7Rxrg",
  developer: "https://github.com/aashishgaire999",
} as const

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Projects", href: "/projects" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Team", href: "/#team" },
]
