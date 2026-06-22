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
      <AuthLayout title="check your email" subtitle={`If an account exists for ${email}, a reset link is on its way.`}>
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
        <Link href="/login" className="btn-primary mt-4 block rounded-full py-3 text-center text-sm">Back to login</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="forgot password?" subtitle="We'll email you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input w-full px-4 py-3" placeholder="your.email@example.com" />
        </div>
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <button type="submit" disabled={submitting} className="btn-primary w-full rounded-full py-3 text-sm disabled:opacity-50">
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  )
}
