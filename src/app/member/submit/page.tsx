"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SubmitRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/member/projects") }, [router])
  return null
}
