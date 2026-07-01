import { Badge } from "./Badge"

export function StorageModeBadge({ mode }) {
  return (
    <Badge
      variant={mode === "cloud" ? "success" : "default"}
      className="normal-case tracking-normal"
    >
      {mode === "cloud" ? "CLOUD" : "LOCAL"}
    </Badge>
  )
}
