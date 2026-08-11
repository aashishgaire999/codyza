import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { ADMIN_COOKIE, createAdminSessionToken } from "@/lib/admin-auth"

export async function POST(req: Request) {
  try {
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
      return response
    }
    return NextResponse.json({ valid: false })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
