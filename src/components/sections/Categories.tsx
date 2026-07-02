"use client"

import * as React from "react"
import { Heart, Briefcase, Users, Globe, IndianRupee, Sparkles, ChevronRight } from "lucide-react"
import { mockCategories, EventItem } from "@/data/mockData"
import { getEventsAction } from "@/app/actions/eventActions"
import { motion, useInView } from "framer-motion"

const categoryColors: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  "cat-1": { bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.2)", icon: "#FB7185", glow: "rgba(251,113,133,0.1)" },
  "cat-2": { bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)",  icon: "#60A5FA", glow: "rgba(96,165,250,0.1)"  },
  "cat-3": { bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  icon: "#34D399", glow: "rgba(52,211,153,0.1)"  },
  "cat-4": { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  icon: "#FBBF24", glow: "rgba(251,191,36,0.1)"  },
  "cat-5": { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", icon: "#A78BFA", glow: "rgba(167,139,250,0.1)" },
  "cat-6": { bg: "rgba(79,195,247,0.08)",  border: "rgba(79,195,247,0.2)",  icon: "#4FC3F7", glow: "rgba(79,195,247,0.1)"  },
}

function CategoryCard({ cat, index, colorScheme, IconComponent }: {
  cat: typeof mockCategories[0];
  index: number;
  colorScheme: typeof categoryColors[string];
  IconComponent: React.ComponentType<{ className?: string }>;
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href="/events"
        className="flex items-start gap-5 p-6 group cursor-pointer relative overflow-hidden"
        style={{
          background: "var(--card)",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          textDecoration: "none",
          display: "flex",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = colorScheme.border
          el.style.transform = "translateY(-5px) scale(1.01)"
          el.style.boxShadow = `0 20px 50px -8px ${colorScheme.glow}, 0 0 0 1px ${colorScheme.border}`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = "var(--border)"
          el.style.transform = "translateY(0) scale(1)"
          el.style.boxShadow = "none"
        }}
      >
        {/* Hover corner glow */}
        <div
          className="absolute -top-8 -right-8 h-24 w-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, ${colorScheme.glow} 0%, transparent 70%)`, filter: "blur(12px)" }}
        />

        {/* Hover subtle gradient overlay */}
        <div
          className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${colorScheme.bg} 0%, transparent 60%)` }}
        />

        {/* Icon */}
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: colorScheme.bg,
            border: `1px solid ${colorScheme.border}`,
          }}
        >
        <div
          style={{ color: colorScheme.icon } as React.CSSProperties}
        >
          <IconComponent className="h-6 w-6 transition-all duration-300" />
        </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-left relative z-10 min-w-0">
          <div className="flex justify-between items-center gap-2 mb-1.5">
            <h3
              className="font-bold text-base"
              style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
            >
              {cat.name}
            </h3>
            <span
              className="text-[10px] font-extrabold shrink-0 transition-all duration-300"
              style={{
                background: colorScheme.bg,
                color: colorScheme.icon,
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1px solid ${colorScheme.border}`,
              }}
            >
              {cat.count} Events
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--muted-foreground)", letterSpacing: "-0.01em" }}
          >
            {cat.description}
          </p>
        </div>
      </a>
    </motion.div>
  )
}

export function Categories() {
  const [categories, setCategories] = React.useState(mockCategories)
  const sectionRef = React.useRef<HTMLElement>(null)
  const headerInView = useInView(sectionRef, { once: true, margin: "-60px" })

  React.useEffect(() => {
    async function loadCategoryCounts() {
      try {
        const res = await getEventsAction()
        if (res.success) {
          const eventsList = res.events as EventItem[]
          const isRealDb = !res.simulated
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
      ref={sectionRef}
      id="categories"
      className="relative section-padding overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ghost Watermark */}
      <div
        className="absolute top-0 right-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(60px, 11vw, 160px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "var(--foreground)",
          opacity: 0.012,
          lineHeight: 1,
          userSelect: "none"
        }}
      >
        EXPLORE
      </div>

      {/* Ambient blobs */}
      <div
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute top-0 right-0 h-72 w-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 3%, transparent) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-5"
        >
          <div className="max-w-xl">
            <div className="mb-4">
              <span className="eyebrow-accent">Categorized For You</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold"
              style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}
            >
              Explore Event{" "}
              <span className="gradient-text-animated">Categories</span>
            </h2>
            <p
              className="mt-4 leading-relaxed text-sm sm:text-base"
              style={{ color: "var(--muted-foreground)", letterSpacing: "-0.01em" }}
            >
              Find precisely what you&apos;re looking for. Specialized workshops,
              seminars, and live entertainment across every interest.
            </p>
          </div>

          <a
            href="/events"
            className="inline-flex items-center gap-1.5 font-bold transition-all duration-200 group shrink-0 link-underline-anim"
            style={{
              color: "var(--accent)",
              fontSize: "14px",
              letterSpacing: "-0.02em"
            }}
          >
            Browse all events
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </a>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const IconComponent = iconMap[cat.icon] || Heart
            const colorScheme = categoryColors[cat.id] || categoryColors["cat-1"]
            return (
              <CategoryCard
                key={cat.id}
                cat={cat}
                index={i}
                colorScheme={colorScheme}
                IconComponent={IconComponent}
              />
            )
          })}
        </div>

      </div>
    </section>
  )
}
