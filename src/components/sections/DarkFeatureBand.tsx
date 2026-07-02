"use client"

import * as React from "react"
import { ArrowRight, Ticket, ScanLine, IndianRupee, BarChart3 } from "lucide-react"
import { motion, useInView } from "framer-motion"

const capabilities = [
  {
    id: "cap-1",
    icon: Ticket,
    iconColor: "#4FC3F7",
    tag: "Ticketing",
    title: "Multi-Tier Ticket Passes",
    body: "Design Regular, VIP, Early Bird, Student, and Free passes — each with independent pricing, quotas, visibility settings, and sale windows.",
    accent: "rgba(79,195,247,0.15)",
    border: "rgba(79,195,247,0.25)",
    glow: "rgba(79,195,247,0.12)",
  },
  {
    id: "cap-2",
    icon: ScanLine,
    iconColor: "#60A5FA",
    tag: "Gate Management",
    title: "Live Gate Scan System",
    body: "Real-time QR scan logs, instant check-in validation, and gate coordinator dashboards — handle thousands of attendees without a queue.",
    accent: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.25)",
    glow: "rgba(96,165,250,0.12)",
  },
  {
    id: "cap-3",
    icon: IndianRupee,
    iconColor: "#34D399",
    tag: "Payments",
    title: "Instant INR Payouts",
    body: "Accept Indian Rupees with 0% platform cuts. Get direct payout settlements so your club receives funds immediately after each transaction.",
    accent: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.25)",
    glow: "rgba(52,211,153,0.12)",
  },
  {
    id: "cap-4",
    icon: BarChart3,
    iconColor: "#F472B6",
    tag: "Analytics",
    title: "Real-Time Analytics",
    body: "Track attendance, revenue, check-in rates, and category performance with live dashboard metrics and month-over-month growth insights.",
    accent: "rgba(244,114,182,0.15)",
    border: "rgba(244,114,182,0.25)",
    glow: "rgba(244,114,182,0.12)",
  },
]

function CapabilityCard({ cap, index }: { cap: typeof capabilities[0]; index: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const Icon = cap.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col p-7 cursor-default"
      style={{
        background: "rgba(255,255,255,0.035)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden"
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "rgba(255,255,255,0.07)"
        el.style.borderColor = cap.border
        el.style.transform = "translateY(-6px)"
        el.style.boxShadow = `0 24px 60px -8px ${cap.glow}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "rgba(255,255,255,0.035)"
        el.style.borderColor = "rgba(255,255,255,0.08)"
        el.style.transform = "translateY(0)"
        el.style.boxShadow = "none"
      }}
    >
      {/* Corner glow accent */}
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${cap.glow} 0%, transparent 70%)`, filter: "blur(20px)" }}
      />

      {/* Tag */}
      <span
        className="text-[10px] font-bold uppercase tracking-[0.12em] mb-5 inline-block px-3 py-1 rounded-full"
        style={{ background: cap.accent, color: cap.iconColor, border: `1px solid ${cap.border}` }}
      >
        {cap.tag}
      </span>

      {/* Icon circle */}
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
        style={{
          background: cap.accent,
          border: `1px solid ${cap.border}`,
          boxShadow: `0 0 0 0 ${cap.glow}`,
        }}
      >
        <Icon className="h-6 w-6" style={{ color: cap.iconColor }} strokeWidth={1.8} />
      </div>

      {/* Divider */}
      <div
        className="mb-5 transition-all duration-500"
        style={{
          height: "1px",
          background: `linear-gradient(90deg, ${cap.border} 0%, transparent 100%)`
        }}
      />

      <h3
        className="text-lg font-bold mb-3"
        style={{ color: "#ffffff", letterSpacing: "-0.03em" }}
      >
        {cap.title}
      </h3>
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}
      >
        {cap.body}
      </p>

      <button
        className="flex items-center gap-1.5 text-xs font-bold mt-6 group/btn transition-all duration-300"
        style={{ color: cap.iconColor, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <span className="link-underline-anim">Learn more</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </motion.div>
  )
}

export function DarkFeatureBand() {
  const headerRef = React.useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" })

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ background: "linear-gradient(180deg, #040D1A 0%, #081A33 50%, #06101F 100%)" }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(30,136,229,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,195,247,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      {/* Ghost watermark */}
      <div
        className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(80px, 14vw, 220px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "rgba(255,255,255,0.015)",
          lineHeight: 1,
          paddingLeft: "24px"
        }}
      >
        PLATFORM
      </div>

      {/* Orbital arc SVG */}
      <svg
        className="absolute top-0 right-0 pointer-events-none opacity-40"
        width="500" height="500" viewBox="0 0 400 400" fill="none"
        aria-hidden="true"
      >
        <circle cx="400" cy="0" r="280" stroke="#1E88E5" strokeWidth="0.5" fill="none" opacity="0.15" />
        <circle cx="400" cy="0" r="190" stroke="#4FC3F7" strokeWidth="0.5" fill="none" opacity="0.10" />
        <circle cx="400" cy="0" r="120" stroke="#4FC3F7" strokeWidth="0.5" fill="none" opacity="0.07" />
      </svg>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-16"
        >
          <span
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] mb-5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(30,136,229,0.12)",
              border: "1px solid rgba(30,136,229,0.25)",
              color: "#4FC3F7"
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Platform Capabilities
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight"
            style={{ color: "#ffffff", letterSpacing: "-0.04em" }}
          >
            Built for clubs that{" "}
            <span className="gradient-text-animated">move fast.</span>
          </h2>
          <p
            className="mt-5 max-w-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", letterSpacing: "-0.01em" }}
          >
            Every feature RotaSphere ships is designed around what Rotaract clubs actually need — 
            from a 5-person service project to a 2,000-person district assembly.
          </p>
        </motion.div>

        {/* 2×2 capability grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, i) => (
            <CapabilityCard key={cap.id} cap={cap} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
