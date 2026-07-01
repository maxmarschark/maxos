import { Badge } from "../../../components/ui/Badge"
import { EVENT_SOURCE } from "../../google-calendar/constants"

const sourceConfig = {
  [EVENT_SOURCE.GOOGLE]: { label: "Google", variant: "primary" },
  [EVENT_SOURCE.MAX_OS]: { label: "Max OS", variant: "default" },
}

export function EventSourceBadge({ source, className }) {
  const config = sourceConfig[source] ?? sourceConfig[EVENT_SOURCE.MAX_OS]
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
