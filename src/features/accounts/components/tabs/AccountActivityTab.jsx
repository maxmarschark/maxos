import { ActivityTimeline } from "../../../../components/activity/ActivityTimeline"
import { buildActivityTimeline } from "../../../../lib/relationships"

export function AccountActivityTab({ accountId, ctx }) {
  const events = buildActivityTimeline(ctx, { accountId })

  return (
    <ActivityTimeline
      events={events}
      emptyMessage="No activity recorded for this account yet."
    />
  )
}
