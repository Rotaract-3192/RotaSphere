"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { OrganizerDashboard } from "@/components/dashboard/OrganizerDashboard"

export default function CreateEventPage() {
  const { user, isSignedIn, isLoaded, signOut } = useAuthSession()
  const router = useRouter()

  const [events, setEvents] = React.useState<EventItem[]>([])
  const [bookedTickets, setBookedTickets] = React.useState<EventItem[]>([])

  // Redirect unauthorized
  React.useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in")
      } else if (user && user.role !== "organizer" && user.role !== "admin") {
        // Attendees are not allowed to create events, send to dashboard
        router.push("/dashboard")
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  // Load events from LocalStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("rotasphere_events")
      const parsedEvents = savedEvents ? JSON.parse(savedEvents) : mockEvents

      // Initialize booked tickets for mock attendee
      const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
      let initialBookings: EventItem[] = []
      if (savedBooked) {
        initialBookings = JSON.parse(savedBooked)
      } else {
        initialBookings = [parsedEvents[0], parsedEvents[3]].filter(Boolean)
        localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(initialBookings))
      }

      // Defer state updates to avoid set-state-in-effect warning
      const timer = setTimeout(() => {
        setEvents(parsedEvents)
        setBookedTickets(initialBookings)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  // Loading state or unauthorized state
  if (!isLoaded || !user || (user.role !== "organizer" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-radial-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Securing session...</p>
      </div>
    )
  }

  return (
    <OrganizerDashboard
      events={events}
      setEvents={setEvents}
      bookedTickets={bookedTickets}
      user={user}
      signOut={signOut}
      initialView="create-event"
    />
  )
}
