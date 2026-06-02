"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Star, Ticket, Users, Scan, CheckCircle2, TrendingUp, Zap } from "lucide-react"
import { AuroraBackground } from "@/components/ui/aurora-background"

interface HeroProps {
  onCreateEventClick: () => void;
}

export function Hero({ onCreateEventClick }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  }
  const itemVariants = {
    hidden: { y: 32, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 90, damping: 18 }
    }
  }

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  ]

  const [scanCount, setScanCount] = React.useState(142)
  React.useEffect(() => {
    const t = setInterval(() => {
      setScanCount(c => c + Math.floor(Math.random() * 2))
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <AuroraBackground
      className="!h-auto !bg-transparent !text-inherit"
      showRadialGradient={true}
    >
    <section
      className="relative flex flex-col items-center justify-center pt-32 pb-0 overflow-hidden w-full"
      style={{ background: "transparent" }}
    >
      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute top-[8%] left-[2%] pointer-events-none select-none"
        aria-hidden="true"
        style={{ color: "rgba(23, 23, 28, 0.012)" }}
      >
        ROTASPHERE
      </div>

      {/* Subtle atmospheric blobs */}
      <div className="absolute top-1/3 right-[5%] h-[480px] w-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,119,89,0.04) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[15%] left-[3%] h-[360px] w-[360px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(23,23,28,0.02) 0%, transparent 70%)" }} />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none" />

      {/* ─── Editorial Center Column ─── */}
      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl w-full">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center w-full"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="eyebrow-accent">Host the Extraordinary</span>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-[68px] font-medium leading-[1.03] mb-6"
              style={{ letterSpacing: "-0.025em", color: "var(--foreground)" }}
            >
              Where Moments
              <br />
              <span style={{ color: "var(--accent)" }}>Become</span> Memories
            </motion.h1>

            {/* Body copy */}
            <motion.p
              variants={itemVariants}
              className="font-weight-450 text-base leading-[1.6] max-w-xl mb-10 text-center"
              style={{ color: "var(--body-muted)", fontSize: "17px" }}
            >
              RotaSphere is the premium event management platform built for Rotaract service drives,
              professional webinars, fundraisers, and community fellowships. Seamless ticketing,
              beautiful pages, real-time analytics.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 mb-12"
            >
              <button
                onClick={onCreateEventClick}
                className="flex items-center gap-2 font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: "#17171c",
                  color: "#ffffff",
                  borderRadius: "32px",
                  padding: "13px 30px",
                  fontSize: "15px",
                  letterSpacing: "-0.02em",
                  border: "1px solid #17171c"
                }}
              >
                Create Event
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#events"
                className="flex items-center gap-2 font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "transparent",
                  color: "#17171c",
                  borderRadius: "32px",
                  padding: "13px 30px",
                  fontSize: "15px",
                  letterSpacing: "-0.02em",
                  border: "1px solid #d9d9dd",
                  textDecoration: "none"
                }}
              >
                Explore Events
              </a>
            </motion.div>

            {/* Social Proof Row */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-5 pt-6 w-full max-w-md mb-20"
              style={{ borderTop: "1px solid #d9d9dd" }}
            >
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover"
                    style={{ border: "2px solid #ffffff" }}
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  ))}
                  <span className="text-xs font-bold ml-1" style={{ color: "#17171c" }}>4.9/5</span>
                </div>
                <p className="text-xs font-weight-450" style={{ color: "#616161" }}>
                  Trusted by 10,000+ event creators globally
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Two-Card Media Composition ─── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full max-w-6xl mx-auto pb-0"
        >
          {/* ── Left: Agent Console Card (3/5 width) ── */}
          <div
            className="lg:col-span-3 relative flex flex-col overflow-hidden"
            style={{
              background: "#17171c",
              borderRadius: "22px 22px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              padding: "28px 28px 0",
              minHeight: "340px"
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1"
                  style={{ color: "#ff7759" }}
                >
                  Live Dashboard
                </span>
                <span
                  className="font-medium text-sm"
                  style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
                >
                  District Assembly 2026
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>Live</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Users, label: "Registered", value: "1,248", sub: "+24 today" },
                { icon: Scan, label: "Checked In", value: String(scanCount), sub: "of 1,248" },
                { icon: Ticket, label: "Revenue", value: "₹2.4L", sub: "100% target" }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-3 flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px"
                  }}
                >
                  <stat.icon className="h-4 w-4 mb-2" style={{ color: "#ff7759" }} />
                  <span className="text-lg font-medium" style={{ color: "#ffffff", letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.label}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: "#ff7759" }}>{stat.sub}</span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] mb-2">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Gate Check-in Progress</span>
                <span style={{ color: "#ff7759" }}>{Math.round((scanCount / 1248) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((scanCount / 1248) * 100)}%`, background: "#ff7759" }}
                />
              </div>
            </div>

            {/* Recent scans */}
            <div className="space-y-2">
              {[
                { name: "Priya Menon", ticket: "ROTASM-4821", status: "Checked In" },
                { name: "Arjun Rajan", ticket: "ROTASM-4820", status: "Checked In" },
                { name: "Nisha Pillai", ticket: "ROTASM-4819", status: "Checked In" },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div>
                    <span className="text-xs font-medium block" style={{ color: "#ffffff" }}>{entry.name}</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{entry.ticket}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />
                    <span className="text-[10px]" style={{ color: "#4ade80" }}>{entry.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Hero Photo Card (2/5 width) ── */}
          <div
            className="lg:col-span-2 relative overflow-hidden flex flex-col"
            style={{
              background: "#eeece7",
              borderRadius: "22px 22px 0 0",
              border: "1px solid #d9d9dd",
              borderBottom: "none",
              minHeight: "340px"
            }}
          >
            {/* Photo */}
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: "220px" }}>
              <img
                src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=700&auto=format&fit=crop&q=80"
                alt="Rotaract community event"
                className="w-full h-full object-cover"
                style={{ borderRadius: "20px 20px 0 0" }}
              />
              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(238,236,231,1) 0%, transparent 60%)" }}
              />
            </div>

            {/* Caption block */}
            <div className="p-6 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] block mb-1" style={{ color: "#ff7759" }}>
                    Community Service
                  </span>
                  <p className="font-medium text-sm leading-snug" style={{ color: "#17171c", letterSpacing: "-0.01em" }}>
                    Club fellowship & tree planting drive, Calicut North
                  </p>
                </div>
                <div
                  className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ background: "#17171c" }}
                >
                  <TrendingUp className="h-4 w-4" style={{ color: "#ff7759" }} />
                </div>
              </div>

              {/* Mini stat */}
              <div
                className="mt-4 flex items-center gap-3 py-2.5 px-3"
                style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #d9d9dd" }}
              >
                <Zap className="h-4 w-4 shrink-0" style={{ color: "#ff7759" }} />
                <span className="text-xs" style={{ color: "#616161" }}>
                  <strong style={{ color: "#17171c" }}>342 members</strong> participated across 6 clubs
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </AuroraBackground>
  )
}
