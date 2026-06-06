import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function TicketSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Dynamic multi-layout ticket page loaders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col border border-border rounded-xl bg-card p-6 relative overflow-hidden"
          >
            {/* Header Badge Placeholder */}
            {i === 2 && (
              <div className="mb-4">
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            )}

            {/* Plan Tier Title */}
            <Skeleton className="h-4 w-16 mb-2" />

            {/* Price tag */}
            <div className="flex items-baseline gap-2 mb-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Plan description */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Feature lists */}
            <div className="space-y-3 flex-1 mb-8">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <Skeleton className="h-3.5 w-full max-w-[140px]" />
                </div>
              ))}
            </div>

            {/* CTA action button */}
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Ticket Pass Skeleton - dashed border and barcode representation */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left section: Ticket metadata */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="hidden md:flex flex-col items-center justify-between py-4 relative">
            <div className="absolute top-0 -mt-2 w-4 h-4 bg-background dark:bg-zinc-950 border-b border-r border-border rounded-full" />
            <div className="h-full border-r border-dashed border-border" />
            <div className="absolute bottom-0 -mb-2 w-4 h-4 bg-background dark:bg-zinc-950 border-t border-r border-border rounded-full" />
          </div>

          {/* Right section: Barcode placeholder */}
          <div className="w-full md:w-48 p-6 flex flex-col items-center justify-center bg-muted/30 dark:bg-muted/10 border-t md:border-t-0 md:border-l border-border">
            <div className="space-y-2 w-full flex flex-col items-center">
              {/* Simulating barcode lines */}
              <div className="flex gap-[2px] h-12 w-full max-w-[120px] items-stretch justify-center opacity-40">
                {[2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2].map((w, idx) => (
                  <Skeleton key={idx} className="bg-accent" style={{ width: `${w}px` }} />
                ))}
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
