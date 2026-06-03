"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [nextCodyzaId, setNextCodyzaId] = useState<string>("CZX-XXXX")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      router.push("/login")
      return
    }

    setEmail(user.email)

    // Check if they already have a profile -> skip to /member
    const { data: existing } = await supabase
      .from("contributors")
      .select("codyza_id")
      .eq("email", user.email)
      .maybeSingle()

    if (existing) {
      router.replace("/member")
      return
    }

    // Pick a random preview ID 1-999 that isn't taken (just for display — server makes the real assignment)
    const { data: existingRows } = await supabase
      .from("contributors")
      .select("codyza_id")

    const takenNumbers = new Set<number>()
    for (const row of existingRows || []) {
      const match = row.codyza_id?.match(/CZX-(\d+)/)
      if (match) takenNumbers.add(parseInt(match[1], 10))
    }

    let previewNumber = 1
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = Math.floor(Math.random() * 999) + 1
      if (!takenNumbers.has(candidate)) {
        previewNumber = candidate
        break
      }
    }

    setNextCodyzaId(`CZX-${String(previewNumber).padStart(4, "0")}`)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create profile")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/member"), 1500)
    } catch {
      setError("Network error. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] text-white">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">You're in.</h1>
          <p className="text-sm text-gray-400">Taking you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508] p-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <CodyzaLogo size={56} withGlow />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="mb-6 text-center">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">Welcome aboard.</h1>
            <p className="mt-1 text-sm text-gray-400">One last step &mdash; what should we call you?</p>
          </div>

          {/* CZX-XXXX preview card */}
          <div className="mb-6 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Your Contributor ID</div>
                <div className="mt-1 font-mono text-xl font-bold tracking-wider text-white">
                  CZX-<span className="text-gradient-codyza">{nextCodyzaId.replace("CZX-", "")}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Rank</div>
                <div className="mt-1 text-sm font-medium text-zinc-300">Apprentice</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Your full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Ada Lovelace"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              <div className="mt-1.5 text-xs text-zinc-500">
                This is how others will see you in the contributors list and on your public profile.
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email <span className="text-xs font-normal text-zinc-600">(can't be changed)</span>
              </label>
              <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-mono text-sm text-zinc-500">
                {email}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || name.trim().length < 2}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Setting up your profile..." : "Complete setup →"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-zinc-600">
            Takes you to your member dashboard
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 transition-colors hover:text-white"
        >
          ← Back to Codyza
        </Link>
      </div>
    </div>
  )
}
