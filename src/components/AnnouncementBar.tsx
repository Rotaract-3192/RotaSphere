"use client"

import * as React from "react"
import { X } from "lucide-react"

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem("rotasphere_announcement_dismissed")
      if (isDismissed === "true") {
        setIsVisible(false)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rotasphere_announcement_dismissed", "true")
    }
  }

  if (!isVisible) return null

  return (
    <div
      className="w-full flex items-center justify-between px-6 bg-black text-white relative z-50 overflow-hidden"
      style={{ height: "36px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex-1 flex justify-center items-center">
        <span
          className="text-center font-mono select-none"
          style={{
            fontSize: "12px",
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 400
          }}
        >
          Rotaract District Assembly 2026 registrations are now open!{" "}
          <a
            href="/events"
            className="underline ml-1.5 transition-colors"
            style={{ color: "#ff7759", textDecoration: "underline" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ff7759"}
          >
            Learn more
          </a>
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="h-6 w-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 shrink-0 text-white/60 hover:text-white cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
