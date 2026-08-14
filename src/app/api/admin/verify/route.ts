import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { ADMIN_COOKIE, createAdminSessionToken } from "@/lib/admin-auth"
import { consumeRateLimit } from "@/lib/security"

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(req, "admin-verify", 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
      )
    }

    const { accessCode } = await req.json()

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const expected = process.env.ADMIN_ACCESS_CODE

    if (!expected) {
      console.error("ADMIN_ACCESS_CODE env var not set")
      return NextResponse.json({ valid: false, error: "Server misconfigured" }, { status: 500 })
    }

    const suppliedBuffer = Buffer.from(accessCode)
    const expectedBuffer = Buffer.from(expected)
    if (suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      const response = NextResponse.json({ valid: true })
      response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      })
      response.headers.set("Cache-Control", "no-store")
      return response
    }
    return NextResponse.json({ valid: false }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
