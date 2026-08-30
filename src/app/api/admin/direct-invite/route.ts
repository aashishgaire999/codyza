import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { resendOrInvite } from "@/lib/member-invites"

// Admins were inviting people by adding them directly in the Supabase
// dashboard, entirely outside the applications table. Those people can
// never pass the approved-application check onboarding requires, and the
// public resend endpoint can't help them either since it requires that same
// approval. This is the one correct path for "admin invites someone who
// never applied" -- it creates the approved application record and sends
// the invite in one action, so it's impossible to end up in that broken
// half-invited state again.
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
  }
  try {
    const { name: rawName, email: rawEmail } = await req.json()
    const name = typeof rawName === "string" ? rawName.trim() : ""
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Enter a name (2+ characters)" }, { status: 400 })
    }
    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    const service = createServiceSupabase()

    const { data: existingContributor } = await service
      .from("contributors")
      .select("codyza_id")
      .ilike("email", email)
      .maybeSingle()
    if (existingContributor) {
      return NextResponse.json({ error: "This email already has a crew account." }, { status: 409 })
    }

    const { data: existingApp } = await service
      .from("applications")
      .select("id, status")
      .ilike("email", email)
      .maybeSingle()

    if (existingApp) {
      if (existingApp.status !== "approved") {
        const { error: updateError } = await service.from("applications").update({ status: "approved" }).eq("id", existingApp.id)
        if (updateError) {
          console.error("direct-invite: could not approve existing application", updateError)
          return NextResponse.json({ error: "Could not update the application record." }, { status: 500 })
        }
      }
    } else {
      const { error: insertError } = await service.from("applications").insert({
        name,
        email,
        github: "",
        skills: "Added directly by admin",
        role: "fullstack",
        level: "beginner",
        why: "Invited directly by admin.",
        status: "approved",
      })
      if (insertError) {
        console.error("direct-invite: application insert failed", insertError)
        return NextResponse.json({ error: "Could not save the application record." }, { status: 500 })
      }
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "")
    const result = await resendOrInvite(service, email, siteUrl)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("direct-invite error", error)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
