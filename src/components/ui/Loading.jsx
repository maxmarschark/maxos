import { cn } from "../../lib/cn"

export function Spinner({ size = "md", className }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500",
        sizes[size],
        className
      )}
    />
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-800/80", className)}
    />
  )
}

export function LoadingState({ message = "Loading...", className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
    >
      <Spinner />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
