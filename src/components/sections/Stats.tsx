"use client"

import * as React from "react"
import { Calendar, Ticket, ShieldCheck, Star } from "lucide-react"
import { mockStats } from "@/data/mockData"

export function Stats() {
  const iconMap: Record<string, React.ReactNode> = {
    Calendar: <Calendar className="h-6 w-6 text-indigo-500" />,
    Ticket: <Ticket className="h-6 w-6 text-purple-500" />,
    ShieldCheck: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
    Star: <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
  }

  return (
    <section id="features" className="py-12 relative bg-background/50">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat) => (
            <div
              key={stat.id}
              className="glass-card border border-white/10 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-muted/40 border border-muted/50 flex items-center justify-center shrink-0 shadow-sm">
                {iconMap[stat.icon]}
              </div>
              <div>
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground block">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground font-medium block mt-1">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
