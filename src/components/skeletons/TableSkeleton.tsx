import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Search & Header actions skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-8 w-full sm:w-60 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-border rounded-xl bg-card p-5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border pb-3">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="pb-3 pr-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-muted/10">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="py-3.5 pr-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton className="h-3.5 w-24" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack View */}
      <div className="block md:hidden space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-grow space-y-2 min-w-0">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-full h-1.5 rounded-full" />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/20">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
