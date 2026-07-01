import { ModulePage } from "./ModulePage"
import { getRouteById } from "../config/routes"
import { useDeals } from "../features/deals/useDeals"
import { useCloudSync } from "../features/cloud/useCloudSync"

function createModulePage(id, actionLabel) {
  return function Page() {
    const route = getRouteById(id)
    const { storageMode: dealsStorageMode } = useDeals()
    const { connected } = useCloudSync()

    const storageMode =
      id === "deals"
        ? dealsStorageMode
        : connected
          ? "cloud"
          : "local"

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

export const DealsPage = createModulePage("deals", "New Deal")
export const ReportsPage = createModulePage("reports")
