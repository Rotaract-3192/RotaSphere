"use client"

import * as React from "react"
import type { Metadata } from "next"
import { Navbar } from "@/components/Navbar"
import { FeaturedEvents } from "@/components/sections/FeaturedEvents"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { mockEvents, EventItem } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"

import { EventCardSkeleton } from "@/components/skeletons/EventCardSkeleton"

export default function EventsPage() {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)
      try {
        const res = await getEventsAction()
        if (res.success) {
          if (!res.simulated) {
            setEvents(res.events as EventItem[])
          } else {
            const saved = localStorage.getItem("rotasphere_events")
            const current = saved ? JSON.parse(saved) : mockEvents
            setEvents(current)
          }
        }
      } catch (err) {
        console.error("Failed to fetch events:", err)
      }
      setIsLoading(false)
    }

    if (typeof window !== "undefined") fetchEvents()
  }, [])

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents(prev => [newEvent, ...prev])
  }

  const handleEventBooked = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e))
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
          {/* Ghost watermark */}
          <div
            className="ghost-watermark absolute inset-0 flex items-center justify-start pl-6 pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{ fontSize: "clamp(80px, 16vw, 220px)" }}
          >
            EVENTS
          </div>
          <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
            <span className="eyebrow-accent mb-4 block">Discover • Explore • Attend</span>
            <h1
              className="text-5xl md:text-6xl font-medium"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              All Platform Events
            </h1>
            <p
              className="mt-4 font-weight-450 max-w-xl"
              style={{ color: "var(--body-muted)", fontSize: "16px" }}
            >
              Browse and book ticket passes for community service drives, professional seminars, fundraisers, and fellowships.
            </p>
          </div>
        </div>

        {isLoading ? (
          <section className="relative py-20" style={{ background: "#eeece7" }}>
            <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
              {/* Category filter pills loader */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-8 w-28 animate-pulse rounded-full bg-violet-600/10 dark:bg-violet-400/5 border border-violet-500/10 dark:border-violet-400/5"
                  />
                ))}
              </div>

              {/* Event card grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <EventCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <FeaturedEvents events={events} onEventBooked={handleEventBooked} />
        )}
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
