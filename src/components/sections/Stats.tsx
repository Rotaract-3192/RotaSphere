"use client"

import * as React from "react"
import { Calendar, Ticket, ShieldCheck, Star } from "lucide-react"
import { getPlatformStatsAction } from "@/app/actions/eventActions"

export function Stats() {
  const [stats, setStats] = React.useState([
    { id: "stat-1", value: "12k+", label: "Events Hosted", icon: "Calendar" },
    { id: "stat-2", value: "450k+", label: "Tickets Sold", icon: "Ticket" },
    { id: "stat-3", value: "99.9%", label: "Platform Uptime", icon: "ShieldCheck" },
    { id: "stat-4", value: "4.9/5", label: "Host Satisfaction", icon: "Star" }
  ])

  React.useEffect(() => {
    async function loadStats() {
      try {
        const res = await getPlatformStatsAction()
        if (res.success) {
          const isReal = !res.simulated
          
          const formatCount = (num: number, isTickets: boolean) => {
            if (!isReal) return isTickets ? "450k+" : "12k+"
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
            if (num >= 1000) return `${(num / 1000).toFixed(1)}k+`
            return String(num)
          }

          setStats([
            { id: "stat-1", value: formatCount(res.eventsCount ?? 0, false), label: "Events Hosted", icon: "Calendar" },
            { id: "stat-2", value: formatCount(res.ticketsCount ?? 0, true), label: "Tickets Sold", icon: "Ticket" },
            { id: "stat-3", value: res.uptime ?? "99.9%", label: "Platform Uptime", icon: "ShieldCheck" },
            { id: "stat-4", value: res.rating ?? "4.9/5", label: "Host Satisfaction", icon: "Star" }
          ])
        }
      } catch (err) {
        console.error("Failed to load statistics:", err)
      }
    }
    loadStats()
  }, [])

  const iconMap: Record<string, React.ReactNode> = {
    Calendar: <Calendar className="h-6 w-6" style={{ color: "var(--accent)" }} />,
    Ticket: <Ticket className="h-6 w-6" style={{ color: "var(--accent)" }} />,
    ShieldCheck: <ShieldCheck className="h-6 w-6" style={{ color: "var(--accent)" }} />,
    Star: <Star className="h-6 w-6" style={{ color: "var(--accent)", fill: "var(--accent)" }} />
  }

  return (
    <section
      id="features"
      className="relative py-0 animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
        style={{ fontSize: "clamp(80px,14vw,200px)", overflow: "hidden", color: "rgba(23, 23, 28, 0.015)" }}
      >
        STATS
      </div>

      <div
        className="relative py-12"
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)"
        }}
      >
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

          {/* Eyebrow */}
          <div className="text-center mb-10">
            <span className="eyebrow-accent">Platform Numbers</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="stat-card group cursor-default flex flex-col items-center text-center"
                style={{ padding: "32px 24px" }}
              >
                {/* Icon pill */}
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: "rgba(255,119,89,0.06)",
                    border: "1px solid rgba(255,119,89,0.15)"
                  }}
                >
                  {iconMap[stat.icon]}
                </div>
                {/* Value — H2-scale per DESIGN.md */}
                <span
                  className="text-4xl font-medium block mb-1"
                  style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                >
                  {stat.value}
                </span>
                {/* Label — Eyebrow style muted */}
                <span
                  className="text-xs font-bold uppercase tracking-widest block"
                  style={{ color: "var(--body-muted)", letterSpacing: "0.06em" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
