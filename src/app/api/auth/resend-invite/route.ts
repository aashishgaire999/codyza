import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { consumeRateLimit } from "@/lib/security"

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

    const { data: approvedApplication } = await service
      .from("applications")
      .select("id")
      .ilike("email", email)
      .eq("status", "approved")
      .maybeSingle()

    if (!approvedApplication) {
      return NextResponse.json({ error: "This email isn't registered." }, { status: 404 })
    }

    const { data: userList, error: listError } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) {
      console.error("resend-invite: could not list users", listError)
      return NextResponse.json({ error: "Could not send a new link. Please try again shortly." }, { status: 500 })
    }
    const existingUser = userList.users.find((user) => user.email?.toLowerCase() === email)

    if (existingUser?.confirmed_at) {
      return NextResponse.json(
        { error: "This account is already set up. Sign in at /login, or use \"email me a login link\" there." },
        { status: 409 },
      )
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "")
    const { error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
    })

    if (inviteError) {
      console.error("resend-invite: invite failed", inviteError)
      return NextResponse.json({ error: "Could not send a new link. Please try again shortly." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("resend-invite error", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
