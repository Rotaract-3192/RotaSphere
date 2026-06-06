"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

const capabilities = [
  {
    id: "cap-1",
    title: "Multi-Tier Ticket Passes",
    body: "Design Regular, VIP, Early Bird, Student, and Free passes — each with independent pricing, quotas, visibility settings, and sale windows.",
    illustration: (
      <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
        <rect x="4" y="8" width="72" height="18" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        <rect x="4" y="32" width="48" height="12" rx="3" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <rect x="4" y="50" width="32" height="8" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="60" cy="17" r="6" stroke="#4FC3F7" strokeWidth="1.2" fill="none" />
        <path d="M57 17l2 2 4-4" stroke="#4FC3F7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="38" r="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
        <text x="10" y="21" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">VIP · EARLY BIRD</text>
        <text x="10" y="43" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="monospace">REGULAR</text>
      </svg>
    )
  },
  {
    id: "cap-2",
    title: "Live Gate Scan System",
    body: "Real-time QR scan logs, instant check-in validation, and gate coordinator dashboards — handle thousands of attendees without a queue.",
    illustration: (
      <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
        <rect x="22" y="10" width="36" height="36" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <rect x="28" y="16" width="10" height="10" rx="1" stroke="#4FC3F7" strokeWidth="1" />
        <rect x="42" y="16" width="10" height="10" rx="1" stroke="#4FC3F7" strokeWidth="1" />
        <rect x="28" y="30" width="10" height="10" rx="1" stroke="#4FC3F7" strokeWidth="1" />
        <rect x="42" y="30" width="10" height="10" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="8" y1="8" x2="8" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="8" x2="18" y2="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="72" y1="8" x2="62" y2="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="72" y1="8" x2="72" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="52" x2="8" y2="42" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="52" x2="18" y2="52" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="72" y1="52" x2="62" y2="52" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="72" y1="52" x2="72" y2="42" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "cap-3",
    title: "Instant Paytm Payouts",
    body: "Accept Indian Rupees (INR) with 0% platform cuts. Get direct payout settlements to your Paytm account so clubs receive funds immediately.",
    illustration: (
      <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
        <circle cx="40" cy="30" r="20" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
        <path d="M26 30 Q33 18 40 30 Q47 42 54 30" stroke="#4FC3F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="20" y1="30" x2="60" y2="30" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="40" y1="10" x2="40" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <text x="36" y="34" fill="#4FC3F7" fontSize="13" fontFamily="sans-serif" fontWeight="bold">₹</text>
      </svg>
    )
  }
]

export function DarkFeatureBand() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A2342 0%, #06101F 100%)", padding: "80px 0" }}
    >
      {/* Ghost watermark */}
      <div
        className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(80px, 14vw, 220px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "rgba(255,255,255,0.018)",
          lineHeight: 1,
          paddingLeft: "24px"
        }}
      >
        PLATFORM
      </div>

      {/* Subtle orbital arc decoration */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width="400" height="400" viewBox="0 0 400 400" fill="none"
        aria-hidden="true"
      >
        <circle cx="400" cy="0" r="240" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.07" />
        <circle cx="400" cy="0" r="160" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.05" />
      </svg>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="eyebrow-accent mb-4 block" style={{ color: "var(--accent)" }}>
            Platform Capabilities
          </span>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight"
            style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
          >
            Built for clubs that move fast.
          </h2>
          <p
            className="mt-4 font-weight-450 max-w-lg"
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", lineHeight: "1.6" }}
          >
            Every feature RotaSphere ships is designed around what Rotaract clubs actually need — from a 5-person service project to a 2,000-person district assembly.
          </p>
        </div>

        {/* 3-column capability grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map(cap => (
            <div
              key={cap.id}
              className="group flex flex-col p-7 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
                ;(e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--accent) 35%, transparent)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
                ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"
              }}
            >
              {/* Thin-line illustration */}
              <div
                className="w-full mb-7 flex items-center justify-center"
                style={{ height: "80px" }}
              >
                {cap.illustration}
              </div>

              {/* Top rule */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "20px" }} />

              <h3
                className="text-lg font-medium mb-3"
                style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
              >
                {cap.title}
              </h3>
              <p
                className="text-sm font-weight-450 leading-relaxed flex-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {cap.body}
              </p>

              <button
                className="flex items-center gap-1.5 text-xs font-medium mt-6 transition-colors"
                style={{ color: "var(--accent)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
              >
                Learn more
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
