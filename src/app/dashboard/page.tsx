"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { getEventsAction, deleteEventAction } from "@/app/actions/eventActions"
import { getBookedTicketsAction } from "@/app/actions/paymentActions"
import { getAdminDashboardDataAction } from "@/app/actions/userActions"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { OrganizerDashboard } from "@/components/dashboard/OrganizerDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardCardSkeleton } from "@/components/skeletons/DashboardCardSkeleton"
import { TableSkeleton } from "@/components/skeletons/TableSkeleton"
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton"
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
  const [sysTicketSales, setSysTicketSales] = React.useState(1240)
  const [sysCommission, setSysCommission] = React.useState(124840)
  const [adminUsers, setAdminUsers] = React.useState<{ id: string; email: string; full_name: string; role: string; image_url?: string }[]>([])
  
  // Custom ticket registration details (phone, special requests, guest names)
  const [ticketDetails, setTicketDetails] = React.useState<Record<string, { phone: string; specialRequests: string; fullName: string; email: string; ticketCount: number }>>({})

  // Dynamic attendee statistics
  const totalSpent = React.useMemo(() => {
    return bookedTickets.reduce((sum, evt) => {
      if (evt.pricePaid !== undefined) {
        const val = typeof evt.pricePaid === "number" ? evt.pricePaid : parseFloat(String(evt.pricePaid).replace(/[^0-9.]/g, ""));
        return sum + (isNaN(val) ? 0 : val);
      }
      if (evt.price) {
        const val = parseFloat(evt.price.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(val) ? 0 : val);
      }
      return sum;
    }, 0);
  }, [bookedTickets]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDetails = localStorage.getItem("rotasphere_ticket_details")
      if (savedDetails) {
        setTicketDetails(JSON.parse(savedDetails))
      }
    }
  }, [bookedTickets])

  // Redirect unauthorized
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

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
              // Default mock bookings (first two events)
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

  // Load admin dashboard statistics and users
  React.useEffect(() => {
    async function loadAdminData() {
      if (user?.role !== "admin") return
      try {
        const res = await getAdminDashboardDataAction()
        if (res.success) {
          setAdminUsers(res.users || [])
          setSysUsersCount(res.usersCount ?? 0)
          setSysTicketSales(res.ticketsCount ?? 0)
          setSysCommission(res.commission ?? 0)
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err)
      }
    }

    if (isLoaded && user) {
      loadAdminData()
    }
  }, [user, isLoaded])

  const handleEventCreated = (newEvent: EventItem) => {
    const updated = [newEvent, ...events]
    setEvents(updated)
    localStorage.setItem("rotasphere_events", JSON.stringify(updated))
  }

  const handleDeleteEvent = async (id: string) => {
    const res = await deleteEventAction(id)
    if (res.success) {
      const updated = events.filter(e => e.id !== id)
      setEvents(updated)
      localStorage.setItem("rotasphere_events", JSON.stringify(updated))
    } else {
      alert(res.error || "Failed to delete event.")
    }
  }

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex bg-background">
        {/* Left Sidebar Skeleton (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex flex-col w-64 border-r border-border p-6 space-y-6">
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

        {/* Main Dashboard Panel Skeleton */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Stats metrics widgets row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>

          {/* Main content split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table / List column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <TableSkeleton rows={4} columns={4} />
            </div>
            
            {/* Analytics / Side panel column (1/3) */}
            <div className="space-y-6">
              <AnalyticsSkeleton />
            </div>
          </div>
        </div>
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

      <main className="flex-grow pt-28 pb-16 bg-background relative overflow-hidden">

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          {/* Header Banner */}
          <div className="border border-border bg-card rounded-[16px] p-6 md:p-8 shadow-none mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium border border-border">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-heading font-medium tracking-tight text-foreground">{user.fullName}</h1>
                  <span className={`font-mono text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    userRole === 'admin' 
                      ? 'bg-primary/10 border-border text-primary dark:text-white' 
                      : 'bg-accent/10 border-accent/20 text-accent'
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
                  className="rounded-full bg-primary hover:opacity-90 text-primary-foreground font-medium shadow-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="rounded-full border-border bg-transparent hover:bg-muted text-foreground"
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
                  { label: "Gross Contribution", val: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, desc: "Spent on registered tickets" }
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="border border-border bg-card p-5 rounded-[16px] flex items-center justify-between shadow-none">
                      <div>
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                        <span className="text-3xl font-heading font-medium tracking-tight text-foreground mt-1.5 block">{s.val}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{s.desc}</span>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                )}
              </div>

              {/* Tickets Section */}
              <div className="border border-border bg-card rounded-[16px] p-6 shadow-none">
                <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-accent" />
                  Your Active Event Passes
                </h3>

                {bookedTickets.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-medium">No tickets booked yet.</p>
                    <Link href="#events" className="text-accent text-xs font-medium hover:underline mt-2 inline-block">
                      Browse Upcoming Events
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookedTickets.map((evt, idx) => {
                      const code = evt.ticketCode || `EVT-${evt.id.toUpperCase()}`
                      const details = ticketDetails[code] || {}

                      return (
                        <div key={idx} className="relative border border-border bg-card rounded-[16px] overflow-hidden flex flex-col justify-between hover:border-accent transition-all duration-300 shadow-none">
                          <div className="p-5 flex gap-4">
                            <img src={evt.image} alt={evt.title} className="h-16 w-16 rounded-xl object-cover border border-border" />
                            <div className="space-y-1 flex-grow">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                                  {evt.category}
                                </span>
                                {evt.pricePaid !== undefined && (
                                  <span className="text-[10px] font-semibold text-muted-foreground">
                                    Paid: {evt.pricePaid === 0 ? "Free" : `${evt.pricePaid}`}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-foreground text-sm leading-snug line-clamp-1">{evt.title}</h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{evt.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{evt.location}</span>
                              </div>

                              {/* Attendee Details */}
                              <div className="border-t border-dashed border-border pt-2 mt-2 space-y-1 text-[11px] text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Guest:</span>
                                  <span className="font-medium text-foreground">{details.fullName || user.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Email:</span>
                                  <span className="font-medium text-foreground">{details.email || user.email}</span>
                                </div>
                                {details.phone && (
                                  <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span className="font-medium text-foreground">{details.phone}</span>
                                  </div>
                                )}
                                {details.specialRequests && (
                                  <div className="flex justify-between">
                                    <span>Notes:</span>
                                    <span className="font-medium text-amber-500 truncate max-w-[160px]">{details.specialRequests}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Barcode Mock */}
                          <div className="border-t border-border bg-muted/20 px-5 py-3 flex justify-between items-center">
                            <div className="font-mono text-[9px] text-muted-foreground leading-none">
                              <span className="block font-bold text-[10px] text-foreground mb-1">TICKET PASS CODE</span>
                              <span className="font-mono text-accent font-medium">{code}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400">REGISTERED</span>
                          </div>
                        </div>
                      )
                    })}
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
                  { label: "Global Platform Users", val: sysUsersCount, icon: UserCheck, color: "text-primary bg-primary/10" },
                  { label: "Active Events Listed", val: events.length, icon: Calendar, color: "text-accent bg-accent/10" },
                  { label: "Global Ticket Sales", val: sysTicketSales, icon: Ticket, color: "text-primary bg-primary/10" },
                  { label: "Platform Commission", val: typeof sysCommission === "number" ? `$${sysCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : sysCommission, icon: DollarSign, color: "text-accent bg-accent/10" }
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="border border-border bg-card p-5 rounded-[16px] flex items-center justify-between shadow-none">
                      <div>
                        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                        <span className="text-2xl font-heading font-medium tracking-tight text-foreground mt-1.5 block">{s.val}</span>
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
                <div className="lg:col-span-2 border border-border bg-card rounded-[16px] p-6 shadow-none">
                  <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    Global Event Control Queue
                  </h3>

                  <div className="space-y-4">
                    {events.map((evt) => (
                      <div key={evt.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 dark:bg-muted/10 border border-border text-xs">
                        <div className="flex items-center gap-3">
                          <img src={evt.image} alt={evt.title} className="h-9 w-9 rounded-lg object-cover" />
                          <div>
                            <span className="font-medium text-foreground block">{evt.title}</span>
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
                <div className="border border-border bg-card rounded-[16px] p-6 shadow-none flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Platform Users
                    </h3>

                    <div className="space-y-3">
                      {adminUsers.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-xs italic">
                          No platform users found
                        </div>
                      ) : (
                        adminUsers.map((item, idx) => {
                          const displayRole = item.role.charAt(0).toUpperCase() + item.role.slice(1)
                          const roleLower = item.role.toLowerCase()
                          return (
                            <div key={item.id || idx} className="flex justify-between items-center p-2.5 rounded-xl bg-muted/20 dark:bg-muted/10 border border-border text-xs">
                              <div>
                                <span className="font-medium text-foreground block">{item.full_name}</span>
                                <span className="text-[10px] text-muted-foreground">{item.email}</span>
                              </div>
                              <span className={`font-mono text-[9px] font-medium px-2 py-0.5 rounded-full border ${
                                roleLower === 'admin' ? 'bg-primary/10 text-primary border-border' :
                                roleLower === 'organizer' ? 'bg-accent/10 text-accent border-accent/20' :
                                'bg-muted-foreground/10 text-muted-foreground border-border'
                              }`}>
                                {displayRole}
                              </span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setSysUsersCount(prev => prev + 1)}
                    className="w-full rounded-full mt-4 border-border bg-transparent hover:bg-muted text-foreground text-xs"
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
