"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Stats } from "@/components/sections/Stats"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { EventItem } from "@/data/mockData"
import {
  Zap, Shield, BarChart3, Globe, Users, Layers,
  HeartHandshake, Award, Briefcase, Sparkles, BookOpen, Compass
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Event Creation",
    desc: "Launch a fully branded event page with ticketing in under 2 minutes. No coding needed."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Paytm Gateway integration with end-to-end encryption, accepting Indian Rupees (INR)."
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Live dashboards showing ticket sales, revenue, attendee demographics, and check-in stats."
  },
  {
    icon: Globe,
    title: "District-Wide Reach",
    desc: "Coordinate and showcase events across all Rotaract clubs in District 3192."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Invite co-organizers, assign roles, and manage large-scale events together."
  },
  {
    icon: Layers,
    title: "Multi-Tier Ticketing",
    desc: "Create VIP, Early Bird, Regular, and custom ticket tiers with independent pricing."
  },
]

const avenues = [
  {
    icon: Users,
    title: "Club Service",
    desc: "Focusing on strengthening fellowship and ensuring the effective functioning of the club."
  },
  {
    icon: Briefcase,
    title: "Vocational Service",
    desc: "Encouraging high ethical standards in business and professions and recognizing the worth of all useful occupations."
  },
  {
    icon: HeartHandshake,
    title: "Community Service",
    desc: "Developing and implementing projects that improve the quality of life in our local communities."
  },
  {
    icon: Globe,
    title: "International Service",
    desc: "Expanding our reach globally to foster understanding, goodwill, and peace between nations."
  }
]

export default function AboutPage() {
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false)

  const handleEventCreated = (newEvent: EventItem) => {
    // Event is created dynamically
  }

  return (
    <>
      <Navbar onCreateEventClick={() => setIsCreateEventOpen(true)} />

      <main className="flex-grow pt-24" style={{ background: "var(--background)" }}>

        {/* Hero Header */}
        <div
          className="relative overflow-hidden py-20 sm:py-28"
          style={{ background: "var(--primary)" }}
        >
          {/* Orbital arcs */}
          <svg className="absolute top-0 right-0 pointer-events-none" width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true">
            <circle cx="300" cy="0" r="180" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.12" />
            <circle cx="300" cy="0" r="120" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.08" />
          </svg>

          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            {/* Slogan Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/25 bg-sky-400/10 mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Be the Number One, or the Only One
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-medium mb-6 leading-tight max-w-4xl"
              style={{ color: "var(--primary-foreground)", letterSpacing: "-0.02em" }}
            >
              Rotaract District 3192
              <br />
              <span style={{ color: "var(--accent)" }}>Event Booking Platform</span>
            </h1>

            <p
              className="font-weight-450 max-w-2xl text-base sm:text-lg mb-4 leading-relaxed"
              style={{ color: "var(--primary-foreground)", opacity: 0.85 }}
            >
              Rotaract District 3192 is a thriving network of young leaders committed to institutional excellence and sustainable community impact.
            </p>

            <p
              className="font-weight-450 max-w-xl text-sm"
              style={{ color: "var(--primary-foreground)", opacity: 0.65 }}
            >
              This web application, RotaSphere, was custom-built to facilitate showcasing events, managing registrations, and booking ticket passes for all club and district-wide service initiatives.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <Stats />

        {/* Mission & Vision Section */}
        <section className="py-20 border-b border-border" style={{ background: "var(--background)" }}>
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Mission Card */}
              <div 
                className="p-8 sm:p-10 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                }}
              >
                <div>
                  <span className="eyebrow-accent mb-4 block">Our Mission</span>
                  <h2 
                    className="text-2xl sm:text-3xl font-medium mb-4"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                  >
                    Cultivating Excellence
                  </h2>
                  <p 
                    className="font-weight-450 text-sm sm:text-base leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    To build a culture of excellence where every club thrives, every leader grows, and every initiative becomes a benchmark for others to follow.
                  </p>
                </div>
                <div className="mt-8 h-1 w-12 rounded bg-gradient-to-r from-sky-400 to-[#1E88E5]" />
              </div>

              {/* Vision Card */}
              <div 
                className="p-8 sm:p-10 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                }}
              >
                <div>
                  <span className="eyebrow-accent mb-4 block">Our Vision</span>
                  <h2 
                    className="text-2xl sm:text-3xl font-medium mb-4"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                  >
                    Empowering Future Leaders
                  </h2>
                  <p 
                    className="font-weight-450 text-sm sm:text-base leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    To make Rotaract a powerful platform that empowers every Rotaractor with the leadership, skills, and opportunities needed to thrive in both their personal and professional lives.
                  </p>
                </div>
                <div className="mt-8 h-1 w-12 rounded bg-gradient-to-r from-sky-400 to-[#1E88E5]" />
              </div>

            </div>
          </div>
        </section>

        {/* Core Pillars: The Four Avenues of Service */}
        <section className="py-20 border-b border-border" style={{ background: "var(--background)" }}>
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-12">
              <span className="eyebrow-accent mb-3 block">Core Pillars</span>
              <h2 
                className="text-3xl sm:text-4xl font-medium"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                The Four Avenues of Service
              </h2>
              <p 
                className="font-weight-450 max-w-xl mx-auto text-sm mt-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Our events, ticketing, and service campaigns are organized directly under these four key avenues of Rotaract activity:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {avenues.map((ave, i) => {
                const Icon = ave.icon
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl transition-all duration-300"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                      ;(e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                      ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                    }}
                  >
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                    </div>
                    <h3 
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                    >
                      {ave.title}
                    </h3>
                    <p 
                      className="font-weight-450 leading-relaxed text-xs text-muted-foreground"
                    >
                      {ave.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Platform Features Grid */}
        <section className="py-20 border-b border-border" style={{ background: "var(--background)" }}>
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-12">
              <span className="eyebrow-accent mb-3 block">Everything You Need</span>
              <h2
                className="text-3xl sm:text-4xl font-medium"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Platform Capabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div
                    key={i}
                    className="p-6 transition-all duration-300"
                    style={{
                      background: "var(--card)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                      ;(e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                      ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                    }}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                    </div>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {feat.title}
                    </h3>
                    <p
                      className="font-weight-450 leading-relaxed text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {feat.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Legacy & Service Above Self */}
        <section className="py-20 relative overflow-hidden" style={{ background: "var(--background)" }}>
          <div
            className="ghost-watermark absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{ fontSize: "clamp(60px, 12vw, 180px)" }}
          >
            LEGACY
          </div>

          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Service Above Self Column */}
              <div className="lg:col-span-5 space-y-6">
                <span className="eyebrow-accent">Service Above Self</span>
                <h2 
                  className="text-3xl sm:text-4xl font-medium leading-tight"
                  style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                >
                  Building a Legacy of Excellence
                </h2>
                <p 
                  className="font-weight-450 text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Through every project and every handshake, we aim to build a legacy of excellence that transcends generations. By removing organizational friction, we ensure clubs can focus purely on making a real difference.
                </p>
              </div>

              {/* Legacy Column */}
              <div 
                className="lg:col-span-7 p-8 sm:p-10 rounded-2xl space-y-6"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                    The Legacy of 3192
                  </h3>
                  <p className="font-weight-450 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    Rotaract originally began as a Rotary International youth program in 1968. Today, Rotaract operates globally with over 10,000 clubs in 180 countries.
                  </p>
                  <p className="font-weight-450 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    District 3192 has a rich legacy of vibrant youth action in South India. Formed to concentrate impact within key urban and rural demographics, 3192 acts as a catalyst for professional development and massive community service projects.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section 
          className="py-20 text-center relative overflow-hidden" 
          style={{ background: "var(--primary)" }}
        >
          {/* Subtle details */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="container mx-auto px-6 max-w-3xl relative z-10 space-y-6">
            <span className="eyebrow-accent block" style={{ color: "var(--accent)" }}>
              Friendship through Service
            </span>
            
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-medium"
              style={{ color: "var(--primary-foreground)", letterSpacing: "-0.02em" }}
            >
              Ready to Make an Impact?
            </h2>
            
            <p 
              className="font-weight-450 leading-relaxed text-sm sm:text-base max-w-xl mx-auto"
              style={{ color: "var(--primary-foreground)", opacity: 0.8 }}
            >
              Join a global movement of young leaders making an impact. Start your journey with Rotaract District 3192 today. Use our ticketing system to secure passes to upcoming club initiatives.
            </p>

            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <a
                href="/events"
                className="inline-flex font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--accent)",
                  color: "var(--primary)",
                  borderRadius: "var(--radius-pill)",
                  padding: "12px 28px",
                  fontSize: "14px",
                  border: "none",
                  letterSpacing: "-0.01em",
                  textDecoration: "none"
                }}
              >
                Explore Events
              </a>
              <button
                onClick={() => setIsCreateEventOpen(true)}
                className="inline-flex font-semibold transition-all duration-200 hover:-translate-y-0.5 bg-transparent border border-white/20 hover:border-white/40 text-white"
                style={{
                  borderRadius: "var(--radius-pill)",
                  padding: "12px 28px",
                  fontSize: "14px",
                  letterSpacing: "-0.01em",
                  cursor: "pointer"
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  )
}

