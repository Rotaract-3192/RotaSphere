import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-6 bg-card border border-border rounded-[24px]">
      {/* Wizard Progress/Steps Indicator */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-10 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div className="flex flex-col items-center shrink-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
            {/* Step Connector Line */}
            {step < 5 && (
              <Skeleton className="h-[2px] flex-1 min-w-[30px] mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form Fields Layout */}
      <div className="space-y-6">
        {/* Section title & subtitle placeholder */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Label + Input 1 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Label + Input 2 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Textarea field (Description) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* Drag & Drop File Upload Region */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center space-y-3 bg-muted/30 dark:bg-muted/10">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* Preset selections (grid of rounded thumbnails) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation actions at the bottom */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  )
}
