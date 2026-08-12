import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/member", "/login", "/onboarding", "/set-password", "/api/"] },
    sitemap: "https://codyza.com/sitemap.xml",
    host: "https://codyza.com",
  }
}
