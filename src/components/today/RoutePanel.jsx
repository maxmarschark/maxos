import { MapPin, Navigation } from "lucide-react"
import { Card, CardHeader, CardFooter } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"

function RouteStop({ stop, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[11px] font-semibold text-zinc-400">
          {stop.order}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-zinc-800" />}
      </div>
      <div className={isLast ? "pb-0" : "pb-4"}>
        <div className="text-[13px] font-medium text-zinc-200">{stop.name}</div>
        <div className="mt-0.5 text-xs text-zinc-500">
          {stop.address}, {stop.city}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="default" className="normal-case tracking-normal">
            {stop.action}
          </Badge>
          <span className="text-[11px] text-zinc-600">{stop.duration}</span>
        </div>
      </div>
    </div>
  )
}

export function RoutePanel({ route }) {
  return (
    <Card padding="md">
      <CardHeader
        title="Suggested Route"
        description={route.summary}
      />
      <div className="mb-1 flex items-center gap-2 text-zinc-500">
        <MapPin size={14} />
        <span className="text-xs font-medium">Optimized for collections first</span>
      </div>
      {route.stops.map((stop, i) => (
        <RouteStop
          key={stop.id}
          stop={stop}
          isLast={i === route.stops.length - 1}
        />
      ))}
      <CardFooter>
        <Button variant="secondary" size="sm" icon={Navigation}>
          Open in Maps
        </Button>
      </CardFooter>
    </Card>
  )
}
