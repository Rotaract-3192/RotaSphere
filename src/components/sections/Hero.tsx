"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Play, Star, Calendar, Users, ShieldCheck } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroProps {
  onCreateEventClick: () => void;
}

export function Hero({ onCreateEventClick }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  }

  const floatCardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 12, delay: 0.6 }
    }
  }

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-radial-grid">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/10 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none dark:bg-indigo-500/15" />
      <div className="absolute bottom-1/4 right-1/10 h-[450px] w-[450px] rounded-full bg-purple-500/20 blur-[130px] pointer-events-none dark:bg-purple-500/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

      {/* Floating Decorative Glass Shapes */}
      <div className="absolute top-[20%] right-[15%] h-12 w-12 rounded-xl glass-card border-white/20 shadow-md flex items-center justify-center animate-float pointer-events-none hidden lg:flex">
        <Calendar className="h-5 w-5 text-indigo-500" />
      </div>
      <div className="absolute bottom-[25%] left-[8%] h-14 w-14 rounded-2xl glass-card border-white/20 shadow-md flex items-center justify-center animate-float-delayed pointer-events-none hidden lg:flex">
        <Users className="h-6 w-6 text-purple-500" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 text-left space-y-6"
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-indigo-500/20 shadow-sm text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
              <span>Host the extraordinary, smoothly</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground"
            >
              Where Moments Become{" "}
              <span className="text-gradient">Memories</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              RotaSphere is the premium, glassmorphic SaaS platform designed to build, manage, and coordinate your corporate summits, music festivals, food expos, and community gatherings seamlessly.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Button
                size="lg"
                onClick={onCreateEventClick}
                className="rounded-xl h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Event
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <a
                href="#events"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl h-12 px-6 border-muted hover:bg-muted/50 text-foreground flex items-center justify-center"
                )}
              >
                <Play className="h-4 w-4 mr-2 text-indigo-500 fill-indigo-500" />
                Explore Events
              </a>
            </motion.div>

            {/* Rating & Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-4 border-t border-muted max-w-md"
            >
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="User avatar"
                    className="h-9 w-9 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">4.9/5</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Trusted by 10,000+ event creators globally.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right Visuals (Glassmorphic Mockup) */}
          <motion.div
            variants={floatCardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 relative"
          >
            {/* Main Mockup Card */}
            <div className="relative glass-card border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl overflow-hidden animate-float">
              {/* Card glowing header */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-foreground">NextGen Tech Summit</h3>
                  <p className="text-xs text-muted-foreground">Hosted by RotaSphere Pro</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                  Live Dashboard
                </div>
              </div>

              {/* Stat grid inside card */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-muted/30 border border-muted p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Tickets Sold</span>
                  <span className="text-xl font-bold text-foreground">1,240 / 1,500</span>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
                <div className="rounded-xl bg-muted/30 border border-muted p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Total Revenue</span>
                  <span className="text-xl font-bold text-foreground">$370,760</span>
                  <span className="text-[10px] text-emerald-400 font-medium block mt-1">
                    ↑ 18% vs yesterday
                  </span>
                </div>
              </div>

              {/* Recent ticket orders */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Recent Registrations
                </span>
                {[
                  { name: "Sophia Martinez", time: "2 mins ago", type: "VIP Ticket" },
                  { name: "David Chen", time: "12 mins ago", type: "Regular Ticket" },
                  { name: "Emily Watson", time: "25 mins ago", type: "VIP Ticket" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-background/40 border border-muted/50 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
                        {item.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">{item.type}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground font-medium text-[10px]">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smaller decorative back card */}
            <div className="absolute -bottom-6 -right-6 h-48 w-48 rounded-2xl glass-card border-white/10 shadow-lg -z-10 flex flex-col p-4 justify-between backdrop-blur-md opacity-75 hidden sm:flex">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">Secure Payments</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Stripe, PayPal, and Apple Pay integrated.</p>
                <div className="h-1 bg-emerald-500 w-full rounded-full mt-2" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
