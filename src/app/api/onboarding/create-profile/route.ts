import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notifyAllMembers } from "@/lib/member-notifications"
import { createServiceSupabase } from "@/lib/admin-auth"

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required (at least 2 characters)" }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 })
    }

    // Get the logged-in user via cookies
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // ignore in route handlers
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const service = createServiceSupabase()

    // Check if profile already exists
    const { data: existing } = await service
      .from("contributors")
      .select("codyza_id")
      .eq("email", user.email)
      .maybeSingle()

    if (existing) {
      // Already onboarded - return their existing ID
      return NextResponse.json({ codyza_id: existing.codyza_id, alreadyExists: true })
    }

    // Having a Supabase session only proves the email was verified -- it does
    // not prove an admin approved this person. Crew membership requires an
    // approved application; without this, anyone who can obtain any Supabase
    // session (e.g. calling auth.signUp directly with the public anon key)
    // could onboard themselves regardless of invite status.
    // Case-insensitive: applicants type their email into the public form as-is
    // (not lowercased), but Supabase normalizes auth emails to lowercase.
    const { data: approvedApplication } = await service
      .from("applications")
      .select("id")
      .ilike("email", user.email)
      .eq("status", "approved")
      .maybeSingle()

    let authorized = Boolean(approvedApplication)

    if (!authorized) {
      // Supabase only sets invited_at when an account was created via the
      // admin invite API (auth.admin.inviteUserByEmail) -- whether that was
      // triggered through this app or directly in the Supabase dashboard.
      // A public self-signup via auth.signUp never sets this field, so it's
      // a safe signal that an admin explicitly vouched for this account
      // even without a matching application record.
      const { data: adminUserData } = await service.auth.admin.getUserById(user.id)
      authorized = Boolean(adminUserData?.user?.invited_at)
    }

    if (!authorized) {
      return NextResponse.json({ error: "No approved application found for this email. Apply at /join if you haven't already." }, { status: 403 })
    }

    // Get all existing CZX-XXXX numbers to avoid collisions
    const { data: existingRows } = await service
      .from("contributors")
      .select("codyza_id")

    const takenNumbers = new Set<number>()
    for (const row of existingRows || []) {
      const match = row.codyza_id?.match(/CZX-(\d+)/)
      if (match) takenNumbers.add(parseInt(match[1], 10))
    }

    // Pick a random number 1-999 that's not already taken
    let chosen: number | null = null
    const MAX_ATTEMPTS = 50
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const candidate = Math.floor(Math.random() * 999) + 1
      if (!takenNumbers.has(candidate)) {
        chosen = candidate
        break
      }
    }

    // Fallback: if random failed (range exhausted), use next sequential
    if (chosen === null) {
      let next = 1
      while (takenNumbers.has(next)) next++
      if (next > 999) {
        return NextResponse.json({ error: "ID range exhausted. Contact admin." }, { status: 500 })
      }
      chosen = next
    }

    const newCodyzaId = `CZX-${String(chosen).padStart(4, "0")}`

    // Insert the new contributor row
    const { error: insertError } = await service
      .from("contributors")
      .insert({
        codyza_id: newCodyzaId,
        name: name.trim(),
        email: user.email,
        github: "",
        role: "contributor",
        level: "beginner",
        xp: 0,
        rank: "Apprentice",
        streak: 0,
        is_admin: false,
      })

    if (insertError) {
      // Race condition: another concurrent signup took our chosen ID. Try again with a different random.
      if (insertError.code === "23505") {
        takenNumbers.add(chosen)
        let retryChosen: number | null = null
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          const candidate = Math.floor(Math.random() * 999) + 1
          if (!takenNumbers.has(candidate)) {
            retryChosen = candidate
            break
          }
        }
        if (retryChosen === null) {
          return NextResponse.json({ error: "Could not assign ID. Please try again." }, { status: 500 })
        }
        const retryId = `CZX-${String(retryChosen).padStart(4, "0")}`
        const { error: retryError } = await service
          .from("contributors")
          .insert({
            codyza_id: retryId,
            name: name.trim(),
            email: user.email,
            github: "",
            role: "contributor",
            level: "beginner",
            xp: 0,
            rank: "Apprentice",
            streak: 0,
            is_admin: false,
          })
        if (retryError) {
          console.error("Onboarding retry failed:", retryError)
          return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 })
        }
        await notifyAllMembers({ type: "new_member", message: `${name.trim()} just joined the Codyza crew.`, link: "/community", excludeCodyzaId: retryId })
        return NextResponse.json({ codyza_id: retryId })
      }
      console.error("Onboarding insert error:", insertError)
      return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 })
    }

    await notifyAllMembers({ type: "new_member", message: `${name.trim()} just joined the Codyza crew.`, link: "/community", excludeCodyzaId: newCodyzaId })
    return NextResponse.json({ codyza_id: newCodyzaId })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
