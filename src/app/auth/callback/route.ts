import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { safeInternalRedirect } from "@/lib/security"
import { createServiceSupabase } from "@/lib/admin-auth"
import { notifyAdmins } from "@/lib/member-notifications"

// Fires only the first time this email successfully authenticates -- lets
// admins know an invite was actually redeemed without checking the Supabase
// dashboard by hand. Routine re-logins by existing members are silent.
async function notifyIfFirstLogin(email: string | undefined) {
  if (!email) return
  try {
    const service = createServiceSupabase()
    const { data: existing } = await service
      .from("contributors")
      .select("codyza_id")
      .ilike("email", email)
      .maybeSingle()
    if (existing) return
    await notifyAdmins({
      type: "member_confirmed",
      message: `${email} just confirmed their invite and logged in for the first time.`,
      link: "/admin",
    })
  } catch (error) {
    console.error("notifyIfFirstLogin failed", error)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = safeInternalRedirect(searchParams.get("next"))

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      await notifyIfFirstLogin(user?.email)
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "invite" | "recovery" | "email",
    })
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      await notifyIfFirstLogin(user?.email)
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_expired`)
}
