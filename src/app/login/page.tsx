"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import Link from "next/link"
import { AuthLayout } from "@/components/shared/auth-layout"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [magicMode, setMagicMode] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("magic") === "true") setMagicMode(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()

    if (magicMode) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/set-password` },
      })
      if (error) {
        setError(error.message.includes("Signups not allowed") ? "This email isn't registered." : error.message)
        setLoading(false)
        return
      }
      setMagicLinkSent(true)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password })
    if (error) {
      setError(error.message.includes("Signups not allowed") ? "This email isn't registered." : error.message)
      setLoading(false)
    } else {
      router.push("/member")
      router.refresh()
    }
  }

  if (magicLinkSent) {
    return (
      <AuthLayout title="check your inbox" subtitle={`We sent a link to ${email}`}>
        <p className="text-center text-sm text-muted-foreground">Click the link in your email to sign in.</p>
        <button onClick={() => { setMagicLinkSent(false); setMagicMode(false) }} className="mt-4 w-full text-sm text-accent">
          Use password instead
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="member login" subtitle="Access your Codyza portal">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input w-full px-4 py-3" placeholder="your.email@example.com" />
        </div>
        {!magicMode && (
          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input w-full px-4 py-3" placeholder="••••••••" />
          </div>
        )}
        {!magicMode && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-accent" />
            Remember me
          </label>
        )}
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full rounded-full py-3 text-sm font-medium disabled:opacity-50">
          {loading ? "Signing in..." : magicMode ? "Email me a link" : "Sign in"}
        </button>
      </form>
      <div className="mt-4 space-y-2 text-center text-sm">
        <button type="button" onClick={() => { setMagicMode(!magicMode); setError("") }} className="text-muted-foreground hover:text-foreground">
          {magicMode ? "← Use password" : "Email me a login link →"}
        </button>
        <Link href="/forgot-password" className="block text-muted-foreground hover:text-foreground">Forgot password?</Link>
      </div>
    </AuthLayout>
  )
}
