"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, MapPin, Users, DollarSign, IndianRupee, Award, Ticket, 
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
import { deleteEventAction, submitEventForApprovalAction } from "@/app/actions/eventActions"

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



  const handleDeleteEvent = async (id: string) => {
    const res = await deleteEventAction(id)
    if (res.success) {
      const updated = events.filter(e => e.id !== id)
      setEvents(updated)
      localStorage.setItem("rotasphere_events", JSON.stringify(updated))
      showToast("🗑️ Event removed successfully.")
    } else {
      showToast(`❌ Failed to delete: ${res.error}`)
    }
  }

  const handleSubmitForApproval = async (id: string) => {
    try {
      const res = await submitEventForApprovalAction(id)
      if (res.success) {
        showToast("✈️ Event submitted for approval!")
        // Update local events list state
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "PENDING_APPROVAL" } : e))
      } else {
        showToast(`❌ Failed to submit: ${res.error}`)
      }
    } catch (err) {
      showToast("❌ Failed to submit event.")
    }
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

  const renderSidebar = (isMobile: boolean) => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div className={cn("flex items-center gap-2 py-3", isMobile ? "px-2" : "px-2 lg:px-2 justify-center lg:justify-start")}>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-white border border-border flex items-center justify-center shrink-0">
            <img
              src="/rotasphere-logo.png"
              alt="RotaSphere Logo"
              className="h-full w-full object-cover object-top scale-125 origin-top"
            />
          </div>
          <span className={cn(
            "font-heading font-medium text-lg tracking-tight text-foreground truncate",
            isMobile ? "inline-block" : "hidden lg:inline-block"
          )}>
            RotaSphere
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
                  "w-full flex items-center rounded-full text-sm font-medium transition-all duration-200",
                  isMobile
                    ? "justify-start gap-3 px-3.5 py-2.5"
                    : "justify-center lg:justify-start gap-0 lg:gap-3 px-0 py-2.5 lg:px-3.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50"
                )}
                title={isMobile ? undefined : item.label}
              >
                <Icon className={cn("h-4 w-4 shrink-0", !isMobile && "mx-auto lg:mx-0")} />
                <span className={isMobile ? "inline-block" : "hidden lg:inline-block"}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Logout / User Info footer inside sidebar */}
      <div className="space-y-4 pt-4 border-t border-muted/50">
        <div className={cn("flex items-center gap-3", isMobile ? "px-2" : "px-0 lg:px-2 justify-center lg:justify-start")}>
          <div className="h-9 w-9 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-medium text-xs overflow-hidden shrink-0">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <span>{user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
            )}
          </div>
          <div className={cn("truncate flex-1", isMobile ? "block" : "hidden lg:block")}>
            <span className="block text-xs font-bold text-foreground truncate leading-snug">{user.fullName}</span>
            <span className="text-[10px] text-muted-foreground block truncate">Organizer</span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className={cn(
            "w-full flex items-center text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors rounded-xl py-2",
            isMobile
              ? "justify-start gap-3 px-3"
              : "justify-center lg:justify-start gap-0 lg:gap-3 px-0 lg:px-3"
          )}
          title={isMobile ? undefined : "Sign Out"}
        >
          <LogOut className={cn("h-4 w-4 shrink-0", !isMobile && "mx-auto lg:mx-0")} />
          <span className={isMobile ? "inline-block" : "hidden lg:inline-block"}>
            Sign Out
          </span>
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
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-none border border-border flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-16 lg:w-64 h-screen border-r border-border bg-card p-3 lg:p-4 sticky top-0 shrink-0 transition-all duration-300">
        {renderSidebar(false)}
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
                {renderSidebar(true)}
              </SheetContent>
            </Sheet>

            <h2 className="text-md md:text-lg font-heading font-medium text-foreground capitalize tracking-tight">
              {activeView.replace("-", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-muted bg-muted/20 w-64 text-xs text-muted-foreground focus-within:border-accent transition-colors">
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
                <Moon className="h-4 w-4 text-accent" />
              )}
            </Button>

            {/* Notifications icon */}
            <button className="h-9 w-9 rounded-xl border border-muted hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground relative transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
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
                      { label: "Total Events", value: totalEvents, desc: "Created active lists", icon: Calendar, color: "text-accent bg-accent/10" },
                      { label: "Tickets Sold", value: totalTicketsSold, desc: "Attendee signups", icon: Ticket, color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" },
                      { label: "Revenue Earned", value: `₹${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, desc: "Stripe payout value", icon: IndianRupee, color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
                      { label: "Active Attendees", value: activeAttendees, desc: "Checked-in guest counts", icon: UserCheck, color: "text-secondary bg-secondary/10" }
                    ].map((card, i) => {
                      const Icon = card.icon
                      return (
                        <Card key={i} className="border border-border bg-card hover:border-accent transition-all duration-300 shadow-none rounded-[16px]">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{card.label}</span>
                              <span className="text-xl md:text-2xl font-heading font-medium tracking-tight text-foreground block">{card.value}</span>
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
                    <Card className="lg:col-span-2 border border-border bg-card shadow-none p-5 flex flex-col justify-between rounded-[16px]">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-heading font-medium text-foreground">Sales Revenue Graph</h3>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            +12.4% vs last week
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-6">
                          Daily ticket purchase metrics across all listed events for the past 7 days.
                        </p>
                      </div>

                      {/* Simulated Chart Bars */}
                      <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-border pb-2">
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
                            <div className={cn("w-full bg-accent rounded-t-sm transition-all duration-500 hover:opacity-85", bar.val)} />
                            <span className="text-[9px] text-muted-foreground font-semibold">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Right column: Quick overview info */}
                    <Card className="border border-border bg-card shadow-none p-5 flex flex-col justify-between rounded-[16px]">
                      <div className="space-y-4">
                        <h3 className="text-sm font-heading font-medium text-foreground flex items-center gap-2">
                          <Award className="h-4.5 w-4.5 text-accent" />
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
                                <div className="bg-accent h-full rounded-full" style={{ width: `${item.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setActiveView('create-event')}
                        className="w-full rounded-full bg-transparent hover:bg-primary hover:text-primary-foreground border border-border text-foreground font-medium text-xs mt-6 shadow-none"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Publish a New Event
                      </Button>
                    </Card>
                  </div>

                  {/* Recent Bookings rows */}
                  <Card className="border border-border bg-card shadow-none p-5 rounded-[16px]">
                    <h3 className="text-sm font-heading font-medium text-foreground mb-4">Recent Bookings Log</h3>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                            <th className="pb-2">Guest Name</th>
                            <th className="pb-2">Registered Event</th>
                            <th className="pb-2">Date Purchased</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {attendeeRegistry.slice(0, 3).map((item, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                              <td className="py-2.5 font-medium text-foreground">{item.name}</td>
                              <td className="py-2.5 text-muted-foreground">{item.eventTitle}</td>
                              <td className="py-2.5 text-muted-foreground">{item.date}</td>
                              <td className="py-2.5 text-right">
                                <span className={cn(
                                  "inline-block text-[9px] font-mono font-medium px-2.5 py-0.5 rounded-full border",
                                  item.checkedIn
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                )}>
                                  {item.checkedIn ? "Checked In" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden space-y-3">
                      {attendeeRegistry.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 dark:bg-muted/5 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-foreground block">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground block mt-0.5">{item.eventTitle}</span>
                            </div>
                            <span className={cn(
                              "text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0",
                              item.checkedIn
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                            )}>
                              {item.checkedIn ? "Checked In" : "Pending"}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                            <span>Date Purchased</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      ))}
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
                <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-sm font-heading font-medium text-foreground">Active Event Listings</h3>
                    
                    {/* Search & Add CTA */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/20 dark:bg-muted/10 text-xs text-muted-foreground w-full sm:w-60 focus-within:border-accent transition-colors">
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
                        className="rounded-full bg-primary hover:opacity-90 text-primary-foreground font-medium shadow-none shrink-0 py-3.5"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Event
                      </Button>
                    </div>
                       {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Event Details</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Tickets Sold</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {events
                          .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((evt) => {
                            const registeredPct = Math.min(100, Math.round((evt.attendees / parseInt(evt.capacity)) * 100))
                            const status = evt.status || 'DRAFT'
                            return (
                              <tr key={evt.id} className="group hover:bg-muted/20 dark:hover:bg-muted/10">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <img src={evt.image} alt={evt.title} className="h-9 w-9 rounded-lg object-cover border border-border" />
                                    <div>
                                      <span className="font-medium text-foreground block group-hover:text-accent transition-colors">{evt.title}</span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-3 w-3" />
                                        {evt.location}
                                      </span>
                                      {evt.reviewNotes && (status === 'DRAFT' || status === 'REJECTED') && (
                                        <span className="text-[10px] text-amber-500 font-medium block mt-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl max-w-xs leading-normal">
                                          Feedback: "{evt.reviewNotes}"
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-muted-foreground">{evt.date}</td>
                                <td className="py-3">
                                  <span className={cn(
                                    "inline-block text-[9px] font-mono font-medium px-2.5 py-0.5 rounded-full border",
                                    status === "PUBLISHED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                    status === "PENDING_APPROVAL" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse" :
                                    status === "REJECTED" ? "bg-destructive/10 border-destructive/20 text-destructive" :
                                    "bg-muted border-border text-muted-foreground"
                                  )}>
                                    {status === "PUBLISHED" ? "PUBLISHED" :
                                     status === "PENDING_APPROVAL" ? "PENDING APPROVAL" :
                                     status === "REJECTED" ? "REJECTED" : "DRAFT"}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden flex mb-1">
                                    <div 
                                      className="bg-accent h-full rounded-full" 
                                      style={{ width: `${registeredPct}%` }} 
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground block">
                                    {evt.attendees} / {evt.capacity} seats ({registeredPct}%)
                                  </span>
                                </td>
                                <td className="py-3 font-semibold text-foreground">{evt.price}</td>
                                <td className="py-3 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    {(status === "DRAFT" || status === "REJECTED") && (
                                      <Button
                                        onClick={() => handleSubmitForApproval(evt.id)}
                                        size="xs"
                                        className="rounded-full bg-accent hover:opacity-90 text-white font-semibold text-[10px] py-1 px-3 shadow-none border border-accent/20"
                                      >
                                        Submit
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteEvent(evt.id)}
                                      className="rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8"
                                      title="Delete Event"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="block md:hidden space-y-3">
                    {events
                      .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((evt) => {
                        const registeredPct = Math.min(100, Math.round((evt.attendees / parseInt(evt.capacity)) * 100))
                        const status = evt.status || 'DRAFT'
                        return (
                          <div key={evt.id} className="p-4 rounded-xl border border-border bg-muted/10 dark:bg-muted/5 space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                              <img src={evt.image} alt={evt.title} className="h-12 w-12 rounded-lg object-cover border border-border shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-semibold text-foreground block truncate">{evt.title}</span>
                                  <span className={cn(
                                    "text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0",
                                    status === "PUBLISHED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                    status === "PENDING_APPROVAL" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
                                    status === "REJECTED" ? "bg-destructive/10 border-destructive/20 text-destructive" :
                                    "bg-muted border-border text-muted-foreground"
                                  )}>
                                    {status}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {evt.location}
                                </span>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">{evt.date}</span>
                                {evt.reviewNotes && (status === 'DRAFT' || status === 'REJECTED') && (
                                  <span className="text-[10px] text-amber-500 font-medium block mt-2 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                                    Feedback: "{evt.reviewNotes}"
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-border/20">
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Capacity / Seats</span>
                                <span>{evt.attendees} / {evt.capacity} ({registeredPct}%)</span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden flex">
                                <div 
                                  className="bg-accent h-full rounded-full" 
                                  style={{ width: `${registeredPct}%` }} 
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-border/20">
                              <span className="font-semibold text-foreground">{evt.price}</span>
                              <div className="flex items-center gap-2">
                                {(status === "DRAFT" || status === "REJECTED") && (
                                  <Button
                                    onClick={() => handleSubmitForApproval(evt.id)}
                                    size="xs"
                                    className="rounded-full bg-accent hover:opacity-90 text-white font-semibold text-[10px] py-1 px-3 shadow-none border border-accent/20"
                                  >
                                    Submit
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteEvent(evt.id)}
                                  className="rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8"
                                  title="Delete Event"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>               </div>
                </Card>
              )}

              {/* ==========================================
                 4. TICKETS VIEW
                 ========================================== */}
              {activeView === 'tickets' && (
                <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
                  <h3 className="text-sm font-heading font-medium text-foreground mb-4">Ticketing Audit Log</h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    Complete list of transaction receipts and generated active passes across platform bookings.
                  </p>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Booking ID</th>
                          <th className="pb-3">Event Detail</th>
                          <th className="pb-3">Base Cost</th>
                          <th className="pb-3">Status Code</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {bookedTickets.map((evt, idx) => (
                          <tr key={idx} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                            <td className="py-3 font-mono font-bold text-foreground">#EVT-{evt.id.toUpperCase()}-{idx}</td>
                            <td className="py-3">
                              <span className="font-medium text-foreground block">{evt.title}</span>
                              <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                            </td>
                            <td className="py-3 font-semibold text-foreground">{evt.price}</td>
                            <td className="py-3">
                              <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                CONFIRMED
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button 
                                onClick={() => showToast(`Simulating barcode scan for EVT-${evt.id}`)}
                                className="text-accent hover:underline font-medium"
                              >
                                Scan Ticket
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="block md:hidden space-y-3">
                    {bookedTickets.map((evt, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-muted/10 dark:bg-muted/5 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-foreground block">#EVT-{evt.id.toUpperCase()}-{idx}</span>
                            <span className="font-medium text-foreground block mt-0.5">{evt.title}</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{evt.date}</span>
                          </div>
                          <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            CONFIRMED
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-border/20">
                          <span className="font-semibold text-foreground">{evt.price}</span>
                          <button 
                            onClick={() => showToast(`Simulating barcode scan for EVT-${evt.id}`)}
                            className="text-accent hover:underline font-medium text-[11px]"
                          >
                            Scan Ticket
                          </button>
                        </div>
                      </div>
                    ))}
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
                    <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
                      <h3 className="text-sm font-heading font-medium text-foreground mb-4">Event Check-In Rates</h3>
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
                              <div className="bg-accent h-full rounded-full" style={{ width: `${evt.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
                      <h3 className="text-sm font-heading font-medium text-foreground mb-4">Monthly Platform Growth</h3>
                      <div className="space-y-4 text-xs mt-4">
                        {[
                          { month: "January", total: 15, growth: "+12%" },
                          { month: "February", total: 18, growth: "+20%" },
                          { month: "March", total: 22, growth: "+22%" },
                          { month: "April", total: 29, growth: "+31%" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-border">
                            <span className="font-medium text-foreground/80">{item.month}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{item.total} lists</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">{item.growth}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* General summary alerts */}
                  <Card className="border border-border bg-muted/40 dark:bg-muted/10 p-5 flex items-start gap-4 rounded-[16px] shadow-none">
                    <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1.5">
                      <h4 className="font-heading font-medium text-foreground">Analytics Data Resolution</h4>
                      <p className="text-muted-foreground">
                        Data updates every 15 minutes. To sync instant ticket transactions, click the refresh button on top header. Stripe commission deductions of 2.9% + ₹25 apply.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* ==========================================
                 6. ATTENDEES VIEW
                 ========================================== */}
              {activeView === 'attendees' && (
                <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-heading font-medium text-foreground">Attendee Registry</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Toggle check-in status directly when checking in guests at the gate.</p>
                    </div>
                  </div>
                               {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[9px] pb-2">
                          <th className="pb-3">Guest</th>
                          <th className="pb-3">Email Address</th>
                          <th className="pb-3">Event Registered</th>
                          <th className="pb-3">Date Registered</th>
                          <th className="pb-3 text-right">Gate Check-In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {attendeeRegistry.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/20 dark:hover:bg-muted/10">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-[10px]">
                                  {item.name.charAt(0)}
                                </div>
                                <span className="font-medium text-foreground">{item.name}</span>
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
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                                    : "bg-muted border-border text-foreground hover:bg-muted/80"
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

                  {/* Mobile View */}
                  <div className="block md:hidden space-y-3">
                    {attendeeRegistry.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-border bg-muted/10 dark:bg-muted/5 space-y-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-[10px] shrink-0">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-foreground block">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground block">{item.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                          <div className="flex justify-between">
                            <span>Event Registered</span>
                            <span className="text-foreground text-right max-w-[180px] truncate">{item.eventTitle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date Registered</span>
                            <span className="text-foreground">{item.date}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/20 flex justify-end">
                          <button
                            onClick={() => toggleCheckIn(item.id)}
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors w-full justify-center sm:w-auto",
                              item.checkedIn
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                                : "bg-muted border-border text-foreground hover:bg-muted/80"
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
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ==========================================
                 7. SETTINGS VIEW
                 ========================================== */}
              {activeView === 'settings' && (
                <Card className="border border-border bg-card p-6 shadow-none max-w-xl mx-auto rounded-[16px]">
                  <h3 className="font-heading font-medium text-sm text-foreground mb-4 pb-3 border-b border-border">Organization & Account Settings</h3>
                  
                  <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs text-foreground">
                    <div className="space-y-1">
                      <label className="font-mono text-muted-foreground uppercase tracking-wider text-[10px]">Organizer Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-[8px] border border-border bg-background/50 focus:border-accent focus:outline-none"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                      <span className="text-[10px] text-muted-foreground">This name is appended onto your published events.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-muted-foreground uppercase tracking-wider text-[10px]">Profile Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-[8px] border border-border bg-background/50 focus:border-accent focus:outline-none"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-muted-foreground uppercase tracking-wider text-[10px]">Profile Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-3 py-2 rounded-[8px] border border-border bg-background/50 focus:border-accent focus:outline-none"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="font-mono text-muted-foreground uppercase tracking-wider text-[10px] block">Security Preference</label>
                      <div className="flex gap-2">
                        <span className="font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/15">
                          2FA Enabled
                        </span>
                        <span className="font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                          OAuth Login Active
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex gap-3">
                      <Button
                        type="submit"
                        className="w-full rounded-full bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs shadow-none py-4"
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
