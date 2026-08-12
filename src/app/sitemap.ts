import type { MetadataRoute } from "next"

const routes = ["", "/about", "/projects", "/community", "/news", "/quest", "/team", "/join", "/contact", "/leaderboard", "/certificates/verify"]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `https://codyza.com${route}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.6,
  }))
}
