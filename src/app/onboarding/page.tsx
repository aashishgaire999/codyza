"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Camera, X, Check } from "lucide-react"
import Link from "next/link"
import Cropper from "react-easy-crop"
import { PublicShell } from "@/components/shared/public-shell"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { FadeIn } from "@/components/motion/fade-in"

async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  const image = new Image()
  image.src = imageSrc
  await new Promise(resolve => { image.onload = resolve })
  const canvas = document.createElement("canvas")
  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.92))
}

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [nextCodyzaId, setNextCodyzaId] = useState<string>("CZX-XXXX")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels)
  }, [])

  useEffect(() => { init() }, [])

  const init = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) { router.push("/login"); return }
    setEmail(user.email)
    const { data: existing } = await supabase.from("contributors").select("codyza_id").eq("email", user.email).maybeSingle()
    if (existing) { router.replace("/member"); return }
    const { data: existingRows } = await supabase.from("contributors").select("codyza_id")
    const takenNumbers = new Set<number>()
    for (const row of existingRows || []) {
      const match = row.codyza_id?.match(/CZX-(\d+)/)
      if (match) takenNumbers.add(parseInt(match[1], 10))
    }
    let previewNumber = 1
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = Math.floor(Math.random() * 999) + 1
      if (!takenNumbers.has(candidate)) { previewNumber = candidate; break }
    }
    setNextCodyzaId(`CZX-${String(previewNumber).padStart(4, "0")}`)
    setLoading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Only JPG, PNG, or WebP allowed"); return }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return }
    setError("")
    const reader = new FileReader()
    reader.onload = (e) => { setCropSrc(e.target?.result as string); setShowCropper(true); setCrop({ x: 0, y: 0 }); setZoom(1) }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return
    const blob = await getCroppedImg(cropSrc, croppedAreaPixels)
    setCroppedBlob(blob)
    setAvatarPreview(URL.createObjectURL(blob))
    setShowCropper(false)
    setCropSrc(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (name.trim().length < 2) { setError("Please enter your full name (at least 2 characters)"); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to create profile"); setSubmitting(false); return }

      if (croppedBlob && data.codyza_id) {
        const file = new File([croppedBlob], `${data.codyza_id}.jpg`, { type: "image/jpeg" })
        const formData = new FormData()
        formData.append("file", file)
        formData.append("codyza_id", data.codyza_id)
        await fetch("/api/avatar", { method: "POST", body: formData })
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
      <PublicShell footer={false}>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <p className="sofi-body text-black/50">loading...</p>
        </div>
      </PublicShell>
    )
  }

  if (success) {
    return (
      <PublicShell footer={false}>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-24">
          <FadeIn className="auth-journal-card w-full max-w-md text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
            <h1 className="sofi-display-section text-black">you&apos;re in.</h1>
            <p className="sofi-body mt-2">Taking you to your dashboard...</p>
          </FadeIn>
        </div>
      </PublicShell>
    )
  }

  return (
    <PublicShell footer={false}>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-24">
      {showCropper && cropSrc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="surface-card w-[min(480px,95vw)] p-6">
            <h3 className="mb-4 text-center font-[family-name:var(--font-heading)] text-base font-semibold lowercase">
              adjust your photo
            </h3>
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-muted">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4 px-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Zoom</span>
                <span className="font-mono text-[10px] text-accent">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowCropper(false); setCropSrc(null) }}
                className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="btn-primary flex flex-[2] items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium"
              >
                <Check className="h-4 w-4" /> Use this photo
              </button>
            </div>
          </div>
        </div>
      )}

      <FadeIn className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <CodyzaLogo size={48} variant="full" />
          </Link>
          <h1 className="sofi-display-section mt-6 text-black">last step.</h1>
          <p className="sofi-body mt-3">Name and photo. That&apos;s it for now.</p>
        </div>

        <div className="auth-journal-card">

          <div className="mb-6 flex flex-col items-center">
            <div className="group relative mb-3 cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {avatarPreview ? "Click to change photo" : "Add a profile photo (optional)"}
            </p>
            {avatarPreview && (
              <button
                onClick={() => { setAvatarPreview(null); setCroppedBlob(null) }}
                className="mt-1 text-xs text-destructive hover:opacity-80"
              >
                Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
          </div>

          <div className="mb-6 rounded-xl border border-black/10 bg-black/[0.03] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="sofi-micro">your contributor id</div>
                <div className="mt-1 font-mono text-xl font-bold tracking-wider text-black">
                  CZX-<span className="text-accent">{nextCodyzaId.replace("CZX-", "")}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="sofi-micro">rank</div>
                <div className="mt-1 text-sm font-medium text-black">Apprentice</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm">Your full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Ada Lovelace"
                className="journal-input"
              />
              <p className="mt-1.5 text-xs text-black/45">
                Shown on your profile and the leaderboard.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm">
                Email <span className="text-xs font-normal text-muted-foreground">(can&apos;t be changed)</span>
              </label>
              <div className="journal-input px-4 py-3 font-mono text-sm text-black/45">{email}</div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || name.trim().length < 2}
              className="journal-btn-primary disabled:cursor-not-allowed"
            >
              {submitting ? "Setting up..." : "Finish setup →"}
            </button>
          </form>
          <p className="sofi-body mt-5 text-center text-black/45">Then straight to your hub.</p>
        </div>

        <Link href="/" className="sofi-body mt-6 block text-center text-black/50 hover:text-black">
          ← back to codyza
        </Link>
      </FadeIn>
      </div>
    </PublicShell>
  )
}
