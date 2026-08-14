import "server-only"
import { createHash } from "node:crypto"

type RateLimitEntry = { count: number; resetAt: number }

const rateLimitStore = globalThis as typeof globalThis & {
  __codyzaRateLimits?: Map<string, RateLimitEntry>
}

const entries = rateLimitStore.__codyzaRateLimits ?? new Map<string, RateLimitEntry>()
rateLimitStore.__codyzaRateLimits = entries

function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const address = forwarded || request.headers.get("x-real-ip") || "unknown"
  return createHash("sha256").update(address).digest("hex").slice(0, 24)
}

export function consumeRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const now = Date.now()
  const key = `${scope}:${requestFingerprint(request)}`
  const current = entries.get(key)

  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }

  current.count += 1
  return { allowed: true, retryAfter: 0 }
}

export function safeInternalRedirect(value: string | null, fallback = "/set-password") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback
  try {
    const parsed = new URL(value, "https://codyza.invalid")
    return parsed.origin === "https://codyza.invalid" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback
  } catch {
    return fallback
  }
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function safeHttpsUrl(value: unknown, options: { githubRepository?: boolean } = {}) {
  if (typeof value !== "string" || value.length > 500) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:" || url.username || url.password) return null
    const hostname = url.hostname.toLowerCase()
    if (hostname === "localhost" || hostname.endsWith(".localhost") || /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^169\.254\./.test(hostname)) return null
    if (options.githubRepository && (hostname !== "github.com" || url.pathname.split("/").filter(Boolean).length < 2)) return null
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

export function verifiedImageType(buffer: Buffer, claimedType: string) {
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isWebp = buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP"
  const isGif = buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))
  const detected = isJpeg ? "image/jpeg" : isPng ? "image/png" : isWebp ? "image/webp" : isGif ? "image/gif" : null
  return detected === claimedType ? detected : null
}
