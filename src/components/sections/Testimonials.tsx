"use client"

import * as React from "react"
import { Star, Sparkles, Quote } from "lucide-react"
import { mockTestimonials } from "@/data/mockData"

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 relative bg-background overflow-hidden bg-radial-grid">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-indigo-500/15 shadow-sm text-xs font-semibold text-indigo-500 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Loved by Event <span className="text-gradient">Creators</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Read reviews from independent event organizers, enterprise planners, and community hosts who run their programs on RotaSphere.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockTestimonials.map((t) => (
            <div
              key={t.id}
              className="glass-card border border-white/10 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative group"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors pointer-events-none">
                <Quote className="h-12 w-12 transform rotate-180" />
              </div>

              <div className="space-y-4 relative z-10">
                {/* Rating */}
                <div className="flex items-center text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                {/* Content */}
                <p className="text-sm text-muted-foreground italic leading-relaxed text-left">
                  &quot;{t.content}&quot;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-muted/50 text-left">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover border border-muted shadow-sm shrink-0"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold block">
                    {t.role}, <span className="text-indigo-500 dark:text-indigo-400">{t.company}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic CTA at the bottom of Testimonials */}
        <div className="mt-20 glass-card max-w-4xl mx-auto rounded-3xl p-8 md:p-12 border border-white/15 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-2xl">
          {/* Subtle glow border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Ready to host your next successful event?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Start building your custom tickets and schedule. Set up takes less than 2 minutes.
            </p>
          </div>
          <div className="shrink-0 flex gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl text-sm font-semibold h-11 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
