import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function MapSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Filters Panel Skeleton (Desktop row / Mobile sheet trigger layout) */}
      <div className="p-5 rounded-2xl border border-border bg-muted/40 dark:bg-muted/10 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search box placeholder */}
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Category drop select */}
          <Skeleton className="h-10 w-full rounded-xl" />
          {/* Date range drop select */}
          <Skeleton className="h-10 w-full rounded-xl" />
          {/* Price/Location toggles */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Map and Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map Area (2/3 Column) */}
        <div className="lg:col-span-2 relative h-[450px] lg:h-[550px] w-full rounded-3xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
          {/* Simulated dot grid or radar pulse */}
          <div className="absolute inset-0 bg-sky-500/5 dark:bg-sky-400/1 animate-pulse" />
          
          <div className="relative flex flex-col items-center space-y-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>

          {/* Top-left bounds indicator tag */}
          <div className="absolute top-4 left-4">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>

        {/* Sidebar / Nearby Listings (1/3 Column) */}
        <div className="flex flex-col h-[450px] lg:h-[550px] bg-muted/30 dark:bg-muted/10 border border-border rounded-3xl p-5 overflow-hidden justify-between">
          <div className="space-y-4 flex-1 overflow-hidden">
            {/* Sidebar header */}
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>

            {/* Sidebar list items */}
            <div className="space-y-3 h-[calc(100%-40px)] overflow-y-auto pr-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/5 flex gap-3 text-left"
                >
                  <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                  <div className="flex-1 flex flex-col justify-between min-w-0 space-y-1">
                    <div>
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-2.5 w-1/2 rounded mt-1.5" />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Skeleton className="h-2.5 w-16 rounded" />
                      <Skeleton className="h-2.5 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar footer reset */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
