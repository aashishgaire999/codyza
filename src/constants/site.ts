export const SITE_CONFIG = {
  name: "Codyza",
  domain: "codyza.com",
  url: "https://codyza.com",
  tagline: "Build. Learn. Deploy. Grow Together.",
  description:
    "A community of devs, designers, and dreamers shipping real projects together. Not a bootcamp. Not another chat server. Free to join, built to last.",
  ogImage: "/logo/codyza-mark-v2.png",
  email: "team@codyza.com",
  hrEmail: "hiring@codyza.com",
  standupDay: "Tuesday",
  standupTime: "6pm UTC",
  reviewCycle: "48 hours",
} as const

// Public invitations always open the application story first. The form is a
// separate, deliberate step reached from the hero's "start your application"
// control.
export const JOIN_HREF = "/join#join-top" as const

export const BRAND_COLORS = {
  background: "#050508",
  purple: "#8b5cf6",
  blue: "#302bfb",
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
  { label: "Community", href: "/community" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Quest", href: "/quest" },
]
