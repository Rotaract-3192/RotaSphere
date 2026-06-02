"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { mockTestimonials } from "@/data/mockData"

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative section-padding overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ghost watermark */}
      <div
        className="ghost-watermark absolute top-0 left-0 w-full text-center pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ fontSize: "clamp(60px, 12vw, 180px)", color: "rgba(23, 23, 28, 0.015)" }}
      >
        REVIEWS
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="mb-4">
            <span className="eyebrow-accent">Success Stories</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-medium mb-4"
            style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
          >
            Loved by Event Creators
          </h2>
          <p
            className="font-weight-450 leading-relaxed"
            style={{ color: "var(--body-muted)", fontSize: "16px" }}
          >
            Read reviews from independent organizers, enterprise planners, and community hosts
            who run their events on RotaSphere.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTestimonials.map((t, index) => (
            <div
              key={t.id}
              className={`flex flex-col justify-between transition-all duration-200 ${
                index === 1 ? "md-stagger-middle" : ""
              }`}
              style={{
                background: "var(--soft-stone)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                padding: "32px"
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
              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" style={{ fill: "var(--accent)", color: "var(--accent)" }} />
                  ))}
                </div>

                {/* Quote mark — Coral */}
                <div
                  className="text-5xl font-bold leading-none mb-3"
                  style={{ color: "var(--accent)", fontFamily: "Georgia, serif" }}
                >
                  &ldquo;
                </div>

                {/* Review Content */}
                <p
                  className="font-weight-450 leading-relaxed mb-6"
                  style={{ color: "var(--foreground)", fontSize: "15px" }}
                >
                  {t.content}
                </p>
              </div>

              {/* Author — circular portrait with satellite */}
              <div
                className="flex items-center gap-4 pt-5"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="relative">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover"
                    style={{ border: "1px solid var(--border)" }}
                  />
                  {/* Small orbital accent on avatar */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent)", border: "2px solid var(--background)" }}
                  >
                    <Star className="h-2 w-2" style={{ fill: "var(--background)", color: "var(--background)" }} />
                  </div>
                </div>
                <div>
                  <span
                    className="font-medium text-sm block"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                  >
                    {t.name}
                  </span>
                  <span className="text-xs font-weight-450 block" style={{ color: "var(--body-muted)" }}>
                    {t.role},{" "}
                    <span style={{ color: "var(--accent)" }}>{t.company}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner — Near-Black stadium */}
        <div
          className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          style={{
            background: "var(--primary)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 56px"
          }}
        >
          {/* Decorative orbital arc */}
          <svg
            className="absolute top-0 right-0 pointer-events-none"
            width="200" height="200" viewBox="0 0 200 200" fill="none"
            aria-hidden="true"
          >
            <circle cx="200" cy="0" r="120" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.15" />
            <circle cx="200" cy="0" r="80" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.1" />
          </svg>

          <div>
            <div className="mb-3">
              <span className="eyebrow-accent">Start Today</span>
            </div>
            <h3
              className="text-2xl md:text-3xl font-medium mb-2"
              style={{ color: "var(--primary-foreground)", letterSpacing: "-0.02em" }}
            >
              Ready to host your next successful event?
            </h3>
            <p
              className="font-weight-450 max-w-md"
              style={{ color: "var(--primary-foreground)", opacity: 0.6, fontSize: "15px" }}
            >
              Set up takes less than 2 minutes. Build beautiful event pages with seamless ticketing.
            </p>
          </div>

          {/* Stark White CTA — inverted on dark bg */}
          <div className="shrink-0 flex gap-3">
            <a
              href="/events"
              className="font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer animate-float-delayed"
              style={{
                background: "var(--primary-foreground)",
                color: "var(--primary)",
                borderRadius: "var(--radius-pill)",
                padding: "12px 28px",
                fontSize: "15px",
                border: "1px solid var(--primary-foreground)",
                letterSpacing: "-0.01em",
                textDecoration: "none",
                display: "inline-block"
              }}
            >
              Get Started Free
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
