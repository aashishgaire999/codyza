"use client"

import { useState, useRef } from "react"
import { Camera, Loader2 } from "lucide-react"

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

export function AvatarUpload({ codyzaId, currentUrl, name, onUpload, size = 72 }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, or WebP allowed")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB")
      return
    }

    setError("")
    setUploading(true)

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("codyza_id", codyzaId)

      const res = await fetch("/api/avatar", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed")
        setPreview(currentUrl || null)
      } else {
        setPreview(data.avatar_url)
        onUpload?.(data.avatar_url)
      }
    } catch {
      setError("Upload failed. Try again.")
      setPreview(currentUrl || null)
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer group"
        onClick={() => !uploading && fileRef.current?.click()}
        style={{ width: size, height: size }}
      >
        {/* Avatar circle */}
        {preview ? (
          <img
            src={preview}
            alt={name}
            style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(139,92,246,0.3)" }}
          />
        ) : (
          <div style={{
            width: size, height: size, borderRadius: "50%",
            background: getAvatarBg(codyzaId),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.3, fontWeight: 800, color: "white",
            border: "2px solid rgba(139,92,246,0.3)"
          }}>
            {getInitials(name)}
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: uploading ? 1 : 0, transition: "opacity 0.2s",
        }} className="group-hover:opacity-100">
          {uploading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <Camera className="w-5 h-5 text-white" />
          }
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-500">
        {uploading ? "Uploading..." : "Click to change photo"}
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
