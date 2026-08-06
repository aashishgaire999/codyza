"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
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

  const establishSession = useCallback(async () => {
    const supabase = createClient()

    const code = searchParams.get("code")
    const tokenHash = searchParams.get("token_hash")
    const type = searchParams.get("type")

    if (code) {
      const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
      if (codeErr) {
        setError("This link is invalid or has expired. Request a new one.")
        setLoading(false)
        return
      }
      setSessionReady(true)
      setLoading(false)
      return
    }

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
  }, [searchParams])

  useEffect(() => {
    void establishSession()
  }, [establishSession])

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
      <AuthLayout title="verifying link" subtitle="Hang on — checking your invite.">
        <p className="sofi-body text-center text-black/50">This usually takes a second.</p>
      </AuthLayout>
    )
  }

  if (error && !sessionReady) {
    return (
      <AuthLayout title="link expired" subtitle="Used already, or too old. Either works.">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <p className="sofi-body mb-4 text-center text-black/55">
          Drop your email below and we&apos;ll send a fresh one.
        </p>

        {requested ? (
          <div className="rounded-lg border border-[var(--journal-sage)]/30 bg-[var(--journal-sage)]/10 p-4 text-center text-sm text-[var(--journal-sage)]">
            Check your inbox — new link sent.
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              placeholder="you@domain.com"
              className="journal-input"
            />
            <button
              onClick={handleRequestNewLink}
              disabled={requesting || !requestEmail}
              className="journal-btn-primary disabled:cursor-not-allowed"
            >
              {requesting ? "Sending..." : "Send new link"}
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 text-center">
          <p className="text-xs text-black/45">
            Already set a password?{" "}
            <Link href="/login" className="text-[var(--journal-sage)] hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout title="you're in" subtitle="Setting up your profile next…">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[var(--journal-sage)]" />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="pick a password" subtitle="8+ characters. You'll use this to sign in.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="journal-label mb-2 block">new password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="at least 8 characters"
            className="journal-input"
          />
        </div>

        <div>
          <label className="journal-label mb-2 block">confirm</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="same again"
            className="journal-input"
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
          className="journal-btn-primary disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save & continue"}
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
