import type { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/constants/site"
import { getNewsEntries } from "@/lib/news"

const routes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/community", changeFrequency: "weekly", priority: 0.9 },
  { path: "/news", changeFrequency: "weekly", priority: 0.9 },
  { path: "/join", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/quest", changeFrequency: "monthly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.7 },
  { path: "/leaderboard", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/certificates/verify", changeFrequency: "yearly", priority: 0.6 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getNewsEntries()
  const staticPages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE_CONFIG.url}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
  const newsPages: MetadataRoute.Sitemap = news.map((entry) => ({
    url: `${SITE_CONFIG.url}/news/${entry.slug}`,
    lastModified: new Date(`${entry.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [...staticPages, ...newsPages]
}
