"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Testimonials } from "@/components/sections/Testimonials"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { EventItem } from "@/data/mockData"

export default function TestimonialsPage() {
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
          className="relative overflow-hidden py-20"
          style={{ background: "var(--soft-stone)", borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="ghost-watermark absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{ fontSize: "clamp(60px, 12vw, 180px)" }}
          >
            REVIEWS
          </div>
          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            <span className="eyebrow-accent mb-4 block">Success Stories</span>
            <h1
              className="text-5xl md:text-6xl font-medium"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              What Creators Say
            </h1>
            <p
              className="mt-4 font-weight-450 max-w-xl"
              style={{ color: "var(--body-muted)", fontSize: "16px" }}
            >
              Real reviews from independent organizers, enterprise planners, and community hosts
              who run their events on RotaSphere.
            </p>
          </div>
        </div>

        <Testimonials />
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
