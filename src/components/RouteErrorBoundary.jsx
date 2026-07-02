import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Button } from "./ui/Button"

export function RouteErrorBoundary() {
  const error = useRouteError()

  let title = "Something went wrong"
  let message = "This page could not be loaded. Try again or return to Today."

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText || "Error"}`
    message =
      typeof error.data === "string"
        ? error.data
        : error.data?.message ?? message
  } else if (error instanceof Error) {
    message = error.message || message
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-900/50 bg-red-950/20">
        <AlertTriangle size={22} className="text-red-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Link to="/">
          <Button variant="primary" size="sm">
            Go to Today
          </Button>
        </Link>
      </div>
    </div>
  )
}
