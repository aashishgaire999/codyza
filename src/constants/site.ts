export const SITE_CONFIG = {
  name: "Codyza",
  domain: "codyza.com",
  url: "https://codyza.com",
  tagline: "Build. Learn. Deploy. Grow Together.",
  description:
    "A futuristic developer ecosystem where beginners and intermediates collaborate on real-world projects, build SaaS products, deploy AI tools, and grow through gamified contributor systems.",
  ogImage: "/og-image.png",
  email: "hello@codyza.com",
} as const

export const BRAND_COLORS = {
  background: "#050508",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#22c55e",
} as const

export const SOCIAL_LINKS = {
  github: "https://github.com/aashishgaire999",
  twitter: "https://twitter.com/codyza",
  discord: "https://discord.gg/codyza",
} as const

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Projects", href: "#projects" },
  { label: "Contributors", href: "#contributors" },
  { label: "Community", href: "#community" },
] as const