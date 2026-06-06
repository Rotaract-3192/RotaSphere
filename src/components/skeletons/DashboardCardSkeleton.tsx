import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardCardSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-none rounded-[16px] w-full">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-2.5 flex-1 pr-4">
          {/* Label Title */}
          <Skeleton className="h-3 w-24 rounded" />
          
          {/* Big Metric Value */}
          <Skeleton className="h-7 w-20 rounded-md" />
          
          {/* Description */}
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        
        {/* Icon slot on the right */}
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      </CardContent>
    </Card>
  )
}
