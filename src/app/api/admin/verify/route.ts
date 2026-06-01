import { NextResponse } from "next/server"

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

    // Constant-time comparison-ish (not perfect but better than ===)
    if (accessCode.length !== expected.length) {
      return NextResponse.json({ valid: false })
    }

    let mismatch = 0
    for (let i = 0; i < accessCode.length; i++) {
      mismatch |= accessCode.charCodeAt(i) ^ expected.charCodeAt(i)
    }

    if (mismatch === 0) {
      return NextResponse.json({ valid: true })
    }
    return NextResponse.json({ valid: false })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
