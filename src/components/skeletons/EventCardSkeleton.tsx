import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function EventCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center p-5 relative w-full max-w-sm mx-auto">
      {/* Circle Banner/Image Skeleton */}
      <div className="relative w-60 h-60 mx-auto mb-6">
        <Skeleton className="w-full h-full rounded-full" />
        {/* Price Tag docked top-left */}
        <Skeleton className="absolute -top-1 -left-1 h-5 w-16 rounded-full" />
      </div>

      {/* Category Pill */}
      <div className="mb-3">
        <Skeleton className="h-4 w-24 mx-auto rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-48 mx-auto mb-3" />

      {/* Meta (Date and Location) */}
      <div className="flex items-center justify-center gap-3 mb-5 w-full">
        <Skeleton className="h-4 w-20 rounded" />
        <span className="text-accent/20">•</span>
        <Skeleton className="h-4 w-24 rounded" />
      </div>

      {/* Capacity Progress Bar */}
      <div className="w-full max-w-[220px] mb-5 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="w-full h-1.5 rounded-full" />
      </div>

      {/* Get Ticket Pass Button */}
      <Skeleton className="h-9 w-32 rounded-full" />
    </div>
  )
}
