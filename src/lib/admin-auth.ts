import "server-only"
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

export const ADMIN_COOKIE = "codyza_admin_session"

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_CODE || ""
}

function sign(payload: string) {
  const secret = sessionSecret()
  return secret ? createHmac("sha256", secret).update(payload).digest("base64url") : ""
}

export function createAdminSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    nonce: randomBytes(24).toString("base64url"),
  })).toString("base64url")
  const signature = sign(payload)
  return signature ? `${payload}.${signature}` : ""
}

export function isAdminSessionToken(value: string) {
  const [payload, signature, extra] = value.split(".")
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return false
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { version?: number; expiresAt?: number }
    return session.version === 1 && typeof session.expiresAt === "number" && session.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function isAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1) || ""
  return isAdminSessionToken(decodeURIComponent(cookie))
}

export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")

  // A public/anon key here silently turns server mutations into browser-level
  // requests. Supabase then rejects them with RLS errors, which is much harder
  // to diagnose than a clear configuration failure.
  if (key === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is configured with the public anon key")
  }
  const jwtParts = key.split(".")
  if (jwtParts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(jwtParts[1], "base64url").toString("utf8")) as { role?: string }
      if (payload.role !== "service_role") {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY does not contain the service_role credential")
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("service_role")) throw error
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a valid service-role credential")
    }
  } else if (!key.startsWith("sb_secret_")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a recognized server credential")
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
