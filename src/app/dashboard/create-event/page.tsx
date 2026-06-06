"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"
import { getBookedTicketsAction } from "@/app/actions/paymentActions"
import { OrganizerDashboard } from "@/components/dashboard/OrganizerDashboard"

import { Skeleton } from "@/components/ui/skeleton"
import { FormSkeleton } from "@/components/skeletons/FormSkeleton"

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
            setEvents(finalEvents)
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
      <div className="min-h-screen flex bg-background">
        {/* Left Sidebar Skeleton */}
        <div className="hidden lg:flex flex-col w-64 border-r border-violet-500/10 p-6 space-y-6 shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-3 pt-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-9 w-full rounded-full" />
            ))}
          </div>
        </div>

        {/* Main Panel Content Skeleton */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Form Wizard wrapper */}
          <FormSkeleton />
        </div>
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
