"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
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

  return (
    <AuroraBackground
      className="!h-auto !bg-transparent !text-inherit"
      showRadialGradient={true}
    >
    <section
      className="relative flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden w-full"
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-medium leading-[1.03] mb-6"
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
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-12 w-full max-w-sm sm:max-w-none px-4 sm:px-0"
            >
              <button
                onClick={onCreateEventClick}
                className="flex items-center justify-center gap-2 font-medium w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
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
                className="flex items-center justify-center gap-2 font-medium w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5"
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
              className="flex items-center justify-center gap-5 pt-6 w-full max-w-md mb-8"
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
      </div>
    </section>
    </AuroraBackground>
  )
}
