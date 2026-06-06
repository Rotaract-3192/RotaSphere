"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Stats } from "@/components/sections/Stats"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { EventItem } from "@/data/mockData"
import {
  Zap, Shield, BarChart3, Globe, Users, Layers,
  CalendarCheck, HeartHandshake, Award
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
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    desc: "Built-in calendar sync, automated reminders, and waitlist management."
  },
  {
    icon: HeartHandshake,
    title: "Attendee Engagement",
    desc: "Pre-event polls, post-event surveys, and networking tools to maximize engagement."
  },
  {
    icon: Award,
    title: "Verified Organizer Badge",
    desc: "Build trust with your audience through our verified organizer certification program."
  },
]

export default function AboutPage() {
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false)

  const handleEventCreated = (newEvent: EventItem) => {
    // Event is created in Supabase database dynamically
  }

  return (
    <>
      <Navbar onCreateEventClick={() => setIsCreateEventOpen(true)} />

      <main className="flex-grow pt-24" style={{ background: "var(--background)" }}>

        {/* Page Header */}
        <div
          className="relative overflow-hidden py-14 sm:py-20"
          style={{ background: "var(--primary)", borderBottom: "none" }}
        >
          {/* Orbital arcs */}
          <svg className="absolute top-0 right-0 pointer-events-none" width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true">
            <circle cx="300" cy="0" r="180" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.12" />
            <circle cx="300" cy="0" r="120" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.08" />
          </svg>
          <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">
            <span className="eyebrow-accent mb-4 block">About RotaSphere</span>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4"
              style={{ color: "var(--primary-foreground)", letterSpacing: "-0.02em" }}
            >
              Rotaract District 3192
              <br />
              Event Hub
            </h1>
            <p
              className="font-weight-450 max-w-xl text-sm sm:text-base"
              style={{ color: "var(--primary-foreground)", opacity: 0.7 }}
            >
              This web application was custom-built for Rotaract District 3192 to facilitate showcasing events, managing registrations, and booking ticket passes for all club and district-wide initiatives.
            </p>
          </div>
        </div>

        {/* Platform Numbers */}
        <Stats />

        {/* Features Grid */}
        <section className="section-padding" style={{ background: "var(--background)" }}>
          <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-10 sm:mb-14">
              <span className="eyebrow-accent mb-4 block">Everything You Need</span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-medium"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Platform Features
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div
                    key={i}
                    className="p-6 sm:p-8 transition-all duration-300"
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
                      className="h-14 w-14 rounded-full flex items-center justify-center mb-5"
                      style={{
                        background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-medium mb-2"
                      style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                    >
                      {feat.title}
                    </h3>
                    <p
                      className="font-weight-450 leading-relaxed text-xs sm:text-sm"
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

        {/* Mission Section */}
        <section className="section-padding relative overflow-hidden" style={{ background: "var(--background)" }}>
          <div
            className="ghost-watermark absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{ fontSize: "clamp(60px, 12vw, 180px)" }}
          >
            MISSION
          </div>
          <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="eyebrow-accent mb-6 block">Our Mission</span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Making Every Event
                Extraordinary
              </h2>
              <p
                className="font-weight-450 leading-relaxed mb-10 text-sm sm:text-base md:text-lg"
                style={{ color: "var(--muted-foreground)" }}
              >
                We believe that Rotaract events have the power to connect youth, inspire community service,
                and create lasting memories. This platform removes the friction from event registration and showcasing — so clubs across District 3192 can focus on making a real difference.
              </p>
              <a
                href="/events"
                className="inline-flex font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-pill)",
                  padding: "14px 32px",
                  fontSize: "16px",
                  border: "1.5px solid var(--primary)",
                  letterSpacing: "-0.01em",
                  textDecoration: "none"
                }}
              >
                Browse Events →
              </a>
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
