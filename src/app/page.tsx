"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/sections/Hero"
import { Categories } from "@/components/sections/Categories"
import { DarkFeatureBand } from "@/components/sections/DarkFeatureBand"
import { Footer } from "@/components/Footer"
import { CreateEventModal } from "@/components/sections/CreateEventModal"
import { mockEvents, EventItem } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"
import { ArrowRight, Calendar, Tag, Info } from "lucide-react"
import Link from "next/link"
import EventsMapSection from "@/components/sections/EventsMapSection"

import { MapSkeleton } from "@/components/skeletons/MapSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

const pages = [
  {
    href: "/events",
    label: "Events",
    eyebrow: "Discover",
    title: "Browse All Events",
    desc: "From local community service drives to professional webinars — discover and register.",
    icon: Calendar,
    bg: "var(--primary)",
    textColor: "var(--primary-foreground)",
    accentColor: "var(--accent)"
  },
  {
    href: "/categories",
    label: "Categories",
    eyebrow: "Explore",
    title: "Event Categories",
    desc: "Community, Professional, Club, International Service, Fundraisers, and PR.",
    icon: Tag,
    bg: "var(--card)",
    textColor: "var(--foreground)",
    accentColor: "var(--accent)"
  },
  {
    href: "/about",
    label: "About",
    eyebrow: "Our Mission",
    title: "About RotaSphere",
    desc: "Custom-made for Rotaract District 3192 to showcase club initiatives and book event tickets.",
    icon: Info,
    bg: "var(--card)",
    textColor: "var(--foreground)",
    accentColor: "var(--accent)"
  }
]

export default function Home() {
  // Trigger Next.js SSR cache rebuild
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [isCreateEventOpen, setIsCreateEventOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchDbEvents() {
      setIsLoading(true)
      try {
        const res = await getEventsAction()
        if (res.success) {
          if (!res.simulated) {
            setEvents(res.events as EventItem[])
          } else {
            const saved = localStorage.getItem("rotasphere_events")
            const currentEvents = saved ? JSON.parse(saved) : mockEvents
            setEvents(currentEvents.filter((e: any) => e.status === "PUBLISHED" || !e.status))
          }
        }
      } catch (err) {
        console.error("Failed to load events:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (typeof window !== "undefined") fetchDbEvents()
  }, [])

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents(prev => [newEvent, ...prev])
  }

  return (
    <>
      <Navbar onCreateEventClick={() => setIsCreateEventOpen(true)} />

      <main className="flex-grow">
        {/* 1. Hero — editorial h1 + two-card composition */}
        <Hero onCreateEventClick={() => setIsCreateEventOpen(true)} />

        {/* 3. Explore Platform — 2×2 page-link grid */}
        <section
          className="section-padding animate-fade-in-up"
          style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <div className="text-center mb-10 sm:mb-14">
              <span className="eyebrow-accent mb-4 block">Explore The Platform</span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-medium"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Everything in One Place
              </h2>
              <p
                className="mt-4 font-weight-450 max-w-lg mx-auto"
                style={{ color: "var(--muted-foreground)", fontSize: "16px" }}
              >
                RotaSphere is organized into dedicated pages so you can find exactly
                what you&apos;re looking for, instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => {
                const Icon = page.icon
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group relative flex flex-col justify-between p-10 overflow-hidden transition-all duration-300 animate-fade-in"
                    style={{
                      background: page.bg,
                      borderRadius: "22px",
                      border: `1px solid var(--border)`,
                      minHeight: "240px",
                      textDecoration: "none"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
                      ;(e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                      ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                    }}
                  >
                    {/* Decorative orbital arc */}
                    <svg
                      className="absolute bottom-0 right-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
                      width="200" height="200" viewBox="0 0 200 200" fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="200" cy="200" r="120" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.15" />
                      <circle cx="200" cy="200" r="80" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.1" />
                    </svg>

                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center"
                        style={{
                          background: page.bg === "var(--primary)"
                            ? "color-mix(in srgb, var(--accent) 25%, transparent)"
                            : "color-mix(in srgb, var(--accent) 8%, transparent)",
                          border: `1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)`
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color: "var(--accent)" }} />
                      </div>

                      <div
                        className="h-11 w-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
                        style={{
                          background: page.bg === "var(--primary)" ? "rgba(255,255,255,0.1)" : "var(--card)",
                          border: `1.5px solid ${page.bg === "var(--primary)" ? "rgba(255,255,255,0.2)" : "var(--border)"}`
                        }}
                      >
                        <ArrowRight className="h-4 w-4" style={{ color: page.textColor }} />
                      </div>
                    </div>

                    {/* Bottom content */}
                    <div>
                      <p className="eyebrow-accent mb-2" style={{ color: "var(--accent)" }}>
                        {page.eyebrow}
                      </p>
                      <h3
                        className="text-2xl font-medium mb-2"
                        style={{ color: page.textColor, letterSpacing: "-0.02em" }}
                      >
                        {page.title}
                      </h3>
                      <p
                        className="font-weight-450 text-sm leading-relaxed"
                        style={{
                          color: page.bg === "var(--primary)" ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)"
                        }}
                      >
                        {page.desc}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* 4. Rotaract Event Categories */}
        <Categories />

        {/* 5. Dark Feature Band */}
        <DarkFeatureBand />

        {/* 6. Upcoming Events Preview Strip */}
        {isLoading ? (
          <section
            className="py-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0A2342 0%, #06101F 100%)" }}
          >
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
              <div className="flex items-end justify-between mb-10">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 bg-sky-500/10 dark:bg-sky-400/5 border border-border" />
                  <Skeleton className="h-8 w-48 bg-sky-500/10 dark:bg-sky-400/5 border border-border" />
                </div>
                <Skeleton className="h-5 w-20 bg-sky-500/10 dark:bg-sky-400/5 border border-border rounded-full" />
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="shrink-0 flex flex-col p-5 bg-card/40 border border-border/50 rounded-[16px] w-[260px] space-y-4"
                  >
                    <div className="flex justify-center">
                      <Skeleton className="w-[140px] h-[140px] rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-3.5 w-16 rounded" />
                      <Skeleton className="h-5 w-full rounded" />
                      <Skeleton className="h-3.5 w-24 rounded" />
                      <Skeleton className="h-8 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : events.length > 0 ? (
          <section
            className="py-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0A2342 0%, #06101F 100%)" }}
          >
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="eyebrow-accent mb-3 block" style={{ color: "var(--accent)" }}>
                    Latest
                  </span>
                  <h2
                    className="text-3xl font-medium"
                    style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
                  >
                    Upcoming Events
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="flex items-center gap-1.5 font-medium transition-colors text-sm"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none" style={{ scrollSnapType: "x mandatory" }}>
                {events.slice(0, 4).map(evt => (
                  <div
                    key={evt.id}
                    className="shrink-0 flex flex-col"
                    style={{
                      scrollSnapAlign: "start",
                      width: "min(260px, 80vw)",
                      background: "var(--card)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      overflow: "hidden"
                    }}
                  >
                    <div className="relative p-5 pb-0 flex justify-center">
                      <div className="circular-portrait" style={{ width: "140px", height: "140px" }}>
                        <img
                          src={evt.image}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="eyebrow-accent mb-2" style={{ fontSize: "11px", color: "var(--accent)" }}>
                        {evt.category}
                      </p>
                      <h3
                        className="font-medium mb-1 line-clamp-2"
                        style={{ color: "var(--card-foreground)", fontSize: "15px", letterSpacing: "-0.01em" }}
                      >
                        {evt.title}
                      </h3>
                      <p className="text-xs font-weight-450 mb-4" style={{ color: "var(--muted-foreground)" }}>
                        {evt.date}
                      </p>
                      <Link
                        href="/events"
                        className="text-xs font-medium block text-center py-2 transition-opacity hover:opacity-80"
                        style={{
                          background: "var(--accent)",
                          color: "var(--accent-foreground)",
                          borderRadius: "32px",
                          textDecoration: "none"
                        }}
                      >
                        {evt.price === "Free" ? "Register Free" : `Get Ticket · ${evt.price}`}
                      </Link>
                    </div>
                  </div>
                ))}

                <Link
                  href="/events"
                  className="shrink-0 flex flex-col items-center justify-center gap-3 transition-opacity hover:opacity-80 animate-pulse-subtle"
                  style={{
                    scrollSnapAlign: "start",
                    width: "200px",
                    background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                    borderRadius: "16px",
                    border: "1.5px dashed color-mix(in srgb, var(--accent) 30%, transparent)",
                    textDecoration: "none",
                    padding: "32px"
                  }}
                >
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", border: "1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}
                  >
                    <ArrowRight className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <span
                    className="font-medium text-sm text-center"
                    style={{ color: "var(--accent)", letterSpacing: "-0.01em" }}
                  >
                    View all {events.length} events
                  </span>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* 6.5. Find Events Near You (Interactive Discovery Map) */}
        {isLoading ? (
          <section className="py-16" style={{ background: "var(--background)" }}>
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
              <div className="text-center mb-10">
                <span className="eyebrow-accent mb-3 block" style={{ color: "var(--accent)" }}>Map Discovery</span>
                <h2 className="text-3xl font-medium text-foreground mb-4">Find Events Near You</h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">Discover community service programs and workshops mapped live across your area.</p>
              </div>
              <MapSkeleton />
            </div>
          </section>
        ) : (
          <EventsMapSection events={events} />
        )}
      </main>

      <Footer />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  )
}
