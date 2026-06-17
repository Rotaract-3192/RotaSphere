"use client"

import * as React from "react"
import { Heart, Briefcase, Users, Globe, IndianRupee, Sparkles, ChevronRight } from "lucide-react"
import { mockCategories, EventItem } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"

export function Categories() {
  const [categories, setCategories] = React.useState(mockCategories)

  React.useEffect(() => {
    async function loadCategoryCounts() {
      try {
        const res = await getEventsAction()
        if (res.success) {
          const eventsList = res.events as EventItem[]
          const isRealDb = !res.simulated

          // Compute counts
          const counts: Record<string, number> = {}
          eventsList.forEach(e => {
            counts[e.category] = (counts[e.category] || 0) + 1
          })

          setCategories(prev => prev.map(cat => ({
            ...cat,
            count: counts[cat.slug] || (isRealDb ? 0 : cat.count)
          })))
        }
      } catch (err) {
        console.error("Failed to load category counts:", err)
      }
    }
    loadCategoryCounts()
  }, [])

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Heart, Briefcase, Users, Globe, IndianRupee, Sparkles
  }

  return (
    <section
      id="categories"
      className="relative section-padding overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute top-0 right-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(60px, 11vw, 160px)",
          color: "var(--foreground)",
          opacity: 0.015,
          fontWeight: 700
        }}
      >
        EXPLORE
      </div>

      {/* Atmospheric blob */}
      <div
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 4%, transparent) 0%, transparent 70%)" }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 md:mb-16 gap-4 sm:gap-6">
          <div className="max-w-xl">
            <div className="mb-4">
              <span className="eyebrow-accent">Categorized For You</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-medium"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              Explore Event Categories
            </h2>
            <p
              className="font-weight-450 mt-4 leading-relaxed text-sm sm:text-base"
              style={{ color: "var(--muted-foreground)" }}
            >
              Find precisely what you&apos;re looking for. Specialized workshops,
              seminars, and live entertainment across every interest.
            </p>
          </div>

          <a
            href="/events"
            className="inline-flex items-center gap-1.5 font-medium transition-all duration-200 group shrink-0"
            style={{
              color: "var(--accent)",
              fontSize: "14px",
              letterSpacing: "-0.01em"
            }}
          >
            Browse all events
            <ChevronRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Heart
            return (
              <a
                key={cat.id}
                href="/events"
                className="flex items-start gap-5 p-6 transition-all duration-200 group cursor-pointer"
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  textDecoration: "none"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                  ;(e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                  ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                }}
              >
                {/* Icon — Circular container */}
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
                  }}
                >
                  <span style={{ color: "var(--accent)", display: "flex" }}>
                    <IconComponent className="h-6 w-6 transition-transform duration-300" />
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <h3
                      className="font-medium text-base"
                      style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                    >
                      {cat.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold shrink-0"
                      style={{
                        background: "var(--muted)",
                        color: "var(--muted-foreground)",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        border: "1px solid var(--border)"
                      }}
                    >
                      {cat.count} Events
                    </span>
                  </div>
                  <p
                    className="text-sm font-weight-450 leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {cat.description}
                  </p>
                </div>
              </a>
            )
          })}
        </div>

      </div>
    </section>
  )
}
