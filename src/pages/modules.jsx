import { ModulePage } from "./ModulePage"
import { getRouteById } from "../config/routes"
import { useCloudSync } from "../features/cloud/useCloudSync"

export { DealsPage } from "./DealsPage"

function createModulePage(id, actionLabel) {
  return function Page() {
    const route = getRouteById(id)
    const { connected } = useCloudSync()

    const storageMode = connected ? "cloud" : "local"

    return (
      <ModulePage
        icon={route.icon}
        title={route.name}
        description={route.description}
        actionLabel={actionLabel}
        storageMode={storageMode}
      />
    )
  }
}

export const ReportsPage = createModulePage("reports")
