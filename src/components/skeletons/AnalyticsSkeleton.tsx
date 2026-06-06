import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph Skeleton Card */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-none p-5 flex flex-col justify-between rounded-[16px] min-h-[300px]">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              {/* Title */}
              <Skeleton className="h-4 w-36 rounded" />
              {/* Growth Stat */}
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
            {/* Description Subtitle */}
            <Skeleton className="h-3 w-64 rounded" />
          </div>

          {/* Simulated Graph Chart Bars */}
          <div className="h-40 flex items-end justify-between gap-4 px-2 border-b border-border pb-2 mt-8">
            <Skeleton className="w-full h-[30%] rounded-t" />
            <Skeleton className="w-full h-[55%] rounded-t" />
            <Skeleton className="w-full h-[45%] rounded-t" />
            <Skeleton className="w-full h-[80%] rounded-t" />
            <Skeleton className="w-full h-[65%] rounded-t" />
            <Skeleton className="w-full h-[95%] rounded-t" />
            <Skeleton className="w-full h-[85%] rounded-t" />
          </div>
          <div className="flex justify-between px-2 pt-2 text-[9px]">
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        </Card>

        {/* Right column: Performance Breakdown Skeleton */}
        <Card className="border border-border bg-card shadow-none p-5 flex flex-col justify-between rounded-[16px]">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-44 rounded" />
            </div>
            
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-3.5 w-16 rounded" />
                  </div>
                  <Skeleton className="w-full h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="w-full h-9 rounded-full mt-6" />
        </Card>
      </div>

      {/* Grid of growth categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((idx) => (
          <Card key={idx} className="border border-border bg-card p-5 shadow-none rounded-[16px]">
            <Skeleton className="h-4 w-36 rounded mb-4" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex justify-between items-center py-2 border-b border-border">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3.5 w-12 rounded" />
                    <Skeleton className="h-3.5 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
