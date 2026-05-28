"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/sections/Hero"
import { Stats } from "@/components/sections/Stats"
import { FeaturedEvents } from "@/components/sections/FeaturedEvents"
import { Categories } from "@/components/sections/Categories"
import { Testimonials } from "@/components/sections/Testimonials"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { mockEvents, EventItem } from "@/data/mockData"

export default function Home() {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rotasphere_events")
      const parsedEvents = saved ? JSON.parse(saved) : mockEvents
      if (!saved) {
        localStorage.setItem("rotasphere_events", JSON.stringify(mockEvents))
      }
      // Defer state update to avoid set-state-in-effect warning
      const timer = setTimeout(() => {
        setEvents(parsedEvents)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents((prev) => {
      const updated = [newEvent, ...prev]
      localStorage.setItem("rotasphere_events", JSON.stringify(updated))
      return updated
    })
  }

  const handleEventBooked = (eventId: string) => {
    setEvents((prev) => {
      const updated = prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e)
      localStorage.setItem("rotasphere_events", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <>
      <Navbar onCreateEventClick={() => setIsCreateEventOpen(true)} />
      
      <main className="flex-grow">
        <Hero onCreateEventClick={() => setIsCreateEventOpen(true)} />
        <Stats />
        <FeaturedEvents events={events} onEventBooked={handleEventBooked} />
        <Categories />
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

