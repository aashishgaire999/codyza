"use client"

import { Suspense, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/shared/auth-layout"
import { InstallAppButton } from "@/components/shared/install-app-button"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicOverride, setMagicOverride] = useState<boolean | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const magicMode = magicOverride ?? searchParams.get("magic") === "true"
  const urlError = searchParams.get("error")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()

    if (magicMode) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/set-password` },
      })
      if (otpError) {
        setError(otpError.message.includes("Signups not allowed") ? "This email isn't registered." : otpError.message)
        setLoading(false)
        return
      }
      setMagicLinkSent(true)
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })
    if (signInError) {
      const message = signInError.message.includes("Signups not allowed")
        ? "This email isn't registered."
        : signInError.message.includes("Invalid login credentials")
          ? "Incorrect email or password. If you haven't set a password yet, use the link from your invite email, or try \"forgot password?\" below."
          : signInError.message
      setError(message)
      setLoading(false)
    } else {
      router.push("/member")
      router.refresh()
    }
  }

  if (magicLinkSent) {
    return (
      <AuthLayout title="check your inbox" subtitle={`We sent a link to ${email}`}>
        <p className="sofi-body text-center text-black/55">Open the link in your email to finish signing in.</p>
        <button
          type="button"
          onClick={() => {
            setMagicLinkSent(false)
            setMagicOverride(false)
          }}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-sm text-[var(--journal-sage)]"
        >
          use password instead
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="sign in" subtitle="Use the email we invited you with.">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="journal-label mb-2 block">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="journal-input"
            placeholder="you@domain.com"
          />
        </div>
        {!magicMode && (
          <div>
            <label className="journal-label mb-2 block">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="journal-input"
              placeholder="••••••••"
            />
          </div>
        )}
        {urlError === "link_expired" && !error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            That link has expired or already been used. Request a new one via &quot;forgot password?&quot; below.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="journal-btn-primary disabled:cursor-not-allowed">
          {loading ? "signing in..." : magicMode ? "email me a link" : "sign in"}
        </button>
      </form>
      <div className="mt-4 space-y-2 text-center text-sm">
        <button
          type="button"
          onClick={() => {
            setMagicOverride(!magicMode)
            setError("")
          }}
          className="inline-flex min-h-11 w-full items-center justify-center text-black/45 hover:text-black"
        >
          {magicMode ? "use password" : "email me a login link"}
        </button>
        <Link href="/forgot-password" className="flex min-h-11 items-center justify-center text-black/45 hover:text-black">
          forgot password?
        </Link>
        <div className="pt-2">
          <InstallAppButton />
        </div>
        {process.env.NODE_ENV === "development" && (
          <Link href="/member-preview" className="mt-4 block rounded-full border border-[var(--journal-rule)] px-4 py-2 text-[var(--journal-sage)] hover:bg-[var(--journal-sage)]/5">
            preview the member portal without signing in
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="sign in" subtitle="Use the email we invited you with.">
          <p className="sofi-body text-center text-black/45">loading…</p>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
