import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

    // Check if profile already exists
    const { data: existing } = await supabase
      .from("contributors")
      .select("codyza_id")
      .eq("email", user.email)
      .maybeSingle()

    if (existing) {
      // Already onboarded - return their existing ID
      return NextResponse.json({ codyza_id: existing.codyza_id, alreadyExists: true })
    }

    // Get all existing CZX-XXXX numbers to avoid collisions
    const { data: existingRows } = await supabase
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
    const { error: insertError } = await supabase
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
        const { error: retryError } = await supabase
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
        return NextResponse.json({ codyza_id: retryId })
      }
      console.error("Onboarding insert error:", insertError)
      return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ codyza_id: newCodyzaId })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
