import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shimmer-wave rounded-md border border-sky-400/15 dark:border-sky-300/10 shadow-[0_0_12px_rgba(30,136,229,0.02)]",
        className
      )}
      {...props}
    />
  )
}
