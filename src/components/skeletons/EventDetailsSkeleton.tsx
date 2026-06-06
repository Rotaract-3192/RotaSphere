import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function EventDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl space-y-8 animate-pulse">
      {/* Banner Image Skeleton */}
      <Skeleton className="h-[250px] sm:h-[350px] md:h-[450px] w-full rounded-2xl" />

      {/* Main Details Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            {/* Category Pill */}
            <Skeleton className="h-5 w-24 rounded-full" />
            {/* Title */}
            <Skeleton className="h-9 w-3/4 rounded-md" />
            
            {/* Meta Row */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Skeleton className="h-4.5 w-32 rounded" />
              <Skeleton className="h-4.5 w-40 rounded" />
            </div>
          </div>

          {/* Organizer Info Box */}
          <Card className="border border-border bg-card p-4 rounded-xl shadow-none">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            </div>
          </Card>

          {/* Long Description Body */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-[96%] rounded" />
            <Skeleton className="h-4 w-[98%] rounded" />
            <Skeleton className="h-4 w-[90%] rounded" />
            <Skeleton className="h-4 w-[94%] rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          {/* FAQ Accordion Section */}
          <div className="space-y-3 pt-6">
            <Skeleton className="h-5 w-36 rounded" />
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4.5 w-2/3 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Ticket Booking Panel & Map */}
        <div className="space-y-6">
          {/* Booking Card Skeleton */}
          <Card className="border border-border bg-card shadow-none p-5 rounded-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <Skeleton className="h-5.5 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              
              {/* Ticket Quantity selector */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-16 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              {/* pricing summary mock */}
              <div className="bg-muted/40 dark:bg-muted/10 p-3 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-12 rounded" />
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border/20">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              </div>

              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </Card>

          {/* Map sidebar container */}
          <Card className="border border-border bg-card shadow-none p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            
            {/* Map Frame placeholder */}
            <Skeleton className="h-40 w-full rounded-xl" />

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-2/3 rounded" />
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
