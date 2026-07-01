import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { Button } from "../components/ui/Button"
import { Plus } from "lucide-react"

export function ModulePage({ icon: Icon, title, description, actionLabel }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        {actionLabel && (
          <Button variant="primary" size="sm" icon={Plus}>
            {actionLabel}
          </Button>
        )}
      </div>

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
