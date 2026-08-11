import "server-only"
import { createHash, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

export const ADMIN_COOKIE = "codyza_admin_session"

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function createAdminSessionToken() {
  const expected = process.env.ADMIN_ACCESS_CODE || ""
  return expected ? createHash("sha256").update(`codyza-admin:${expected}`).digest("hex") : ""
}

export function isAdminSessionToken(value: string) {
  const expected = createAdminSessionToken()
  return Boolean(value && expected && safeEqual(value, expected))
}

export function isAdminRequest(request: Request) {
  const supplied = request.headers.get("x-admin-code") || ""
  const expected = process.env.ADMIN_ACCESS_CODE || ""
  if (supplied && expected && safeEqual(supplied, expected)) return true
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1) || ""
  return isAdminSessionToken(decodeURIComponent(cookie))
}

export function createServiceSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
