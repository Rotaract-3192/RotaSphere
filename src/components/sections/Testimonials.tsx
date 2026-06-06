"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { mockTestimonials } from "@/data/mockData"

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden"
      style={{ background: "var(--muted)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute bottom-8 right-0 w-full overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
        style={{ fontSize: "clamp(60px,12vw,180px)", textAlign: "center", color: "var(--foreground)", opacity: 0.012 }}
      >
        REVIEWS
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 px-6">
          <span className="eyebrow-accent mb-4 block">What Creators Say</span>
          <h2
            className="text-4xl md:text-5xl font-medium mb-5"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Loved by Event Hosts
          </h2>
          <p
            className="font-weight-450 leading-relaxed"
            style={{ color: "var(--muted-foreground)", fontSize: "16px" }}
          >
            Discover how clubs and organizations are using our platform to bring people together.
          </p>
        </div>

        {/* Desktop: 3-column Grid | Mobile: Swipeable Carousel */}
        {/* Mobile Swipe Container (block on mobile, hidden on md) */}
        <div className="flex md:hidden overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scrollbar-none px-6">
          {mockTestimonials.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[85%] p-6 flex flex-col justify-between"
              style={{
                background: "var(--card)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                {/* Content */}
                <p
                  className="font-weight-450 leading-relaxed text-sm italic"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  "{item.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/60">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div className="truncate">
                  <span className="font-semibold text-sm block text-foreground truncate">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {item.role}, {item.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Grid (hidden on mobile, grid on md) */}
        <div className="hidden md:grid grid-cols-3 gap-6 px-6">
          {mockTestimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 transition-all duration-300 flex flex-col justify-between"
              style={{
                background: "var(--card)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                ;(e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
              }}
            >
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                {/* Content */}
                <p
                  className="font-weight-450 leading-relaxed text-sm italic"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  "{item.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-border/60">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div className="truncate">
                  <span className="font-semibold text-sm block text-foreground truncate">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {item.role}, {item.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
