"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import Link from "next/link"
import { CheckCircle, AlertCircle } from "lucide-react"

function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    establishSession()
  }, [])

  const establishSession = async () => {
    const supabase = createClient()

    // Try the modern token_hash + type flow first
    const tokenHash = searchParams.get("token_hash")
    const type = searchParams.get("type")

    if (tokenHash && type) {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "invite" | "recovery" | "email",
      })
      if (verifyErr) {
        setError("This link is invalid or has expired. Request a new one.")
        setLoading(false)
        return
      }
      setSessionReady(true)
      setLoading(false)
      return
    }

    // Fallback: the legacy hash-fragment flow (#access_token=...)
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    if (hash) {
      const params = new URLSearchParams(hash.replace(/^#/, ""))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      if (accessToken && refreshToken) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!sessionErr) {
          setSessionReady(true)
          setLoading(false)
          return
        }
      }
    }

    // Last resort: maybe they're already logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setSessionReady(true)
      setLoading(false)
      return
    }

    setError("This link is invalid or has expired. Request a new one.")
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (updateErr) {
      setError(updateErr.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push("/onboarding"), 1500)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] text-white">
        <div className="text-gray-400">Verifying your invite link...</div>
      </div>
    )
  }

  if (error && !sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-bold">Link expired or invalid</h1>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">Password set!</h1>
          <p className="text-sm text-gray-400">Taking you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508] p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8 flex flex-col items-center">
          <CodyzaLogo size={56} withGlow />
          <h1 className="mt-4 text-2xl font-bold">Set your password</h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Choose a strong password. You'll use this to log in any time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-type your password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Setting password..." : "Set password & log in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Back to Codyza
        </Link>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#050508] text-white">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  )
}
