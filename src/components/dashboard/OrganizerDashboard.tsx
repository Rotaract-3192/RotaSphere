"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, MapPin, Users, DollarSign, Award, Ticket, 
  BarChart3, Plus, UserCheck, Trash2, 
  TrendingUp, LayoutDashboard, Settings, Menu, Bell, Search, 
  Sparkles, LogOut, Moon, Sun, ClipboardList, Info, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { EventItem } from "@/data/mockData"
import { cn } from "@/lib/utils"
import { MultiStepCreateEvent } from "./MultiStepCreateEvent"

interface OrganizerDashboardProps {
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  bookedTickets: EventItem[];
  user: {
    fullName: string;
    email: string;
    imageUrl?: string;
  };
  signOut: () => Promise<void>;
  initialView?: ViewType;
}

type ViewType = 'dashboard' | 'create-event' | 'manage-events' | 'tickets' | 'analytics' | 'attendees' | 'settings';

export function OrganizerDashboard({ events, setEvents, bookedTickets, user, signOut, initialView }: OrganizerDashboardProps) {
  const { theme, setTheme } = useTheme()
  const [activeView, setActiveView] = React.useState<ViewType>(initialView || 'dashboard')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Settings form states
  const [profileName, setProfileName] = React.useState(user.fullName)
  const [profileEmail, setProfileEmail] = React.useState(user.email)
  const [orgName, setOrgName] = React.useState("Rotasphere Events Org")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Mock global attendees database (local state)
  const [attendeeRegistry, setAttendeeRegistry] = React.useState([
    { id: "att-1", name: "Sarah Jenkins", email: "sarah@rotasphere.com", eventTitle: "NextGen Tech Summit 2026", date: "May 12, 2026", checkedIn: true },
    { id: "att-2", name: "David Chen", email: "dchen@gmail.com", eventTitle: "Decibel Music Festival 2026", date: "May 15, 2026", checkedIn: false },
    { id: "att-3", name: "Alex Rivera", email: "alex@rivera.com", eventTitle: "Global Food & Wine Festival", date: "May 18, 2026", checkedIn: true },
    { id: "att-4", name: "Marcus Vance", email: "marcus@decibel.io", eventTitle: "Decibel Music Festival 2026", date: "May 19, 2026", checkedIn: false },
    { id: "att-5", name: "Sophia Martinez", email: "sophia@tech.io", eventTitle: "NextGen Tech Summit 2026", date: "May 20, 2026", checkedIn: false }
  ])

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Parse price string to number for revenue calculation
  const parsePrice = (priceStr: string) => {
    if (priceStr.toLowerCase().includes("free")) return 0
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""))
    return isNaN(num) ? 0 : num
  }

  // Calculated stats metrics
  const totalEvents = events.length
  const totalTicketsSold = events.reduce((sum, e) => sum + (e.attendees || 0), 0)
  const totalRevenue = events.reduce((sum, e) => {
    return sum + (parsePrice(e.price) * (e.attendees || 0))
  }, 0)
  const activeAttendees = attendeeRegistry.filter(a => a.checkedIn).length

  // Navigation config
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-event' as ViewType, label: 'Create Event', icon: Plus },
    { id: 'manage-events' as ViewType, label: 'Manage Events', icon: ClipboardList },
    { id: 'tickets' as ViewType, label: 'Tickets', icon: Ticket },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
    { id: 'attendees' as ViewType, label: 'Attendees', icon: Users },
    { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  ]



  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    localStorage.setItem("rotasphere_events", JSON.stringify(updated))
    showToast("🗑️ Event removed successfully.")
  }

  const toggleCheckIn = (id: string) => {
    setAttendeeRegistry(prev => prev.map(a => 
      a.id === id ? { ...a, checkedIn: !a.checkedIn } : a
    ))
    showToast("Status updated successfully.")
  }

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    showToast("💾 Profile configurations saved!")
  }

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Brand logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            EventSphere
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "text-foreground/75 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Logout / User Info footer inside sidebar */}
      <div className="space-y-4 pt-4 border-t border-muted/50">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <span>{user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
            )}
          </div>
          <div className="truncate flex-1">
            <span className="block text-xs font-bold text-foreground truncate leading-snug">{user.fullName}</span>
            <span className="text-[10px] text-muted-foreground block truncate">Organizer</span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-screen border-r border-muted bg-background/50 backdrop-blur-xl p-4 sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-muted bg-background/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden rounded-xl border border-muted hover:bg-muted/50 h-9 w-9"
                  >
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                }
              />
              <SheetContent side="left" className="glass-card w-[260px] p-4 flex flex-col justify-between h-full">
                <SheetTitle className="sr-only">Organizer Menu</SheetTitle>
                {sidebarContent}
              </SheetContent>
            </Sheet>

            <h2 className="text-md md:text-lg font-bold text-foreground capitalize tracking-tight">
              {activeView.replace("-", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-muted bg-muted/20 w-64 text-xs text-muted-foreground focus-within:border-indigo-500/50 transition-colors">
              <Search className="h-3.5 w-3.5" />
              <input 
                type="text" 
                placeholder="Search panel..." 
                className="bg-transparent border-none outline-none w-full text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-muted hover:bg-muted/50 h-9 w-9"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </Button>

            {/* Notifications icon */}
            <button className="h-9 w-9 rounded-xl border border-muted hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground relative transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
            </button>
          </div>
        </header>

        {/* View Port Panel rendering with transition */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* ==========================================
                 1. OVERVIEW DASHBOARD VIEW
                 ========================================== */}
              {activeView === 'dashboard' && (
                <>
                  {/* Grid Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Events", value: totalEvents, desc: "Created active lists", icon: Calendar, color: "text-indigo-500 bg-indigo-500/10" },
                      { label: "Tickets Sold", value: totalTicketsSold, desc: "Attendee signups", icon: Ticket, color: "text-emerald-500 bg-emerald-500/10" },
                      { label: "Revenue Earned", value: `$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, desc: "Stripe payout value", icon: DollarSign, color: "text-amber-500 bg-amber-500/10" },
                      { label: "Active Attendees", value: activeAttendees, desc: "Checked-in guest counts", icon: UserCheck, color: "text-purple-500 bg-purple-500/10" }
                    ].map((card, i) => {
                      const Icon = card.icon
                      return (
                        <Card key={i} className="glass-card border-white/10 hover:border-indigo-500/20 transition-all shadow-md">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{card.label}</span>
                              <span className="text-xl md:text-2xl font-extrabold text-foreground block">{card.value}</span>
                              <span className="text-[9px] text-muted-foreground block">{card.desc}</span>
                            </div>
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", card.color)}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Summary & Overview Graph Placeholder */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Graph Mock */}
                    <Card className="lg:col-span-2 glass-card border-white/10 shadow-md p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-foreground">Sales Revenue Graph</h3>
                          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            +12.4% vs last week
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-6">
                          Daily ticket purchase metrics across all listed events for the past 7 days.
                        </p>
                      </div>

                      {/* Simulated Chart Bars */}
                      <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-muted pb-2">
                        {[
                          { day: "Mon", val: "h-[30%]" },
                          { day: "Tue", val: "h-[50%]" },
                          { day: "Wed", val: "h-[45%]" },
                          { day: "Thu", val: "h-[75%]" },
                          { day: "Fri", val: "h-[65%]" },
                          { day: "Sat", val: "h-[90%]" },
                          { day: "Sun", val: "h-[85%]" }
                        ].map((bar, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <div className={cn("w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-md transition-all duration-500 hover:from-indigo-600 hover:to-purple-700", bar.val)} />
                            <span className="text-[9px] text-muted-foreground font-semibold">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Right column: Quick overview info */}
                    <Card className="glass-card border-white/10 shadow-md p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Award className="h-4.5 w-4.5 text-indigo-500" />
                          Top Category Performance
                        </h3>
                        
                        <div className="space-y-3 mt-4 text-xs">
                          {[
                            { name: "Tech & Innovation", pct: 60, val: "1.2k sales" },
                            { name: "Music Festivals", pct: 30, val: "600 sales" },
                            { name: "Culinary & Foods", pct: 10, val: "200 sales" }
                          ].map((item, index) => (
                            <div key={index} className="space-y-1.5">
                              <div className="flex justify-between font-semibold">
                                <span className="text-foreground/80">{item.name}</span>
                                <span className="text-muted-foreground">{item.val} ({item.pct}%)</span>
                              </div>
                              <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setActiveView('create-event')}
                        className="w-full rounded-xl bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-semibold text-xs mt-6"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Publish a New Event
                      </Button>
                    </Card>
                  </div>

                  {/* Recent Bookings rows */}
                  <Card className="glass-card border-white/10 shadow-md p-5">
                    <h3 className="text-sm font-bold text-foreground mb-4">Recent Bookings Log</h3>
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-muted text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                            <th className="pb-2">Guest Name</th>
                            <th className="pb-2">Registered Event</th>
                            <th className="pb-2">Date Purchased</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/30">
                          {attendeeRegistry.slice(0, 3).map((item, idx) => (
                            <tr key={idx} className="hover:bg-muted/10">
                              <td className="py-2.5 font-bold text-foreground">{item.name}</td>
                              <td className="py-2.5 text-muted-foreground">{item.eventTitle}</td>
                              <td className="py-2.5 text-muted-foreground">{item.date}</td>
                              <td className="py-2.5 text-right">
                                <span className={cn(
                                  "inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                  item.checkedIn
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                                )}>
                                  {item.checkedIn ? "Checked In" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}

              {/* ==========================================
                 2. CREATE EVENT VIEW (FORM)
                 ========================================== */}
              {activeView === 'create-event' && (
                <MultiStepCreateEvent 
                  onSuccessRedirect={() => {
                    setActiveView('manage-events')
                    showToast("🎉 Event successfully created!")
                  }}
                  events={events}
                  setEvents={setEvents}
                  organizerName={orgName || user.fullName}
                />
              )}

              {/* ==========================================
                 3. MANAGE EVENTS VIEW
                 ========================================== */}
              {activeView === 'manage-events' && (
                <Card className="glass-card border-white/10 p-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-sm font-bold text-foreground">Active Event Listings</h3>
                    
                    {/* Search & Add CTA */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-muted bg-muted/20 text-xs text-muted-foreground w-full sm:w-60 focus-within:border-indigo-500/50 transition-colors">
                        <Search className="h-3.5 w-3.5" />
                        <input 
                          type="text" 
                          placeholder="Search events..." 
                          className="bg-transparent border-none outline-none w-full text-foreground"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => setActiveView('create-event')}
                        size="xs"
                        className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20 shrink-0 py-3.5"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Event
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-muted text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Event Details</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Tickets Sold</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/30">
                        {events
                          .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((evt) => {
                            const registeredPct = Math.min(100, Math.round((evt.attendees / parseInt(evt.capacity)) * 100))
                            return (
                              <tr key={evt.id} className="group hover:bg-muted/10">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <img src={evt.image} alt={evt.title} className="h-9 w-9 rounded-lg object-cover border border-white/10" />
                                    <div>
                                      <span className="font-bold text-foreground block group-hover:text-indigo-500 transition-colors">{evt.title}</span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-3 w-3" />
                                        {evt.location}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-muted-foreground">{evt.date}</td>
                                <td className="py-3">
                                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden flex mb-1">
                                    <div 
                                      className="bg-indigo-50 h-full rounded-full" 
                                      style={{ width: `${registeredPct}%` }} 
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground block">
                                    {evt.attendees} / {evt.capacity} seats ({registeredPct}%)
                                  </span>
                                </td>
                                <td className="py-3 font-semibold text-foreground">{evt.price}</td>
                                <td className="py-3 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDeleteEvent(evt.id)}
                                    className="rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ==========================================
                 4. TICKETS VIEW
                 ========================================== */}
              {activeView === 'tickets' && (
                <Card className="glass-card border-white/10 p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-foreground mb-4">Ticketing Audit Log</h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    Complete list of transaction receipts and generated active passes across platform bookings.
                  </p>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-muted text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Booking ID</th>
                          <th className="pb-3">Event Detail</th>
                          <th className="pb-3">Base Cost</th>
                          <th className="pb-3">Status Code</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/30">
                        {bookedTickets.map((evt, idx) => (
                          <tr key={idx} className="hover:bg-muted/10">
                            <td className="py-3 font-mono font-bold text-foreground">#EVT-{evt.id.toUpperCase()}-{idx}</td>
                            <td className="py-3">
                              <span className="font-bold text-foreground block">{evt.title}</span>
                              <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                            </td>
                            <td className="py-3 font-semibold text-foreground">{evt.price}</td>
                            <td className="py-3">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                CONFIRMED
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button 
                                onClick={() => showToast(`Simulating barcode scan for EVT-${evt.id}`)}
                                className="text-indigo-500 hover:underline font-semibold"
                              >
                                Scan Ticket
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ==========================================
                 5. ANALYTICS VIEW
                 ========================================== */}
              {activeView === 'analytics' && (
                <div className="space-y-6">
                  {/* Detailed Performance Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10 p-5 shadow-md">
                      <h3 className="text-sm font-bold text-foreground mb-4">Event Check-In Rates</h3>
                      <div className="space-y-4 text-xs mt-4">
                        {[
                          { title: "NextGen Tech Summit 2026", total: 1240, check: 980, pct: 79 },
                          { title: "Decibel Music Festival 2026", total: 4200, check: 3100, pct: 73 },
                          { title: "SaaS Growth & Startup Expo", total: 642, check: 580, pct: 90 }
                        ].map((evt, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-foreground/80 truncate max-w-[200px]">{evt.title}</span>
                              <span className="text-muted-foreground">{evt.check}/{evt.total} checked ({evt.pct}%)</span>
                            </div>
                            <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${evt.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="glass-card border-white/10 p-5 shadow-md">
                      <h3 className="text-sm font-bold text-foreground mb-4">Monthly Platform Growth</h3>
                      <div className="space-y-4 text-xs mt-4">
                        {[
                          { month: "January", total: 15, growth: "+12%" },
                          { month: "February", total: 18, growth: "+20%" },
                          { month: "March", total: 22, growth: "+22%" },
                          { month: "April", total: 29, growth: "+31%" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-muted/30">
                            <span className="font-bold text-foreground/80">{item.month}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{item.total} lists</span>
                              <span className="font-bold text-emerald-400">{item.growth}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* General summary alerts */}
                  <Card className="glass-card border-white/10 p-5 flex items-start gap-4">
                    <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1.5">
                      <h4 className="font-bold text-foreground">Analytics Data Resolution</h4>
                      <p className="text-muted-foreground">
                        Data updates every 15 minutes. To sync instant ticket transactions, click the refresh button on top header. Stripe commission deductions of 2.9% + $0.30 apply.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* ==========================================
                 6. ATTENDEES VIEW
                 ========================================== */}
              {activeView === 'attendees' && (
                <Card className="glass-card border-white/10 p-5 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Attendee Registry</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Toggle check-in status directly when checking in guests at the gate.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-muted text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Guest</th>
                          <th className="pb-3">Email Address</th>
                          <th className="pb-3">Event Registered</th>
                          <th className="pb-3">Date Registered</th>
                          <th className="pb-3 text-right">Gate Check-In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/30">
                        {attendeeRegistry.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/10">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
                                  {item.name.charAt(0)}
                                </div>
                                <span className="font-bold text-foreground">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-muted-foreground">{item.email}</td>
                            <td className="py-3 text-muted-foreground">{item.eventTitle}</td>
                            <td className="py-3 text-muted-foreground">{item.date}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => toggleCheckIn(item.id)}
                                className={cn(
                                  "inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors",
                                  item.checkedIn
                                    ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-muted/50 border-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {item.checkedIn ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Checked In
                                  </>
                                ) : (
                                  "Check In"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ==========================================
                 7. SETTINGS VIEW
                 ========================================== */}
              {activeView === 'settings' && (
                <Card className="glass-card border-white/10 p-6 shadow-lg max-w-xl mx-auto">
                  <h3 className="font-bold text-sm text-foreground mb-4 pb-3 border-b border-muted/50">Organization & Account Settings</h3>
                  
                  <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs text-foreground">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Organizer Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-xl border border-muted bg-background/50 focus:border-indigo-500 focus:outline-none"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                      <span className="text-[10px] text-muted-foreground">This name is appended onto your published events.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Profile Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-xl border border-muted bg-background/50 focus:border-indigo-500 focus:outline-none"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Profile Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-3 py-2 rounded-xl border border-muted bg-background/50 focus:border-indigo-500 focus:outline-none"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] block">Security Preference</label>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/15">
                          2FA Enabled
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-bold border border-slate-500/15">
                          OAuth Login Active
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-muted/50 flex gap-3">
                      <Button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/25"
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
