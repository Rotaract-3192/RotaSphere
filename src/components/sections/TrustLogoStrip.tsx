"use client"

import * as React from "react"

const logos = [
  {
    name: "Rotary International",
    svg: (
      <svg viewBox="0 0 120 40" fill="none" className="h-7 w-auto">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="2" />
        <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
        <text x="46" y="15" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor">Rotary</text>
        <text x="46" y="28" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">International</text>
      </svg>
    )
  },
  {
    name: "Rotaract District 3201",
    svg: (
      <svg viewBox="0 0 110 40" fill="none" className="h-7 w-auto">
        <rect x="2" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <path d="M8 20h12M14 14v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="34" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="currentColor">Rotaract</text>
        <text x="34" y="29" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">District 3201</text>
      </svg>
    )
  },
  {
    name: "Rotaract District 3190",
    svg: (
      <svg viewBox="0 0 110 40" fill="none" className="h-7 w-auto">
        <polygon points="14,4 26,12 26,28 14,36 2,28 2,12" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <circle cx="14" cy="20" r="4" fill="currentColor" />
        <text x="34" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="currentColor">Rotaract</text>
        <text x="34" y="29" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">District 3190</text>
      </svg>
    )
  },
  {
    name: "Rotaract District 3010",
    svg: (
      <svg viewBox="0 0 110 40" fill="none" className="h-7 w-auto">
        <path d="M14 4 L26 14 L22 34 L6 34 L2 14 Z" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <path d="M10 20 L14 14 L18 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <text x="34" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="currentColor">Rotaract</text>
        <text x="34" y="29" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">District 3010</text>
      </svg>
    )
  },
  {
    name: "Rotaract District 3232",
    svg: (
      <svg viewBox="0 0 110 40" fill="none" className="h-7 w-auto">
        <ellipse cx="14" cy="20" rx="12" ry="16" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <ellipse cx="14" cy="20" rx="6" ry="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="34" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="currentColor">Rotaract</text>
        <text x="34" y="29" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">District 3232</text>
      </svg>
    )
  },
  {
    name: "Rotaract Club Network",
    svg: (
      <svg viewBox="0 0 120 40" fill="none" className="h-7 w-auto">
        <circle cx="8" cy="20" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="22" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="22" cy="28" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="13" y1="18" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" />
        <line x1="13" y1="22" x2="17" y2="26" stroke="currentColor" strokeWidth="1.5" />
        <text x="34" y="16" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="currentColor">Club</text>
        <text x="34" y="29" fontFamily="sans-serif" fontSize="9" fontWeight="400" fill="currentColor">Network</text>
      </svg>
    )
  }
]

export function TrustLogoStrip() {
  return (
    <section
      className="relative py-10 sm:py-14 overflow-hidden"
      style={{ background: "#ffffff", borderTop: "1px solid #d9d9dd", borderBottom: "1px solid #d9d9dd" }}
    >
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">

        {/* Label */}
        <p
          className="text-center font-mono text-[11px] font-bold uppercase mb-10 tracking-[0.14em]"
          style={{ color: "#93939f" }}
        >
          Trusted by Districts and Clubs Worldwide
        </p>

        {/* Logo Row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="transition-opacity duration-200 hover:opacity-100"
              style={{ color: "#93939f", opacity: 0.55 }}
              title={logo.name}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.55"}
            >
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
