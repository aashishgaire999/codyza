"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import Link from "next/link"

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
      // Magic link flow — send email with one-time login link
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/set-password`,
        },
      })
      if (error) {
        setError(error.message.includes("Signups not allowed") ? "This email isn't registered. Check the address or contact team@codyza.com." : error.message)
        setLoading(false)
        return
      }
      setMagicLinkSent(true)
      setLoading(false)
      return
    }

    // Password flow
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      setError(error.message.includes("Signups not allowed") ? "This email isn't registered. Check the address or contact team@codyza.com." : error.message)
      setLoading(false)
    } else {
      router.push("/member")
      router.refresh()
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CodyzaLogo size={56} withGlow />
          <h1 className="mt-4 text-2xl font-bold">Check your inbox</h1>
          <p className="mt-3 text-sm text-gray-400">
            A login link is on its way to <span className="text-white">{email}</span>. Click it to sign in.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Tip: check spam if you don\'t see it within a minute.
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false)
              setMagicMode(false)
              setPassword("")
            }}
            className="mt-6 text-sm text-purple-400 hover:text-purple-300"
          >
            Use password instead
          </button>
          <Link href="/" className="mt-4 block text-sm text-gray-500 hover:text-white">
            ← Back to Codyza
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <CodyzaLogo size={60} withGlow />
          <h1 className="text-2xl font-bold mt-4">Member Login</h1>
          <p className="text-gray-400 text-sm mt-2">Access your Codyza member portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="your.email@example.com"
            />
          </div>

          {!magicMode && (
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!magicMode}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
          )}

          {!magicMode && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-purple-500"
                />
                Remember me for 30 days
              </label>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? (magicMode ? "Sending link..." : "Signing in...")
              : (magicMode ? "Email me a login link" : "Sign In")}
          </button>
        </form>

        {/* Toggle between password + magic link mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMagicMode(!magicMode)
              setError("")
            }}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            {magicMode ? "← Use password instead" : "Or, email me a login link instead →"}
          </button>
        </div>

        <div className="text-center mt-5">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Link href="/" className="block text-center text-gray-400 text-sm mt-4 hover:text-white transition-colors">
          ← Back to Codyza
        </Link>
      </div>
    </div>
  )
}