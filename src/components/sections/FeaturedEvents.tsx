"use client"

import * as React from "react"
import { Calendar, MapPin, Sparkles, User, Ticket, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { EventItem } from "@/data/mockData"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

import { useAuthSession } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

interface FeaturedEventsProps {
  events: EventItem[];
  onEventBooked?: (eventId: string) => void;
}

export function FeaturedEvents({ events, onEventBooked }: FeaturedEventsProps) {
  const router = useRouter()
  const { isSignedIn, role } = useAuthSession()
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [bookingEvent, setBookingEvent] = React.useState<EventItem | null>(null)
  const [bookingSuccess, setBookingSuccess] = React.useState(false)

  const categories = [
    { label: "All Events", value: "all" },
    { label: "Tech", value: "tech" },
    { label: "Music", value: "music" },
    { label: "Business", value: "business" },
    { label: "Food", value: "food" },
    { label: "Arts", value: "arts" },
    { label: "Sports", value: "sports" }
  ]

  const filteredEvents = selectedCategory === "all"
    ? events
    : events.filter(evt => evt.category === selectedCategory)

  const handleBookTicket = (event: EventItem) => {
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }
    
    if (role !== "attendee") {
      alert(`Only Attendees can book tickets. Your current role is "${role?.toUpperCase() || 'unknown'}". Please create an Attendee account to get tickets.`)
      return
    }

    setBookingEvent(event)
  }

  const confirmBooking = () => {
    if (!bookingEvent) return

    // 1. Update tickets list in localStorage
    const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
    const bookedList: EventItem[] = savedBooked ? JSON.parse(savedBooked) : []
    
    // Check if already booked to avoid duplicates
    const alreadyBooked = bookedList.some(evt => evt.id === bookingEvent.id)
    if (!alreadyBooked) {
      bookedList.push(bookingEvent)
      localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(bookedList))
    }

    // 2. Trigger parent callback to update state and localStorage "rotasphere_events"
    if (onEventBooked) {
      onEventBooked(bookingEvent.id)
    } else {
      // Fallback: manually update localStorage if no callback is provided
      const savedEvents = localStorage.getItem("rotasphere_events")
      if (savedEvents) {
        const eventsList: EventItem[] = JSON.parse(savedEvents)
        const updatedList = eventsList.map(e => 
          e.id === bookingEvent.id ? { ...e, attendees: (e.attendees || 0) + 1 } : e
        )
        localStorage.setItem("rotasphere_events", JSON.stringify(updatedList))
      }
    }

    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
      setBookingEvent(null)
    }, 2000)
  }

  // Get color variables for badges based on event category
  const getCategoryStyles = (cat: string) => {
    const styles: Record<string, string> = {
      tech: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      music: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      business: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      food: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      arts: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      sports: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }
    return styles[cat] || "bg-slate-500/10 text-slate-500 border-slate-500/20"
  }

  return (
    <section id="events" className="py-20 relative bg-background bg-radial-grid">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-indigo-500/15 shadow-sm text-xs font-semibold text-indigo-500 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover What&apos;s Happening</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Featured <span className="text-gradient">Events</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Browse through our top curated events. From local coding workshops to global music festivals, explore events that ignite your passions.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                selectedCategory === cat.value
                  ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "glass-card border-muted hover:border-indigo-500/40 text-foreground/80 hover:text-indigo-500"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 glass-card border border-muted/50 rounded-2xl max-w-md mx-auto">
            <p className="text-muted-foreground mb-4">No events found in this category.</p>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory("all")}
              className="rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => {
              const attendeesPct = Math.min(100, Math.round((evt.attendees / parseInt(evt.capacity)) * 100))
              return (
                <Card
                  key={evt.id}
                  className="glass-card border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/20 flex flex-col group"
                >
                  {/* Event Image & Price Badge */}
                  <CardHeader className="p-0 relative h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs shadow-md border border-white/10">
                      {evt.price}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Header: Category and Title */}
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-3 ${getCategoryStyles(evt.category)}`}>
                        {evt.category}
                      </span>
                      <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500/80" />
                        <span>{evt.date} • {evt.time.split(" ")[0]} {evt.time.split(" ")[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500/80 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500/80" />
                        <span>By {evt.organizer}</span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-muted-foreground">Registered</span>
                        <span className="text-foreground">{evt.attendees} / {evt.capacity} seats</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted/50 border border-muted/20 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${attendeesPct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 pb-5 pt-0">
                    <Button
                      onClick={() => handleBookTicket(evt)}
                      className="w-full rounded-xl bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-semibold transition-all duration-200"
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Get Ticket
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* Ticket Booking Interactive Dialog */}
      <Dialog open={!!bookingEvent} onOpenChange={(open) => { if (!open) setBookingEvent(null) }}>
        <DialogContent className="glass-card max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl backdrop-blur-2xl text-center">
          {bookingSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Ticket Booked!</h3>
              <p className="text-xs text-muted-foreground">
                Your confirmation has been sent to your email. See you there!
              </p>
            </div>
          ) : (
            bookingEvent && (
              <>
                <DialogHeader className="items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Confirm Ticket Order
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    You are placing an order for a ticket to:
                  </DialogDescription>
                  <span className="font-bold text-foreground block text-sm mt-2">
                    {bookingEvent.title}
                  </span>
                </DialogHeader>

                <div className="my-5 p-4 rounded-xl bg-background/50 border border-muted/50 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-bold text-foreground">{bookingEvent.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold text-foreground">{bookingEvent.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {bookingEvent.location}
                    </span>
                  </div>
                </div>

                <DialogFooter className="flex sm:justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBookingEvent(null)}
                    className="rounded-xl flex-1 border-muted hover:bg-muted/50 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmBooking}
                    className="rounded-xl flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25"
                  >
                    Confirm Booking
                  </Button>
                </DialogFooter>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
