"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, Users, Calendar, Zap, Globe, Star, Ticket } from "lucide-react"
import Link from "next/link"

// Dynamically import shaders to avoid SSR issues with WebGL
const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.MeshGradient),
  { ssr: false }
)

interface HeroProps {
  onCreateEventClick: () => void;
}

const tickerItems = [
  { icon: <Users className="h-3.5 w-3.5" />, text: "12,000+ Members" },
  { icon: <Calendar className="h-3.5 w-3.5" />, text: "800+ Events Hosted" },
  { icon: <Globe className="h-3.5 w-3.5" />, text: "District 3192" },
  { icon: <Ticket className="h-3.5 w-3.5" />, text: "Instant QR Tickets" },
  { icon: <Zap className="h-3.5 w-3.5" />, text: "Real-time Check-in" },
  { icon: <Star className="h-3.5 w-3.5" />, text: "99.9% Uptime" },
]

// Duplicate for seamless loop
const allTickerItems = [...tickerItems, ...tickerItems]

const words = [
  "Impact.",
  "Service.",
  "Fellowship.",
  "Leaders.",
  "Opportunities.",
  "Change.",
  "Connections.",
  "Communities.",
]

export function Hero({ onCreateEventClick }: HeroProps) {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])

  const [wordIdx, setWordIdx] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  }
  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 90, damping: 20 }
    }
  }

  // Stable random particle positions
  const particles = React.useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: `${(i * 37 + 11) % 100}%`,
      y: `${(i * 53 + 17) % 100}%`,
      size: `${1.5 + (i % 2.5)}px`,
      delay: `${(i * 0.4) % 4}s`,
      duration: `${7 + (i % 6)}s`,
    })), []
  )

  return (
    <motion.section
      className="relative flex flex-col items-center justify-center pt-28 sm:pt-36 md:pt-40 pb-0 overflow-hidden w-full min-h-[95vh]"
      style={{ color: "#ffffff", opacity: heroOpacity, scale: heroScale }}
    >
      {/* ─── Background Theme Gradient Fallback ─── */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(135deg, #041C32 0%, #062B4F 50%, #041C32 100%)" }}
      />

      {/* Live animated ocean-mesh gradient (WebGL) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <MeshGradient
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          colors={[
            "#041C32",
            "#062B4F",
            "#1D73FF",
            "#041C32",
            "#38BDF8",
          ]}
          speed={0.2}
          distortion={1.3}
          swirl={0.2}
        />
      </div>

      {/* Dark overlay for copy readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(4,28,50,0.7) 0%, rgba(6,43,79,0.4) 45%, rgba(4,28,50,0.85) 100%)"
        }}
      />

      {/* Soft Radial Glows */}
      <div
        className="glow-orb absolute -top-32 -right-32 z-[1]"
        style={{ width: "600px", height: "600px", background: "rgba(29, 115, 255, 0.15)", filter: "blur(120px)" }}
      />
      <div
        className="glow-orb absolute bottom-0 -left-24 z-[1]"
        style={{ width: "500px", height: "500px", background: "rgba(56, 189, 248, 0.1)", filter: "blur(100px)" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-sky-400/30 animate-float"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* ─── Two-Column Hero Grid ─── */}
      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center lg:items-start text-center lg:text-left w-full"
            >
              {/* Rotaract District 3192 Badge */}
              <motion.div variants={itemVariants} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] px-4 py-2 rounded-full border"
                  style={{
                    background: "rgba(29, 115, 255, 0.08)",
                    borderColor: "rgba(29, 115, 255, 0.25)",
                    color: "#38BDF8",
                    fontFamily: "var(--font-mono), monospace"
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Rotaract District 3192 · Est. 1985
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-extrabold leading-[1.08] mb-6 text-white tracking-tight"
                style={{ fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}
              >
                Connecting Communities.
                <br />
                <span className="inline-flex flex-wrap items-center justify-center lg:justify-start">
                  <span>Creating&nbsp;</span>
                  <span className="inline-block relative h-[1.1em] min-w-[190px] sm:min-w-[240px] md:min-w-[290px] lg:min-w-[340px] xl:min-w-[400px] align-bottom text-left">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={words[wordIdx]}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 bottom-0 bg-clip-text text-transparent bg-gradient-to-r from-[#6EB7FF] to-[#38BDF8]"
                      >
                        {words[wordIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
              </motion.h1>

              {/* Supporting copy */}
              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg leading-[1.7] max-w-2xl mb-8 opacity-80"
                style={{ color: "#D1E1F0", letterSpacing: "-0.01em", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}
              >
                Step into the year of leadership and collaboration. RotaSphere is the premium 
                command center for service initiatives, professional training, conferences, and fellowships.{" "}
                <span style={{ color: "#38BDF8" }}>Discover, book, and impact.</span>
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 mb-10 w-full max-w-md sm:max-w-none"
              >
                {/* Explore Events (Primary) */}
                <Link
                  href="/events"
                  className="relative overflow-hidden flex items-center justify-center gap-2.5 font-bold w-full sm:w-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(29,115,255,0.45)] group"
                  style={{
                    background: "linear-gradient(135deg, #1D73FF 0%, #1557C2 100%)",
                    color: "#ffffff",
                    borderRadius: "32px",
                    padding: "15px 36px",
                    fontSize: "15px",
                    letterSpacing: "-0.02em",
                    border: "none",
                    fontFamily: "var(--font-sans), 'Inter', sans-serif"
                  }}
                >
                  <span className="relative">Explore Events</span>
                  <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Create Event (Secondary) */}
                <button
                  onClick={onCreateEventClick}
                  className="relative overflow-hidden flex items-center justify-center gap-2.5 font-bold w-full sm:w-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)] group cursor-pointer"
                  style={{
                    background: "rgba(56, 189, 248, 0.06)",
                    color: "#ffffff",
                    borderRadius: "32px",
                    padding: "15px 36px",
                    fontSize: "15px",
                    letterSpacing: "-0.02em",
                    border: "1px solid rgba(56, 189, 248, 0.28)",
                    fontFamily: "var(--font-sans), 'Inter', sans-serif"
                  }}
                >
                  <span className="relative">Create Event</span>
                  <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>

              {/* Live stat pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                {[
                  { label: "Events", value: "800+", icon: <Calendar className="h-3 w-3" /> },
                  { label: "Members", value: "12K+", icon: <Users className="h-3 w-3" /> },
                  { label: "Clubs", value: "48+", icon: <Globe className="h-3 w-3" /> },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      fontFamily: "var(--font-sans), 'Inter', sans-serif"
                    }}
                  >
                    <span style={{ color: "#38BDF8" }}>{stat.icon}</span>
                    <span className="text-sky-300">{stat.value}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column (Direct Seamless Integration of User-Provided Illustration) */}
          <div className="lg:col-span-5 flex justify-center w-full mt-10 lg:mt-0 relative">
            {/* Subtle Blue Glow Behind Illustration */}
            <div 
              className="absolute inset-0 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none scale-90" 
              style={{ background: "radial-gradient(circle, rgba(29,115,255,0.15) 0%, transparent 70%)" }}
            />
            
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full relative z-10"
            >
              <img
                src="/hero-illustration.png"
                alt="RotaSphere Event Planning"
                className="w-full h-auto object-contain pointer-events-none"
                style={{
                  filter: "drop-shadow(0 15px 35px rgba(29, 115, 255, 0.25))",
                }}
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* ─── Bottom loop ticker strip ─── */}
      <div
        className="relative z-10 w-full mt-16 overflow-hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="flex py-3 animate-ticker">
          {allTickerItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] px-6 shrink-0 font-mono"
              style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono), monospace" }}
            >
              <span style={{ color: "#38BDF8" }}>{item.icon}</span>
              {item.text}
              <span className="h-1 w-1 rounded-full bg-sky-500/40 ml-4" />
            </span>
          ))}
        </div>
      </div>

      {/* Layered animated wave dividers */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none select-none" style={{ marginBottom: "-1px" }}>
        <svg
          className="relative block w-[calc(200%+1.3px)] h-[90px] opacity-25 animate-wave-drift"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ animationDuration: "22s" }}
        >
          <path d="M0,0 C150,90 350,10 500,70 C650,130 850,50 1000,80 C1150,110 1350,30 1500,60 L1500,120 L0,120 Z" fill="var(--background)" />
        </svg>
        <svg
          className="relative block w-[calc(200%+1.3px)] h-[65px] opacity-50 -mt-14 animate-wave-drift"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ animationDuration: "13s", animationDirection: "reverse" }}
        >
          <path d="M0,0 C200,60 400,100 600,40 C800,100 1000,50 1200,80 C1400,110 1600,40 1800,60 L1800,120 L0,120 Z" fill="var(--background)" />
        </svg>
      </div>
    </motion.section>
  )
}
