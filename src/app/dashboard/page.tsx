"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { OrganizerDashboard } from "@/components/dashboard/OrganizerDashboard"
import { 
  Calendar, MapPin, Users, DollarSign, Ticket, 
  Plus, ShieldCheck, UserCheck, Trash2, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isSignedIn, isLoaded, signOut } = useAuthSession()
  const router = useRouter()

  const [events, setEvents] = React.useState<EventItem[]>([])
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [bookedTickets, setBookedTickets] = React.useState<EventItem[]>([])
  const [sysUsersCount, setSysUsersCount] = React.useState(124)

  // Redirect unauthorized
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  // Load events from LocalStorage and MongoDB
  React.useEffect(() => {
    async function loadData() {
      // 1. First get initial list from local storage / mock fallback
      const savedEvents = localStorage.getItem("rotasphere_events")
      let localEvents = savedEvents ? JSON.parse(savedEvents) : mockEvents

      // 2. Fetch database events from Server Action
      try {
        const res = await getEventsAction()
        if (res.success && res.events && res.events.length > 0) {
          const dbEvents = res.events as EventItem[]
          const dbIds = new Set(dbEvents.map(e => e.id))
          const filteredLocal = localEvents.filter((e: EventItem) => !dbIds.has(e.id))
          localEvents = [...dbEvents, ...filteredLocal]
        }
      } catch (err) {
        console.error("Failed to load events from database:", err)
      }

      // Initialize booked tickets for mock attendee
      const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
      let initialBookings: EventItem[] = []
      if (savedBooked) {
        initialBookings = JSON.parse(savedBooked)
      } else {
        // Default mock bookings (first two events)
        initialBookings = [localEvents[0], localEvents[3]].filter(Boolean)
        localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(initialBookings))
      }

      // Defer state updates to avoid set-state-in-effect warning
      setTimeout(() => {
        setEvents(localEvents)
        setBookedTickets(initialBookings)
      }, 0)
    }

    if (typeof window !== "undefined") {
      loadData()
    }
  }, [])

  const handleEventCreated = (newEvent: EventItem) => {
    const updated = [newEvent, ...events]
    setEvents(updated)
    localStorage.setItem("rotasphere_events", JSON.stringify(updated))
  }

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    localStorage.setItem("rotasphere_events", JSON.stringify(updated))
  }

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-radial-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Securing session...</p>
      </div>
    )
  }

  const userRole = user.role || "attendee"

  if (userRole === "organizer") {
    return (
      <OrganizerDashboard
        events={events}
        setEvents={setEvents}
        bookedTickets={bookedTickets}
        user={user}
        signOut={signOut}
      />
    )
  }

  const userInitials = user.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase() : "U"

  return (
    <>
      <Navbar onCreateEventClick={() => {
        if (userRole === "attendee") {
          alert("Only Organizers and Admins can create events. Change your account role in Sign Up.")
        } else {
          setIsCreateOpen(true)
        }
      }} />

      <main className="flex-grow pt-28 pb-16 bg-radial-grid relative overflow-hidden">
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          {/* Header Banner */}
          <div className="glass-card border border-white/20 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-background shadow-lg">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-foreground">{user.fullName}</h1>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    userRole === 'admin' 
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' 
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {userRole}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {userRole === "admin" && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="rounded-xl border-muted hover:bg-muted/50 text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* ==========================================
             1. ATTENDEE DASHBOARD
             ========================================== */}
          {userRole === "attendee" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Booked Events", val: bookedTickets.length, icon: Ticket, desc: "Active ticket reservations" },
                  { label: "Completed Events", val: 0, icon: Calendar, desc: "Past events attended" },
                  { label: "Gross Contribution", val: "$149.00", icon: DollarSign, desc: "Spent on registered tickets" }
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="glass-card border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                        <span className="text-3xl font-extrabold text-foreground mt-1.5 block">{s.val}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{s.desc}</span>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                )}
              </div>

              {/* Tickets Section */}
              <div className="glass-card border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-indigo-500" />
                  Your Active Event Passes
                </h3>

                {bookedTickets.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-medium">No tickets booked yet.</p>
                    <Link href="#events" className="text-indigo-500 text-xs font-bold hover:underline mt-2 inline-block">
                      Browse Upcoming Events
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookedTickets.map((evt, idx) => (
                      <div key={idx} className="relative glass-card border border-white/10 dark:bg-background/20 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
                        <div className="p-5 flex gap-4">
                          <img src={evt.image} alt={evt.title} className="h-16 w-16 rounded-xl object-cover border border-white/10" />
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10">
                              {evt.category}
                            </span>
                            <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-1">{evt.title}</h4>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{evt.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{evt.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Barcode Mock */}
                        <div className="border-t border-muted bg-muted/20 px-5 py-3 flex justify-between items-center">
                          <div className="font-mono text-[9px] text-muted-foreground leading-none">
                            <span className="block font-bold text-[10px] text-foreground mb-1">TICKET BARCODE</span>
                            <span>||||||| | |||| || ||||| | | EVT-{evt.id.toUpperCase()}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400">REGISTERED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}



          {/* ==========================================
             3. ADMIN DASHBOARD
             ========================================== */}
          {userRole === "admin" && (
            <div className="space-y-8 animate-fade-in">
              {/* Platform Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Global Platform Users", val: sysUsersCount, icon: UserCheck, color: "text-purple-500 bg-purple-500/10" },
                  { label: "Active Events Listed", val: events.length, icon: Calendar, color: "text-indigo-500 bg-indigo-500/10" },
                  { label: "Global Ticket Sales", val: events.reduce((sum, e) => sum + (e.attendees || 0), 0) + 1240, icon: Ticket, color: "text-emerald-500 bg-emerald-500/10" },
                  { label: "Platform Commission", val: "$124,840", icon: DollarSign, color: "text-amber-500 bg-amber-500/10" }
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="glass-card border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1.5 block">{s.val}</span>
                        <span className="text-[10px] text-emerald-400 font-medium block mt-1">Stripe verified</span>
                      </div>
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                )}
              </div>

              {/* Admin Global Control Board */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Events list manager */}
                <div className="lg:col-span-2 glass-card border border-white/10 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-500" />
                    Global Event Control Queue
                  </h3>

                  <div className="space-y-4">
                    {events.map((evt) => (
                      <div key={evt.id} className="flex justify-between items-center p-3 rounded-xl bg-background/40 border border-muted/50 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={evt.image} alt={evt.title} className="h-9 w-9 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-foreground block">{evt.title}</span>
                            <span className="text-[10px] text-muted-foreground">Organizer: {evt.organizer}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            ACTIVE
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Users Panel */}
                <div className="glass-card border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" />
                      Platform Users
                    </h3>

                    <div className="space-y-3">
                      {[
                        { name: "Sophia Martinez", role: "Organizer", email: "sophia@tech.io" },
                        { name: "David Chen", role: "Attendee", email: "dchen@gmail.com" },
                        { name: "Alex Rivera", role: "Attendee", email: "alex@rivera.com" },
                        { name: "Sarah Jenkins", role: "Admin", email: "sarah@rotasphere.com" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-background/20 border border-muted/30 text-xs">
                          <div>
                            <span className="font-bold text-foreground block">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground">{item.email}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            item.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            item.role === 'Organizer' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setSysUsersCount(prev => prev + 1)}
                    className="w-full rounded-xl mt-4 border-muted hover:bg-muted/50 text-foreground text-xs"
                  >
                    Simulate New User Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  )
}
