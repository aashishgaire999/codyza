"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CheckCircle, AlertCircle, Camera, X, Check } from "lucide-react"
import Link from "next/link"
import Cropper from "react-easy-crop"

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

  // Avatar state
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

      // Upload avatar if selected
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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center text-white bg-background">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  if (success) return (
    <div className="flex min-h-screen items-center justify-center p-4 text-white bg-background">
      <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(24px)"}}>
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-2xl font-bold">You're in.</h1>
        <p className="text-sm text-gray-400">Taking you to your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-white bg-background">

      {/* Crop Modal */}
      {showCropper && cropSrc && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#0f0c1a",border:"1px solid rgba(139,92,246,0.3)",borderRadius:20,padding:24,width:"min(480px,95vw)"}}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#f8fafc",marginBottom:16,textAlign:"center"}}>Adjust your photo</h3>
            <div style={{position:"relative",width:"100%",height:280,borderRadius:12,overflow:"hidden",background:"#000"}}>
              <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>
            </div>
            <div style={{marginTop:14,padding:"0 8px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Zoom</span>
                <span style={{fontSize:11,color:"#a78bfa"}}>{Math.round(zoom*100)}%</span>
              </div>
              <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{width:"100%",accentColor:"#8b5cf6"}}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>{setShowCropper(false);setCropSrc(null)}} style={{flex:1,padding:"10px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13}}>
                <X className="w-4 h-4"/> Cancel
              </button>
              <button onClick={handleCropConfirm} style={{flex:2,padding:"10px",borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:600}}>
                <Check className="w-4 h-4"/> Use this photo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <CodyzaLogo size={56} withGlow />
        </div>

        <div className="rounded-2xl p-8" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(24px)"}}>
          <div className="mb-6 text-center">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">Welcome aboard.</h1>
            <p className="mt-1 text-sm text-gray-400">Set up your profile to get started.</p>
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative cursor-pointer group mb-3" onClick={() => fileRef.current?.click()}>
              <div style={{width:88,height:88,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(139,92,246,0.35)",background:"linear-gradient(135deg,#8b5cf6,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <Camera className="w-8 h-8 text-white opacity-80"/>
                }
              </div>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.2s"}} className="group-hover:opacity-100">
                <Camera className="w-5 h-5 text-white"/>
              </div>
            </div>
            <p className="text-xs text-gray-500">{avatarPreview ? "Click to change photo" : "Add a profile photo (optional)"}</p>
            {avatarPreview && (
              <button onClick={() => { setAvatarPreview(null); setCroppedBlob(null) }} className="mt-1 text-xs text-red-400 hover:text-red-300">Remove</button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect}/>
          </div>

          {/* CZX ID preview */}
          <div className="mb-6 rounded-xl px-5 py-4" style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.2)"}}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Your Contributor ID</div>
                <div className="mt-1 font-mono text-xl font-bold tracking-wider text-white">
                  CZX-<span className="text-gradient-codyza">{nextCodyzaId.replace("CZX-", "")}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Rank</div>
                <div className="mt-1 text-sm font-medium text-zinc-300">Apprentice</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Your full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} placeholder="Ada Lovelace"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"/>
              <div className="mt-1.5 text-xs text-zinc-500">This is how others will see you on your public profile.</div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email <span className="text-xs font-normal text-zinc-600">(can't be changed)</span></label>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-mono text-sm text-zinc-500">{email}</div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0"/><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={submitting || name.trim().length < 2}
              className="w-full rounded-xl px-4 py-3 font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)",boxShadow:"0 8px 32px rgba(124,58,237,0.3)"}}>
              {submitting ? "Setting up your profile..." : "Complete setup →"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-zinc-600">Takes you to your member dashboard</p>
        </div>

        <Link href="/" className="mt-6 block text-center text-sm text-gray-500 transition-colors hover:text-white">← Back to Codyza</Link>
      </div>
    </div>
  )
}
