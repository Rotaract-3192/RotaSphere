"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, 
  Clock, Compass, ArrowRight, Info, Globe, CalendarRange
} from "lucide-react"
import { EventItem } from "@/data/mockData"
import Link from "next/link"

interface EventCalendarProps {
  events: EventItem[]
}

const CATEGORY_STYLES: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  community: {
    dot: "bg-teal-500",
    text: "text-teal-400 dark:text-teal-300",
    bg: "bg-teal-500/10 dark:bg-teal-950/40",
    border: "border-teal-500/20 dark:border-teal-500/30"
  },
  professional: {
    dot: "bg-sky-500",
    text: "text-sky-400 dark:text-sky-300",
    bg: "bg-sky-500/10 dark:bg-sky-950/40",
    border: "border-sky-500/20 dark:border-sky-500/30"
  },
  club: {
    dot: "bg-indigo-500",
    text: "text-indigo-400 dark:text-indigo-300",
    bg: "bg-indigo-500/10 dark:bg-indigo-950/40",
    border: "border-indigo-500/20 dark:border-indigo-500/30"
  },
  international: {
    dot: "bg-amber-500",
    text: "text-amber-400 dark:text-amber-300",
    bg: "bg-amber-500/10 dark:bg-amber-950/40",
    border: "border-amber-500/20 dark:border-amber-500/30"
  },
  fundraiser: {
    dot: "bg-emerald-500",
    text: "text-emerald-400 dark:text-emerald-300",
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    border: "border-emerald-500/20 dark:border-emerald-500/30"
  },
  pr: {
    dot: "bg-slate-400",
    text: "text-slate-400 dark:text-slate-300",
    bg: "bg-slate-500/10 dark:bg-slate-800/40",
    border: "border-slate-500/20 dark:border-slate-500/30"
  }
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [activeTab, setActiveTab] = React.useState<"local" | "google">("local")
  const [currentDate, setCurrentDate] = React.useState(() => new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(() => new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Helpers for local calendar building
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth)

  // Prev Month Days to fill the initial grid spaces
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYearIndex = currentMonth === 0 ? currentYear - 1 : currentYear
  const daysInPrevMonth = getDaysInMonth(prevYearIndex, prevMonthIndex)

  // Map events to their respective days
  const eventsByDay = React.useMemo(() => {
    const map: Record<string, EventItem[]> = {}
    events.forEach(event => {
      const eventDateStr = event.startDate || event.date
      if (!eventDateStr) return

      const parsedDate = new Date(eventDateStr)
      if (isNaN(parsedDate.getTime())) return

      const key = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}-${parsedDate.getDate()}`
      if (!map[key]) {
        map[key] = []
      }
      map[key].push(event)
    })
    return map
  }, [events])

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const selectToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  // Get selected day key
  const selectedDayKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : ""

  const selectedEvents = eventsByDay[selectedDayKey] || []

  const getEventPriceDisplay = (evt: EventItem) => {
    if (evt.type === "free") return "Free"
    const eventTiers = (evt as any).ticketTiers || []
    if (eventTiers.length === 0) {
      const parsed = parseFloat(String(evt.price).replace(/[^0-9.]/g, ""))
      if (!isNaN(parsed)) {
        return `₹${parsed.toFixed(2)}`
      }
      return evt.price || "Paid"
    }
    
    // Find active tier
    const activeTier = eventTiers.find((t: any) => t.id === "early-bird" && t.enabled && (t.ticketsSold || 0) < t.capacity)
      || eventTiers.find((t: any) => t.id === "normal" && t.enabled)
      || eventTiers.find((t: any) => t.enabled)
      
    if (activeTier) {
      const isEarlyBird = activeTier.id === "early-bird"
      return `₹${parseFloat(String(activeTier.price)).toFixed(2)}${isEarlyBird ? " (Early Bird)" : ""}`
    }
    const parsed = parseFloat(String(evt.price).replace(/[^0-9.]/g, ""))
    if (!isNaN(parsed)) {
      return `₹${parsed.toFixed(2)}`
    }
    return evt.price || "Paid"
  }

  // Month labels
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Render days array
  const calendarCells = React.useMemo(() => {
    const cells = []

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      const dateObj = new Date(prevYearIndex, prevMonthIndex, dayNum)
      cells.push({ dayNum, isCurrentMonth: false, date: dateObj })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(currentYear, currentMonth, i)
      cells.push({ dayNum: i, isCurrentMonth: true, date: dateObj })
    }

    // Next month filler days (fill up grid to multiples of 7)
    const totalCells = cells.length
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYearIdx = currentMonth === 11 ? currentYear + 1 : currentYear

    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(nextYearIdx, nextMonthIdx, i)
      cells.push({ dayNum: i, isCurrentMonth: false, date: dateObj })
    }

    return cells
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex, daysInPrevMonth, prevMonthIndex, prevYearIndex])

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <section className="py-10 border-b border-white/5 bg-[#080b11]/50 backdrop-blur-md relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">
        
        {/* Header Title & Tab Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 text-left">
          <div>
            <span className="eyebrow-accent mb-2 block">Platform Timeline</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Rotaract Event Calendar
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Toggle between website events created by organizers and the official Google District Calendar.
            </p>
          </div>

          {/* Toggle Switcher */}
          <div className="flex bg-white/[0.03] border border-white/10 rounded-full p-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("local")}
              className={`
                px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2
                ${activeTab === "local" 
                  ? "bg-[#1e293b] text-[#38BDF8] border border-sky-500/25 shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
                  : "text-slate-400 hover:text-white"
                }
              `}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Website Created Events
            </button>
            <button
              onClick={() => setActiveTab("google")}
              className={`
                px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2
                ${activeTab === "google" 
                  ? "bg-[#1e293b] text-[#38BDF8] border border-sky-500/25 shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
                  : "text-slate-400 hover:text-white"
                }
              `}
            >
              <Globe className="h-3.5 w-3.5" />
              District Google Calendar
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {activeTab === "local" ? (
            <motion.div
              key="local-calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Calendar Controls Info bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0b0f19]/30 border border-white/5 rounded-2xl p-4 gap-4 text-left">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#38BDF8]" />
                  <span className="text-xs text-slate-300">
                    Below shows all live program dates published by local organizers. Click a day to view schedules.
                  </span>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={selectToday}
                    className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.03] text-white transition-all font-mono"
                  >
                    Today
                  </button>
                  <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                    <button
                      onClick={prevMonth}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Previous Month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-[10px] font-bold text-white uppercase tracking-widest min-w-[110px] text-center font-mono select-none">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Next Month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Monthly Matrix Grid */}
                <div className="lg:col-span-8 bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
                  <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                    {weekdays.map(day => (
                      <div
                        key={day}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1 font-mono"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((cell, idx) => {
                      const isSelected = selectedDate && 
                        cell.date.getDate() === selectedDate.getDate() &&
                        cell.date.getMonth() === selectedDate.getMonth() &&
                        cell.date.getFullYear() === selectedDate.getFullYear()

                      const dayKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`
                      const dayEvents = eventsByDay[dayKey] || []
                      const hasEvents = dayEvents.length > 0
                      const isToday = new Date().toDateString() === cell.date.toDateString()

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(cell.date)}
                          className={`
                            relative min-h-[65px] sm:min-h-[90px] rounded-2xl p-2 flex flex-col justify-between items-start transition-all border text-left group
                            ${!cell.isCurrentMonth ? "opacity-25" : ""}
                            ${isSelected 
                              ? "bg-[#38BDF8]/10 border-[#38BDF8]/60 shadow-[0_0_15px_rgba(56,189,248,0.15)] scale-[1.02] z-10" 
                              : hasEvents
                                ? "bg-white/[0.02] border-white/10 hover:border-[#38BDF8]/40 hover:bg-white/[0.04]"
                                : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5 hover:border-white/10"
                            }
                            hover:scale-[1.02] active:scale-[0.98]
                          `}
                        >
                          {/* Day number */}
                          <span 
                            className={`
                              text-xs font-bold font-mono tracking-wide px-1.5 py-0.5 rounded-md
                              ${isToday && !isSelected ? "bg-sky-500/10 text-sky-400" : "text-white"}
                              ${isSelected ? "text-[#38BDF8]" : ""}
                            `}
                          >
                            {cell.dayNum}
                          </span>

                          {/* Event indicators */}
                          {hasEvents && (
                            <div className="w-full mt-1.5 space-y-1 overflow-hidden">
                              {/* Desktop View: Interactive Event Badges */}
                              <div className="hidden sm:block space-y-1 w-full">
                                {dayEvents.slice(0, 2).map(evt => {
                                  const style = CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.community
                                  return (
                                    <div 
                                      key={evt.id} 
                                      className={`text-[8px] font-bold leading-tight px-1.5 py-0.5 rounded-md border truncate w-full ${style.text} ${style.bg} ${style.border} transition-colors group-hover:brightness-110`}
                                      title={`${evt.title} (${evt.location})`}
                                    >
                                      {evt.title}
                                    </div>
                                  )
                                })}
                                {dayEvents.length > 2 && (
                                  <div className="text-[7px] font-extrabold text-[#38BDF8] font-mono leading-none pl-1">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>

                              {/* Mobile View: Small Category Dots */}
                              <div className="flex sm:hidden flex-wrap gap-1 w-full">
                                {dayEvents.slice(0, 3).map(evt => {
                                  const style = CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.community
                                  return (
                                    <div 
                                      key={evt.id} 
                                      className={`h-1.5 w-1.5 rounded-full ${style.dot}`} 
                                    />
                                  )
                                })}
                                {dayEvents.length > 3 && (
                                  <div className="text-[7px] font-bold text-[#38BDF8] leading-none">
                                    +
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected date Details Side column */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-5 shadow-2xl text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="h-4 w-4 text-[#38BDF8]" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                        {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' }) : "No Date Selected"}
                      </h3>
                    </div>

                    {selectedEvents.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                        <Compass className="h-8 w-8 text-white/10 mb-2" />
                        <span className="text-xs font-bold text-slate-300">No events scheduled</span>
                        <p className="text-[10px] mt-1 max-w-[200px]">There are no local program listings scheduled for this day.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
                        {selectedEvents.map(evt => {
                          const style = CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.community
                          return (
                            <div 
                              key={evt.id}
                              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2 relative overflow-hidden group"
                            >
                              {/* Category highlight */}
                              <div className={`absolute top-0 right-0 h-1 w-10 ${style.dot}`} />

                              {/* Tags */}
                              <div>
                                <span className={`inline-block text-[8px] font-extrabold uppercase tracking-widest ${style.text} ${style.bg} border ${style.border} px-2 py-0.5 rounded-full mb-1.5 font-mono`}>
                                  {evt.category}
                                </span>
                                <h4 className="font-bold text-xs text-white leading-snug line-clamp-2 group-hover:text-sky-400 transition-colors">
                                  {evt.title}
                                </h4>
                              </div>

                              {/* Details */}
                              <div className="space-y-1.5 text-[9px] text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-[#38BDF8]/80 shrink-0" />
                                  <span className="line-clamp-1">{evt.time}</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                                  <span className="line-clamp-1">{evt.location}</span>
                                </div>
                              </div>

                              {/* Link action */}
                              <div className="flex justify-between items-center mt-2 pt-2.5 border-t border-white/5">
                                <span className="text-xs font-bold text-white font-mono">{getEventPriceDisplay(evt)}</span>
                                {((evt.attendees || 0) >= parseInt(evt.capacity || "0")) ? (
                                  <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider font-mono">
                                    Sold Out
                                  </span>
                                ) : (
                                  <Link
                                    href={`/events?eventId=${evt.id}`}
                                    className="text-[9px] font-bold text-[#38BDF8] hover:text-[#6EB7FF] flex items-center gap-1 transition-all uppercase tracking-wider font-mono"
                                  >
                                    Get Ticket <ArrowRight className="h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Totals panel */}
                  <div className="bg-[#0b0f19]/40 border border-white/5 rounded-2xl p-4 text-left flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                      Website Created Events:
                    </span>
                    <span className="font-bold text-white font-mono">{events.length}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="google-calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden"
            >
              <div className="w-full relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] md:h-[600px]">
                <iframe 
                  src="https://calendar.google.com/calendar/embed?src=tech.rotaract3192%40gmail.com&ctz=Asia%2FKolkata" 
                  style={{ border: 0 }} 
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0" 
                  scrolling="no"
                  title="Rotaract District 3192 Google Calendar"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
