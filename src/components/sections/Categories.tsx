"use client"

import * as React from "react"
import { Cpu, Music, Briefcase, Utensils, Palette, Activity, Sparkles, ChevronRight } from "lucide-react"
import { mockCategories } from "@/data/mockData"

export function Categories() {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Cpu,
    Music,
    Briefcase,
    Utensils,
    Palette,
    Activity
  }

  return (
    <section id="categories" className="py-20 relative bg-background/50 overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-indigo-500/15 shadow-sm text-xs font-semibold text-indigo-500 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Categorized for You</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Explore <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-3">
              Find precisely what you&apos;re looking for. Select a category to see specialized workshops, seminars, and live entertainment.
            </p>
          </div>
          <a href="#events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 mt-4 md:mt-0 transition-colors group">
            Browse all events
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCategories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Cpu
            return (
              <div
                key={cat.id}
                className="glass-card border border-white/10 dark:border-white/5 rounded-2xl p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/30 flex items-start gap-4 cursor-pointer group"
              >
                {/* Icon box */}
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105">
                  <IconComponent className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
                </div>
                {/* Text description */}
                <div className="text-left space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base text-foreground group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                      {cat.count} Events
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
