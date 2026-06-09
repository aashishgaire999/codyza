"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { SmartNavbar } from "@/components/shared/smart-navbar"
import { CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const supabase = createClient()
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    })

    setSubmitting(false)

    if (resetErr) {
      setError(resetErr.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
          <p className="mb-6 text-sm text-gray-400">
            If an account exists for <span className="text-white">{email}</span>, a reset link has been sent. Check spam if you don&apos;t see it within a minute.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8 flex flex-col items-center">
          <CodyzaLogo size={56} withGlow />
          <h1 className="mt-4 text-2xl font-bold">Forgot your password?</h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email and we&apos;ll send you a link to set a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
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
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
