import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  User,
} from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Badge } from "../../../../components/ui/Badge"
import { EntityLink } from "../../../../components/ui/EntityLink"
import { formatCurrency, formatDate } from "../../../../lib/format"
import { getAccountBrands } from "../../../../lib/relationships"

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 hover:text-indigo-300"
    >
      {value}
    </a>
  ) : (
    <span className="text-zinc-200">{value}</span>
  )

  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-zinc-600" />
      <div className="min-w-0">
        <div className="text-xs text-zinc-600">{label}</div>
        <div className="mt-0.5 text-sm">{content}</div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  const accents = {
    red: "text-red-400",
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
  }
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`mt-2 text-xl font-semibold ${accents[accent]}`}>{value}</div>
    </Card>
  )
}

export function OverviewTab({ account, brands = [] }) {
  const websiteHref = account.website
    ? account.website.startsWith("http")
      ? account.website
      : `https://${account.website}`
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Outstanding Balance"
          value={formatCurrency(account.outstandingBalance)}
          accent={account.outstandingBalance > 0 ? "red" : "emerald"}
        />
        <StatCard
          icon={Calendar}
          label="Last Visit"
          value={formatDate(account.lastVisit)}
          accent="indigo"
        />
        <StatCard
          icon={Calendar}
          label="Next Follow-up"
          value={formatDate(account.nextFollowUp)}
          accent="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold text-zinc-100">Contact Info</h3>
          <InfoRow icon={User} label="Owner" value={account.owner} />
          <InfoRow icon={Phone} label="Phone" value={account.phone} />
          <InfoRow icon={Mail} label="Email" value={account.email} href={account.email ? `mailto:${account.email}` : null} />
          <InfoRow icon={Globe} label="Website" value={account.website} href={websiteHref} />
        </Card>

        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold text-zinc-100">Location</h3>
          <InfoRow icon={MapPin} label="Address" value={account.address} />
          <InfoRow
            icon={MapPin}
            label="City / State"
            value={
              account.city || account.state
                ? `${account.city}${account.city && account.state ? ", " : ""}${account.state}`
                : null
            }
          />
        </Card>
      </div>

      <Card padding="md">
        <h3 className="mb-3 text-sm font-semibold text-zinc-100">Brands Carried</h3>
        {account.brandsCarried.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {getAccountBrands(account, brands).map((brand) =>
              brand.id ? (
                <EntityLink key={brand.name} to={`/brands/${brand.id}`}>
                  <Badge variant="primary" className="normal-case tracking-normal">
                    {brand.name}
                  </Badge>
                </EntityLink>
              ) : (
                <Badge key={brand.name} variant="primary" className="normal-case tracking-normal">
                  {brand.name}
                </Badge>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No brands recorded yet.</p>
        )}
      </Card>
    </div>
  )
}
