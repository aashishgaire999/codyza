"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, AlertCircle } from "lucide-react"
import { AuthLayout } from "@/components/shared/auth-layout"

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
  const [requestEmail, setRequestEmail] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    establishSession()
  }, [])

  const establishSession = async () => {
    const supabase = createClient()

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

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setSessionReady(true)
      setLoading(false)
      return
    }

    setError("This link is invalid or has expired. Request a new one.")
    setLoading(false)
  }

  const handleRequestNewLink = async () => {
    if (!requestEmail) return
    setRequesting(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email: requestEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/set-password`,
      },
    })
    setRequesting(false)
    setRequested(true)
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
      <AuthLayout title="verifying link" subtitle="Please wait a moment...">
        <p className="text-center text-sm text-muted-foreground">Verifying your invite link...</p>
      </AuthLayout>
    )
  }

  if (error && !sessionReady) {
    return (
      <AuthLayout title="link expired" subtitle="This link has already been used or expired.">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Enter your email below to request a fresh invitation link.
        </p>

        {requested ? (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
            Check your inbox — a new link is on its way.
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="glass-input w-full px-4 py-3"
            />
            <button
              onClick={handleRequestNewLink}
              disabled={requesting || !requestEmail}
              className="btn-primary w-full rounded-full py-3 text-sm disabled:opacity-50"
            >
              {requesting ? "Sending..." : "Request new invitation →"}
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            Already have a password?{" "}
            <Link href="/login" className="text-accent hover:opacity-80">
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Or go to login and use{" "}
            <Link href="/login?magic=true" className="text-accent hover:opacity-80">
              &ldquo;email me a login link instead&rdquo;
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout title="password set" subtitle="Taking you to your dashboard...">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="set your password" subtitle="Choose a strong password. You'll use this to log in any time.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="glass-input w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-type your password"
            className="glass-input w-full px-4 py-3"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full rounded-full py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Setting password..." : "Set password & log in"}
        </button>
      </form>
    </AuthLayout>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="loading" subtitle="Please wait...">
          <p className="text-center text-sm text-muted-foreground">Loading...</p>
        </AuthLayout>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
