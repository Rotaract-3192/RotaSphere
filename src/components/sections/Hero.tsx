"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"

// Dynamically import shaders to avoid SSR issues with WebGL
const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.MeshGradient),
  { ssr: false }
)

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
    <section
      className="relative flex flex-col items-center justify-center pt-40 pb-32 overflow-hidden w-full min-h-[90vh]"
      style={{ color: "#ffffff" }}
    >
      {/* ─── MeshGradient Shader Background ─── */}
      {/* Base dark fallback while WebGL initializes */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(135deg, #081A33 0%, #0A2342 50%, #17458F 100%)" }}
      />

      {/* Live animated ocean mesh gradient (WebGL) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <MeshGradient
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          colors={[
            "#081A33", // Midnight Navy
            "#0A2342", // Deep Ocean Blue
            "#17458F", // Royal Blue
            "#1E88E5", // Bright Ocean Blue
            "#4FC3F7", // Highlight Aqua
          ]}
          speed={0.35}
          distortion={1.2}
          swirl={0.3}
        />
      </div>

      {/* Darkening gradient overlay to keep text readable */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(8,26,51,0.65) 0%, rgba(10,35,66,0.45) 50%, rgba(8,26,51,0.80) 100%)"
        }}
      />

      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute top-[8%] left-[2%] pointer-events-none select-none z-[2]"
        aria-hidden="true"
        style={{ color: "rgba(255, 255, 255, 0.015)" }}
      >
        EXUBERANT
      </div>

      {/* Floating Ocean Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        {[
          { left: "10%", size: "12px", delay: "0s", duration: "14s" },
          { left: "25%", size: "8px", delay: "3s", duration: "16s" },
          { left: "40%", size: "16px", delay: "1s", duration: "18s" },
          { left: "55%", size: "6px", delay: "5s", duration: "12s" },
          { left: "70%", size: "14px", delay: "2s", duration: "15s" },
          { left: "85%", size: "10px", delay: "4s", duration: "17s" },
        ].map((bubble, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full bg-sky-400/20 blur-[1px] animate-bubble-rise"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration
            }}
          />
        ))}
      </div>

      {/* Atmospheric radial glow blobs */}
      <div
        className="absolute top-1/4 right-[8%] h-[500px] w-[500px] rounded-full pointer-events-none z-[2]"
        style={{ background: "radial-gradient(circle, rgba(79,195,247,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[20%] left-[5%] h-[400px] w-[400px] rounded-full pointer-events-none z-[2]"
        style={{ background: "radial-gradient(circle, rgba(30,136,229,0.08) 0%, transparent 70%)" }}
      />

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-10 z-[2]" />

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
              <span className="eyebrow-accent" style={{ color: "var(--ocean-aqua, #4FC3F7)" }}>Rotaract District 3192</span>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.05] mb-6 text-white tracking-headlines"
            >
              Connecting Communities.
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-white bg-clip-text text-transparent">Creating</span> Impact.
            </motion.h1>

            {/* Body copy */}
            <motion.p
              variants={itemVariants}
              className="font-weight-450 text-base leading-[1.65] max-w-2xl mb-10 text-center opacity-90"
              style={{ fontSize: "17px", color: "#E0ECFB" }}
            >
              Step into the year of leadership and collaboration. RotaSphere is the premium command center 
              built for service initiatives, professional training, conferences, and fellowships. 
              Discover programs, book passes, and measure global impact.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-12 w-full max-w-sm sm:max-w-none px-4 sm:px-0"
            >
              <button
                onClick={onCreateEventClick}
                className="flex items-center justify-center gap-2 font-bold w-full sm:w-auto transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-lg hover:shadow-sky-500/30"
                style={{
                  background: "#ffffff",
                  color: "#0A2342",
                  borderRadius: "32px",
                  padding: "14px 32px",
                  fontSize: "15px",
                  letterSpacing: "-0.01em",
                  border: "none"
                }}
              >
                Create Event
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#events"
                className="flex items-center justify-center gap-2 font-bold w-full sm:w-auto transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "rgba(79, 195, 247, 0.08)",
                  color: "#ffffff",
                  borderRadius: "32px",
                  padding: "14px 32px",
                  fontSize: "15px",
                  letterSpacing: "-0.01em",
                  border: "1px solid rgba(79, 195, 247, 0.3)",
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
              style={{ borderTop: "1px solid rgba(79, 195, 247, 0.2)" }}
            >
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="User"
                    className="h-9 w-9 rounded-full object-cover border-2 border-[#0A2342]"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
                  ))}
                  <span className="text-xs font-bold ml-1 text-white">4.9/5</span>
                </div>
                <p className="text-xs font-weight-450 opacity-80" style={{ color: "#E0ECFB" }}>
                  Empowering 100+ Rotaract clubs in our District
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Layered Animated Wave Dividers at bottom of Hero */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none">
        <svg
          className="relative block w-[calc(200%+1.3px)] h-[80px] opacity-20 animate-wave-drift"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ animationDuration: "24s" }}
        >
          <path d="M0,0 C150,90 350,10 500,70 C650,130 850,50 1000,80 C1150,110 1350,30 1500,60 L1500,120 L0,120 Z" fill="var(--background)"></path>
        </svg>
        <svg
          className="relative block w-[calc(200%+1.3px)] h-[60px] opacity-40 -mt-12 animate-wave-drift"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ animationDuration: "14s", animationDirection: "reverse" }}
        >
          <path d="M0,0 C200,60 400,100 600,40 C800,100 1000,50 1200,80 C1400,110 1600,40 1800,60 L1800,120 L0,120 Z" fill="var(--background)"></path>
        </svg>
      </div>
    </section>
  )
}
