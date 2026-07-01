import { ActivityTimelineInline } from "../../../components/activity/ActivityTimeline"
import { getContactFollowUpHistory } from "../../../lib/relationships"

export function ContactFollowUpHistory({ contact, tasks }) {
  const history = getContactFollowUpHistory(contact, tasks)

  return (
    <ActivityTimelineInline
      events={history}
      emptyMessage="No follow-up history yet."
    />
  )
}
