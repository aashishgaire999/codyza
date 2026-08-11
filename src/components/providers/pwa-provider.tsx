"use client"

import { useEffect } from "react"

export function PwaProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Codyza app service worker could not start", error)
      })
    }

    if (document.readyState === "complete") register()
    else window.addEventListener("load", register, { once: true })

    return () => window.removeEventListener("load", register)
  }, [])

  return null
}
