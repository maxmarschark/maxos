import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Button } from "../components/ui/Button"
import { Plus } from "lucide-react"

export function ModulePage({ icon: Icon, title, description, actionLabel }) {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Icon}
        title={title}
        description={description}
        actions={
          actionLabel ? (
            <Button variant="primary" size="sm" icon={Plus} disabled>
              {actionLabel}
            </Button>
          ) : null
        }
      />

      <Card padding="none">
        <EmptyState
          icon={Icon}
          title={`No ${title.toLowerCase()} yet`}
          description={`Your ${title.toLowerCase()} module is ready. Data and CRUD workflows will connect here.`}
        />
      </Card>
    </div>
  )
}
