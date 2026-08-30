import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { consumeRateLimit } from "@/lib/security"
import { resendOrInvite } from "@/lib/member-invites"

// The public magic-link endpoint (auth.signInWithOtp) does not correctly
// resend a link for a user who was invited but never confirmed -- Supabase
// only resends invite-type emails via the admin API. This route checks the
// user's real confirmation status server-side and picks the right action,
// which the client can never do safely since that requires the service role.
export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(req, "resend-invite", 5, 15 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
      )
    }

    const { email: rawEmail } = await req.json()
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""
    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    const service = createServiceSupabase()

    // Existing crew members (e.g. seeded founders/admins) were never added
    // through the applications table, so they'd otherwise get a misleading
    // "not registered" instead of being told they already have an account.
    const { data: existingContributor } = await service
      .from("contributors")
      .select("codyza_id")
      .ilike("email", email)
      .maybeSingle()

    if (existingContributor) {
      return NextResponse.json({ error: "This account is already set up. Sign in at /login instead." }, { status: 409 })
    }

    const { data: approvedApplication } = await service
      .from("applications")
      .select("id")
      .ilike("email", email)
      .eq("status", "approved")
      .maybeSingle()

    if (!approvedApplication) {
      return NextResponse.json({ error: "This email isn't registered." }, { status: 404 })
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "")
    const result = await resendOrInvite(service, email, siteUrl)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("resend-invite error", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
