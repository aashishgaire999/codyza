"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, Loader2, Check, X } from "lucide-react"
import Cropper from "react-easy-crop"

interface AvatarUploadProps {
  codyzaId: string
  currentUrl?: string
  name: string
  onUpload?: (url: string) => void
  size?: number
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
}

function getAvatarBg(id: string) {
  const colors = [
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
    "linear-gradient(135deg,#f97316,#ea580c)",
  ]
  return colors[parseInt(id.replace(/\D/g, "").slice(-1) || "0") % colors.length]
}

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

export function AvatarUpload({ codyzaId, currentUrl, name, onUpload, size = 72 }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState("")
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, or WebP allowed")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }

    setError("")
    const reader = new FileReader()
    reader.onload = (e) => {
      setCropSrc(e.target?.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return
    setUploading(true)
    setError("")

    try {
      const blob = await getCroppedImg(cropSrc, croppedAreaPixels)
      const file = new File([blob], `${codyzaId}.jpg`, { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("codyza_id", codyzaId)

      const res = await fetch("/api/avatar", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed")
      } else {
        setPreview(data.avatar_url)
        onUpload?.(data.avatar_url)
        setCropSrc(null)
      }
    } catch {
      setError("Upload failed. Try again.")
    }
    setUploading(false)
  }

  return (
    <>
      {/* Crop Modal */}
      {cropSrc && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "#0f0c1a", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: 24, width: "min(480px, 95vw)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 16, textAlign: "center" }}>Adjust your photo</h3>

            {/* Crop area */}
            <div style={{ position: "relative", width: "100%", height: 300, borderRadius: 12, overflow: "hidden", background: "#000" }}>
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

            {/* Zoom slider */}
            <div style={{ marginTop: 16, padding: "0 8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Zoom</span>
                <span style={{ fontSize: 11, color: "#a78bfa" }}>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range" min={1} max={3} step={0.05} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#8b5cf6" }}
              />
            </div>

            {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 8, textAlign: "center" }}>{error}</p>}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setCropSrc(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}>
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleCropConfirm} disabled={uploading}
                style={{ flex: 2, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#2563eb)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, opacity: uploading ? 0.7 : 1 }}>
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save photo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar circle */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative cursor-pointer group" onClick={() => !uploading && fileRef.current?.click()} style={{ width: size, height: size }}>
          {preview ? (
            <img src={preview} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(139,92,246,0.35)" }}/>
          ) : (
            <div style={{ width: size, height: size, borderRadius: "50%", background: getAvatarBg(codyzaId), display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 800, color: "white", border: "2px solid rgba(139,92,246,0.25)" }}>
              {getInitials(name)}
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} className="group-hover:opacity-100">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile}/>
        <p className="text-xs text-gray-500">Click to upload · Max 5MB</p>
        {error && !cropSrc && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </>
  )
}
