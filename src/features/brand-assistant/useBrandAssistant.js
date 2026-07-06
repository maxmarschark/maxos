import { useMemo } from "react"
import { useAccounts } from "../accounts/useAccounts"
import { useContacts } from "../contacts/useContacts"
import { useOrders } from "../orders/useOrders"
import { useDeals } from "../deals/useDeals"
import { useTasks } from "../tasks/useTasks"
import { useCommissions } from "../commissions/useCommissions"
import { useActivity } from "../activity/useActivity"
import { useBrandFiles } from "../brand-files/useBrandFiles"
import { buildBrandAssistantContext } from "./buildBrandContext"
import { answerBrandQuestion } from "./responses"

export function useBrandAssistant(brand) {
  const { accounts } = useAccounts()
  const { contacts } = useContacts()
  const { orders } = useOrders()
  const { deals } = useDeals()
  const { tasks } = useTasks()
  const { commissions } = useCommissions()
  const { activity } = useActivity()
  const { files: assets } = useBrandFiles(brand?.id)

  const context = useMemo(() => {
    if (!brand) return null
    return buildBrandAssistantContext({
      brand,
      accounts,
      contacts,
      orders,
      deals,
      tasks,
      assets,
      commissions,
      activityEvents: activity,
    })
  }, [brand, accounts, contacts, orders, deals, tasks, assets, commissions, activity])

  function ask(question, promptId = null) {
    if (!context) {
      return "Brand data is not available."
    }
    return answerBrandQuestion(question, context, promptId)
  }

  return { context, ask }
}
