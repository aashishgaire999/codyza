import { existsSync, readFileSync } from "node:fs"

function loadLocalEnv() {
  if (!existsSync(".env.local")) return
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator < 1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()

const requiredEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_ACCESS_CODE",
  "RESEND_API_KEY",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
]

const requiredTables = [
  "contributors",
  "submissions",
  "applications",
  "project_groups",
  "group_members",
  "bounties",
  "notifications",
  "site_content",
  "media_assets",
  "news_posts",
  "news_comments",
  "announcements",
  "work_sessions",
]

const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name])
if (missingEnvironment.length) {
  console.error(`Missing environment variables: ${missingEnvironment.join(", ")}`)
  process.exit(1)
}

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const checks = await Promise.all(requiredTables.map(async (table) => {
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*&limit=0`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
    })
    return { table, ready: response.ok, status: response.status }
  } catch {
    return { table, ready: false, status: 0 }
  }
}))

const unavailable = checks.filter((check) => !check.ready)
if (unavailable.length) {
  console.error(`Unavailable database tables: ${unavailable.map(({ table, status }) => `${table} (${status || "network error"})`).join(", ")}`)
  console.error("Apply supabase/codyza-platform.sql, then run this check again.")
  process.exit(1)
}

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL)
if (siteUrl.protocol !== "https:" && siteUrl.hostname !== "localhost") {
  console.error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.")
  process.exit(1)
}

console.log(`Release configuration ready: ${requiredEnvironment.length} environment variables and ${requiredTables.length} database tables verified.`)
