"use client"

import { useEffect, useRef } from "react"

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-up")
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}