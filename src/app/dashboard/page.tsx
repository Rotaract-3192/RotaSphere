"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { EventItem, mockEvents } from "@/data/mockData"
import { 
  getEventsAction, 
  deleteEventAction, 
  reviewEventAction,
  submitEventForApprovalAction
} from "@/app/actions/eventActions"
import { getBookedTicketsAction } from "@/app/actions/paymentActions"
import { 
  getAdminDashboardDataAction,
  approveUserAction,
  rejectUserAction,
  changeUserRoleAction,
  suspendUserAction,
  getAuditLogsAction,
  UserRole,
  UserStatus
} from "@/app/actions/userActions"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { OrganizerDashboard } from "@/components/dashboard/OrganizerDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardCardSkeleton } from "@/components/skeletons/DashboardCardSkeleton"
import { TableSkeleton } from "@/components/skeletons/TableSkeleton"
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton"
import { 
  Calendar, MapPin, Users, DollarSign, IndianRupee, Ticket, 
  Plus, ShieldCheck, UserCheck, Trash2, AlertCircle,
  BarChart3, ClipboardList, Info, Check, Lock, Shield,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isSignedIn, isLoaded, signOut } = useAuthSession()
  const router = useRouter()

  const [events, setEvents] = React.useState<EventItem[]>([])
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [bookedTickets, setBookedTickets] = React.useState<EventItem[]>([])
  
  // Admin stats & users
  const [sysUsersCount, setSysUsersCount] = React.useState(124)
  const [sysTicketSales, setSysTicketSales] = React.useState(1240)
  const [sysCommission, setSysCommission] = React.useState(124840)
  const [sysSalesByDay, setSysSalesByDay] = React.useState<{ day: string; amount: number }[]>([])
  const [adminUsers, setAdminUsers] = React.useState<{ id: string; email: string; full_name: string; role: UserRole; status: UserStatus; image_url?: string }[]>([])
  const [auditLogs, setAuditLogs] = React.useState<any[]>([])
  const [activeTab, setActiveTab] = React.useState<'users' | 'events' | 'audit' | 'analytics'>('analytics')
  
  // Inline review notes state for each event ID
  const [reviewNotes, setReviewNotes] = React.useState<Record<string, string>>({})
  
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

  // Fetch initial event and booking data
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
  const loadAdminData = React.useCallback(async () => {
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") return
    try {
      const res = await getAdminDashboardDataAction()
      if (res.success) {
        setAdminUsers(res.users || [])
        setSysUsersCount(res.usersCount ?? 0)
        setSysTicketSales(res.ticketsCount ?? 0)
        setSysCommission(res.commission ?? 0)
        setSysSalesByDay(res.salesByDay || [])
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err)
    }
  }, [user])

  React.useEffect(() => {
    if (isLoaded && user) {
      loadAdminData()
    }
  }, [user, isLoaded, loadAdminData])

  // Load Audit logs for Super Admin
  React.useEffect(() => {
    async function loadAuditLogs() {
      if (user?.role !== "SUPER_ADMIN" || activeTab !== "audit") return
      try {
        const res = await getAuditLogsAction()
        if (res.success) {
          setAuditLogs(res.auditLogs || [])
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err)
      }
    }
    if (isLoaded && user) {
      loadAuditLogs()
    }
  }, [user, isLoaded, activeTab])

  // Administrative handlers
  const handleApproveUser = async (clerkId: string, role: UserRole) => {
    try {
      const res = await approveUserAction(clerkId, role)
      if (res.success) {
        await loadAdminData()
      } else {
        alert(res.error || "Failed to approve user.")
      }
    } catch (e) {
      alert("An error occurred during approval.")
    }
  }

  const handleRejectUser = async (clerkId: string) => {
    if (!confirm("Are you sure you want to reject this user registration?")) return
    try {
      const res = await rejectUserAction(clerkId)
      if (res.success) {
        await loadAdminData()
      } else {
        alert(res.error || "Failed to reject user.")
      }
    } catch (e) {
      alert("An error occurred.")
    }
  }

  const handleChangeRole = async (clerkId: string, role: UserRole) => {
    try {
      const res = await changeUserRoleAction(clerkId, role)
      if (res.success) {
        await loadAdminData()
      } else {
        alert(res.error || "Failed to change user role.")
      }
    } catch (e) {
      alert("An error occurred.")
    }
  }

  const handleSuspendUser = async (clerkId: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return
    try {
      const res = await suspendUserAction(clerkId)
      if (res.success) {
        await loadAdminData()
      } else {
        alert(res.error || "Failed to suspend user.")
      }
    } catch (e) {
      alert("An error occurred.")
    }
  }

  const handleReviewEvent = async (eventId: string, action: 'approve' | 'reject' | 'request_changes', notes?: string) => {
    try {
      const res = await reviewEventAction(eventId, action, notes)
      if (res.success) {
        // Refresh event data
        const eventRes = await getEventsAction()
        if (eventRes.success) {
          setEvents(eventRes.events as EventItem[])
        }
      } else {
        alert(res.error || "Failed to review event.")
      }
    } catch (e) {
      alert("An error occurred reviewing event.")
    }
  }

  const handleEventCreated = (newEvent: EventItem) => {
    const updated = [newEvent, ...events]
    setEvents(updated)
    localStorage.setItem("rotasphere_events", JSON.stringify(updated))
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    const res = await deleteEventAction(id)
    if (res.success) {
      const updated = events.filter(e => e.id !== id)
      setEvents(updated)
      localStorage.setItem("rotasphere_events", JSON.stringify(updated))
    } else {
      alert(res.error || "Failed to delete event.")
    }
  }

  // Intercept PENDING, REJECTED, SUSPENDED statuses:
  if (isLoaded && user && user.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F8FBFF] dark:bg-[#06101F] text-foreground">
        <Navbar onCreateEventClick={() => {}} />
        <main className="flex-grow pt-32 pb-16 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-6 text-center">
            <div className="h-16 w-16 bg-[#1E88E5]/10 border border-[#1E88E5]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1E88E5]">
              <AlertCircle className="h-8 w-8" />
            </div>
            {user.status === "PENDING" && (
              <>
                <h1 className="text-2xl font-heading font-semibold mb-3">Approval Pending</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Thank you for registering on RotaSphere! Your account is currently pending administrator approval.
                  You will receive full access to the district platform once your profile is verified.
                </p>
                <div className="text-xs bg-[#17458F]/5 border border-[#17458F]/10 rounded-xl p-3 inline-block font-medium text-muted-foreground">
                  Logged in as: <span className="text-[#1E88E5] font-semibold">{user.email}</span>
                </div>
              </>
            )}
            {user.status === "SUSPENDED" && (
              <>
                <h1 className="text-2xl font-heading font-semibold text-destructive mb-3">Account Suspended</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Your account has been suspended by a platform administrator. If you believe this is an error or wish to appeal, please contact the district team.
                </p>
              </>
            )}
            {user.status === "REJECTED" && (
              <>
                <h1 className="text-2xl font-heading font-semibold text-destructive mb-3">Access Denied</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Your registration request has been rejected by the district administrators. You do not have permissions to access the platform dashboards.
                </p>
              </>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="rounded-full border-border bg-transparent hover:bg-muted text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex bg-background">
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
        <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const userRole = (user.role || "ATTENDEE").toUpperCase()

  // ROUTE TO ORGANIZER VIEW
  if (userRole === "ORGANIZER") {
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
  const isPlatformAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"

  return (
    <>
      <Navbar onCreateEventClick={() => {
        if (!isPlatformAdmin) {
          alert("Only Organizers and Admins can create events directly.")
        } else {
          setIsCreateOpen(true)
        }
      }} />

      <main className="flex-grow pt-28 pb-16 bg-[#F8FBFF] dark:bg-[#081A33] relative overflow-hidden">
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
                  <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    userRole === 'SUPER_ADMIN' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                      : 'bg-primary/10 border-border text-primary dark:text-white'
                  }`}>
                    {userRole.replace("_", " ")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isPlatformAdmin && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-full bg-accent hover:opacity-90 text-white font-semibold shadow-none border border-accent/20"
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
             1. ADMINISTRATIVE DASHBOARD (ADMIN & SUPER ADMIN)
             ========================================== */}
          {isPlatformAdmin && (
            <div className="space-y-8 animate-fade-in">
              {/* Tab Navigation */}
              <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
                    activeTab === 'analytics'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  District Analytics
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
                    activeTab === 'users'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  User Accounts
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
                    activeTab === 'events'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Event Moderation Queue
                </button>
                {userRole === "SUPER_ADMIN" && (
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
                      activeTab === 'audit'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Audit Logs
                  </button>
                )}
              </div>

              {/* 1.1 District Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: "Active District Users", val: sysUsersCount, icon: UserCheck, color: "text-accent bg-accent/10 border-accent/15" },
                      { label: "Active Events Listed", val: events.length, icon: Calendar, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/15" },
                      { label: "District Ticket Sales", val: sysTicketSales, icon: Ticket, color: "text-[#1E88E5] bg-[#1E88E5]/10 border-[#1E88E5]/15" },
                      { label: "District Commission (10%)", val: typeof sysCommission === "number" ? `₹${sysCommission.toLocaleString()}` : sysCommission, icon: IndianRupee, color: "text-amber-500 bg-amber-500/10 border-amber-500/15" }
                    ].map((s, i) => {
                      const Icon = s.icon
                      return (
                        <div key={i} className="border border-border bg-card p-5 rounded-[16px] flex items-center justify-between shadow-none">
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">{s.label}</span>
                            <span className="text-2xl font-heading font-medium tracking-tight text-foreground mt-1.5 block">{s.val}</span>
                            <span className="text-[10px] text-emerald-400 font-medium block mt-1">Stripe Verified</span>
                          </div>
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${s.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border border-border bg-card rounded-[16px] p-5 flex flex-col justify-between shadow-none">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-heading font-medium text-foreground">Sales Revenue Graph</h3>
                          {(() => {
                            const hasSales = (sysSalesByDay || []).some(b => b.amount > 0);
                            if (hasSales) {
                              return (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  Active Sales
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                No Sales Yet
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-6">
                          Daily ticket purchase metrics across all listed events for the past 7 days.
                        </p>
                      </div>

                      <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-border pb-2">
                        {(() => {
                          const maxAmount = Math.max(...(sysSalesByDay || []).map(b => b.amount), 0);
                          const defaultBars = [
                            { day: "Mon", amount: 0 },
                            { day: "Tue", amount: 0 },
                            { day: "Wed", amount: 0 },
                            { day: "Thu", amount: 0 },
                            { day: "Fri", amount: 0 },
                            { day: "Sat", amount: 0 },
                            { day: "Sun", amount: 0 }
                          ];
                          const barsToRender = (sysSalesByDay && sysSalesByDay.length === 7) ? sysSalesByDay : defaultBars;

                          return barsToRender.map((bar, idx) => {
                            const heightPct = maxAmount > 0 ? Math.round((bar.amount / maxAmount) * 100) : 0;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                <div 
                                  className="w-full bg-accent rounded-t-sm transition-all duration-500 hover:opacity-85" 
                                  style={{ height: `${heightPct}%` }}
                                  title={`₹${bar.amount.toLocaleString()}`}
                                />
                                <span className="text-[9px] text-muted-foreground font-semibold">{bar.day}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="border border-border bg-card shadow-none p-5 flex flex-col justify-between rounded-[16px]">
                      <div className="space-y-4">
                        <h3 className="text-sm font-heading font-medium text-foreground flex items-center gap-2">
                          <Shield className="h-4.5 w-4.5 text-accent" />
                          Platform Security Status
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          All systems active. Clerk authentication is guarding credentials, and RBAC controls restrict resource manipulations securely.
                        </p>
                        <div className="border-t border-border pt-4 mt-2 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Super Admins:</span>
                            <span className="font-semibold text-foreground">1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Admins:</span>
                            <span className="font-semibold text-foreground">{adminUsers.filter(u => u.role === "ADMIN").length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Organizers:</span>
                            <span className="font-semibold text-foreground">{adminUsers.filter(u => u.role === "ORGANIZER").length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1.2 User Accounts Tab */}
              {activeTab === 'users' && (
                <div className="border border-border bg-card rounded-[16px] p-6 shadow-none">
                  <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    District Accounts Console
                  </h3>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-3">
                          <th className="pb-3">User Profile</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Role Change Actions</th>
                          <th className="pb-3 text-right">Approval Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {adminUsers.map((item) => {
                          const status = item.status || 'PENDING'
                          const role = item.role || 'PENDING_USER'
                          const isSelf = item.id === user.id
                          return (
                            <tr key={item.id} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                              <td className="py-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-[10px]">
                                    {item.full_name ? item.full_name.charAt(0).toUpperCase() : "?"}
                                  </div>
                                  <div>
                                    <span className="block">{item.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground block font-normal">{item.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`font-mono text-[9px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  role === 'ADMIN' ? 'bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20' :
                                  role === 'ORGANIZER' ? 'bg-accent/10 text-accent border-accent/20' :
                                  role === 'ATTENDEE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  {role.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`font-mono text-[9px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                  status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse' :
                                  status === 'SUSPENDED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="py-4">
                                {!isSelf && role !== "SUPER_ADMIN" && (
                                  <select
                                    value={role}
                                    onChange={(e) => handleChangeRole(item.id, e.target.value as UserRole)}
                                    disabled={role === "ADMIN" && userRole !== "SUPER_ADMIN"}
                                    className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-accent"
                                  >
                                    <option value="ATTENDEE">Attendee</option>
                                    <option value="ORGANIZER">Organizer</option>
                                    <option value="PENDING_USER">Pending User</option>
                                    {userRole === "SUPER_ADMIN" && <option value="ADMIN">Admin</option>}
                                  </select>
                                )}
                              </td>
                              <td className="py-4 text-right">
                                {!isSelf && role !== "SUPER_ADMIN" && (
                                  <div className="flex justify-end gap-2">
                                    {status === "PENDING" && (
                                      <>
                                        <Button 
                                          size="xs"
                                          className="bg-[#1E88E5] text-white hover:opacity-90 rounded-lg px-3 py-1 font-semibold text-[10px]"
                                          onClick={() => handleApproveUser(item.id, "ORGANIZER")}
                                        >
                                          Approve Org
                                        </Button>
                                        <Button 
                                          size="xs"
                                          className="bg-emerald-500 text-white hover:opacity-90 rounded-lg px-3 py-1 font-semibold text-[10px]"
                                          onClick={() => handleApproveUser(item.id, "ATTENDEE")}
                                        >
                                          Approve Att
                                        </Button>
                                        <Button 
                                          size="xs"
                                          variant="destructive"
                                          className="rounded-lg px-3 py-1 font-semibold text-[10px]"
                                          onClick={() => handleRejectUser(item.id)}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {status === "ACTIVE" && (
                                      <Button 
                                        size="xs"
                                        variant="outline"
                                        className="rounded-lg px-3 py-1 font-semibold text-[10px] text-destructive hover:bg-destructive/10 border-destructive/20"
                                        onClick={() => handleSuspendUser(item.id)}
                                      >
                                        Suspend
                                      </Button>
                                    )}
                                    {status === "SUSPENDED" && (
                                      <Button 
                                        size="xs"
                                        className="bg-emerald-500 text-white hover:opacity-90 rounded-lg px-3 py-1 font-semibold text-[10px]"
                                        onClick={() => handleApproveUser(item.id, role)}
                                      >
                                        Un-suspend
                                      </Button>
                                    )}
                                    {status === "REJECTED" && (
                                      <Button 
                                        size="xs"
                                        className="bg-emerald-500 text-white hover:opacity-90 rounded-lg px-3 py-1 font-semibold text-[10px]"
                                        onClick={() => handleApproveUser(item.id, role)}
                                      >
                                        Activate
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 1.3 Event Moderation Queue Tab */}
              {activeTab === 'events' && (
                <div className="border border-border bg-card rounded-[16px] p-6 shadow-none">
                  <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    District Event Moderation Console
                  </h3>

                  <div className="space-y-6">
                    {/* Events Awaiting Approval */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Awaiting Approval ({events.filter(e => e.status === "PENDING_APPROVAL").length})
                      </h4>

                      {events.filter(e => e.status === "PENDING_APPROVAL").length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                          No events currently awaiting administrative approval.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {events.filter(e => e.status === "PENDING_APPROVAL").map((evt) => (
                            <div key={evt.id} className="border border-border bg-card rounded-xl p-4 flex flex-col justify-between hover:border-accent transition-all duration-300">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                <div className="flex items-center gap-3">
                                  <img src={evt.image} alt={evt.title} className="h-12 w-12 rounded-lg object-cover border border-border" />
                                  <div>
                                    <span className="font-semibold text-foreground block text-sm">{evt.title}</span>
                                    <span className="text-[10px] text-muted-foreground">Organizer: {evt.organizer} | Category: {evt.category}</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">Time: {evt.date} at {evt.location}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button 
                                    size="xs"
                                    className="bg-emerald-500 hover:opacity-90 text-white rounded-lg px-3 py-1.5 font-semibold text-[10px] shadow-none"
                                    onClick={() => handleReviewEvent(evt.id, "approve")}
                                  >
                                    Approve & Publish
                                  </Button>
                                  <Button 
                                    size="xs"
                                    variant="destructive"
                                    className="rounded-lg px-3 py-1.5 font-semibold text-[10px] shadow-none"
                                    onClick={() => handleReviewEvent(evt.id, "reject")}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>

                              {/* Request Changes block */}
                              <div className="mt-4 pt-3 border-t border-dashed border-border/80 flex flex-col sm:flex-row gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Specify changes needed (e.g. Add banner, edit capacity details)" 
                                  value={reviewNotes[evt.id] || ""}
                                  onChange={(e) => setReviewNotes(prev => ({ ...prev, [evt.id]: e.target.value }))}
                                  className="flex-grow bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                                />
                                <Button 
                                  onClick={() => handleReviewEvent(evt.id, 'request_changes', reviewNotes[evt.id])}
                                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-1.5 text-xs font-semibold shadow-none shrink-0"
                                >
                                  Request Changes
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* All Other Events */}
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        All District Listings ({events.length})
                      </h4>
                      <div className="space-y-3">
                        {events.map((evt) => {
                          const status = evt.status || 'DRAFT'
                          return (
                            <div key={evt.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border text-xs">
                              <div className="flex items-center gap-3">
                                <img src={evt.image} alt={evt.title} className="h-9 w-9 rounded-lg object-cover" />
                                <div>
                                  <span className="font-semibold text-foreground block">{evt.title}</span>
                                  <span className="text-[10px] text-muted-foreground">Organizer: {evt.organizer}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                                  status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  'bg-muted border-border text-muted-foreground'
                                }`}>
                                  {status}
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
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1.4 Audit Logs Tab */}
              {activeTab === 'audit' && userRole === "SUPER_ADMIN" && (
                <div className="border border-border bg-card rounded-[16px] p-6 shadow-none">
                  <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-accent" />
                    Security Audit Trail Log
                  </h3>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-3">
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3">Administrator</th>
                          <th className="pb-3">Action Type</th>
                          <th className="pb-3">Target Reference</th>
                          <th className="pb-3 text-right">Details Payload</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                              No security logs compiled.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/20 dark:hover:bg-muted/10 font-mono text-[11px]">
                              <td className="py-3 text-muted-foreground">
                                {new Date(log.created_at || log.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 text-foreground">{log.user_email || log.userEmail}</td>
                              <td className="py-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                  log.action === "APPROVE_USER" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                  log.action === "ROLE_CHANGE" ? "bg-[#1E88E5]/10 text-[#1E88E5]" :
                                  log.action === "REVIEW_EVENT" ? "bg-amber-500/10 text-amber-500" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 text-muted-foreground truncate max-w-[120px]">{log.target_id || log.targetId}</td>
                              <td className="py-3 text-right text-muted-foreground">
                                {JSON.stringify(log.details)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
             2. ATTENDEE DASHBOARD (ACTIVE ATTENDEE)
             ========================================== */}
          {userRole === "ATTENDEE" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Booked Events", val: bookedTickets.length, icon: Ticket, desc: "Active ticket reservations" },
                  { label: "Completed Events", val: 0, icon: Calendar, desc: "Past events attended" },
                  { label: "Gross Contribution", val: `₹${totalSpent.toLocaleString()}`, icon: IndianRupee, desc: "Spent on registered tickets" }
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

              <div className="border border-border bg-card rounded-[16px] p-6 shadow-none">
                <h3 className="text-lg font-heading font-medium tracking-tight text-foreground mb-6 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-accent" />
                  Your Active Event Passes
                </h3>

                {bookedTickets.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-medium">No tickets booked yet.</p>
                    <Link href="/events" className="text-accent text-xs font-medium hover:underline mt-2 inline-block">
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
