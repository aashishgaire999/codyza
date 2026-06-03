"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StandupRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/member") }, [router])
  return null
}
