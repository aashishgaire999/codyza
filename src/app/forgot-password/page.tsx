"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { AuthLayout } from "@/components/shared/auth-layout"

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
    if (resetErr) { setError(resetErr.message); return }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="check your email" subtitle={`If ${email} is on file, a reset link is on its way.`}>
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--journal-sage)]" />
        <Link href="/login" className="journal-btn-primary mt-4 block text-center">back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="reset password" subtitle="We'll send a link. No drama.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="journal-label mb-2 block">email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="journal-input" placeholder="you@domain.com" />
        </div>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <button type="submit" disabled={submitting} className="journal-btn-primary disabled:cursor-not-allowed">
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  )
}
