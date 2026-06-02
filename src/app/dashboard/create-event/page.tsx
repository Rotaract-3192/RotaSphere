"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"
import { getBookedTicketsAction } from "@/app/actions/paymentActions"
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

  // Load events and bookings from database
  React.useEffect(() => {
    async function loadData() {
      let finalEvents: EventItem[] = []
      let finalBookings: EventItem[] = []

      // 1. Fetch database events from Server Action
      try {
        const res = await getEventsAction()
        if (res.success) {
          if (!res.simulated) {
            finalEvents = res.events as EventItem[]
          } else {
            const savedEvents = localStorage.getItem("rotasphere_events")
            finalEvents = savedEvents ? JSON.parse(savedEvents) : mockEvents
          }
        }
      } catch (err) {
        console.error("Failed to load events from database:", err)
      }

      // 2. Fetch booked tickets from database
      try {
        const ticketRes = await getBookedTicketsAction()
        if (ticketRes.success) {
          if (!ticketRes.simulated) {
            finalBookings = ticketRes.tickets as EventItem[]
          } else {
            const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
            if (savedBooked) {
              finalBookings = JSON.parse(savedBooked)
            } else {
              finalBookings = [finalEvents[0], finalEvents[3]].filter(Boolean)
              localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(finalBookings))
            }
          }
        }
      } catch (err) {
        console.error("Failed to load booked tickets from database:", err)
      }

      // Defer state updates to avoid set-state-in-effect warning
      setTimeout(() => {
        setEvents(finalEvents)
        setBookedTickets(finalBookings)
      }, 0)
    }

    if (typeof window !== "undefined") {
      loadData()
    }
  }, [])

  // Loading state or unauthorized state
  if (!isLoaded || !user || (user.role !== "organizer" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
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
