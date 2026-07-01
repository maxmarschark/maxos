import { Tags } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { Badge } from "../../../../components/ui/Badge"
import { EntityLink } from "../../../../components/ui/EntityLink"
import { getAccountBrands } from "../../../../lib/relationships"

export function AccountBrandsTab({ account, brands }) {
  const carried = getAccountBrands(account, brands)

  if (carried.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Tags}
          title="No brands recorded"
          description="Add brands carried on the account profile to link them here."
        />
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {carried.map((brand) => (
        <Card
          key={brand.name}
          padding="sm"
          className="flex items-center justify-between gap-3 transition-colors hover:border-zinc-700/60"
        >
          <div className="min-w-0">
            {brand.id ? (
              <EntityLink to={`/brands/${brand.id}`} className="text-sm font-medium">
                {brand.name}
              </EntityLink>
            ) : (
              <span className="text-sm font-medium text-zinc-200">{brand.name}</span>
            )}
            {!brand.id && (
              <p className="mt-0.5 text-xs text-zinc-600">Not linked to a brand record</p>
            )}
          </div>
          {brand.status && (
            <Badge variant="primary" className="shrink-0 normal-case tracking-normal">
              {brand.status}
            </Badge>
          )}
        </Card>
      ))}
    </div>
  )
}
