import { Mail, Phone, Globe, User, DollarSign, Percent } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Badge } from "../../../../components/ui/Badge"
import { formatCurrency, formatPercent } from "../../../../lib/format"
import { STATUS_VARIANTS } from "../../constants"
import { getActiveAccountCount } from "../../utils"

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
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
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

export function OverviewTab({ brand, metrics }) {
  const websiteHref = brand.website
    ? brand.website.startsWith("http")
      ? brand.website
      : `https://${brand.website}`
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={DollarSign}
          label="Total Sales"
          value={formatCurrency(metrics?.totalSales ?? 0)}
          accent="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Total Commission"
          value={formatCurrency(metrics?.totalCommission ?? 0)}
          accent="amber"
        />
        <StatCard
          icon={User}
          label="Active Accounts"
          value={getActiveAccountCount(brand.brandName)}
          accent="indigo"
        />
      </div>

      {brand.description && (
        <Card padding="md">
          <h3 className="mb-2 text-sm font-semibold text-zinc-100">About</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{brand.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold text-zinc-100">Contact</h3>
          <InfoRow icon={User} label="Main Contact" value={brand.mainContact} />
          <InfoRow icon={Mail} label="Email" value={brand.contactEmail} href={brand.contactEmail ? `mailto:${brand.contactEmail}` : null} />
          <InfoRow icon={Phone} label="Phone" value={brand.contactPhone} />
          <InfoRow icon={Globe} label="Website" value={brand.website} href={websiteHref} />
        </Card>

        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold text-zinc-100">Partnership</h3>
          <div className="py-2.5">
            <div className="text-xs text-zinc-600">Status</div>
            <div className="mt-1.5">
              <Badge variant={STATUS_VARIANTS[brand.status]} className="normal-case tracking-normal">
                {brand.status}
              </Badge>
            </div>
          </div>
          <InfoRow icon={Percent} label="Commission Default" value={formatPercent(brand.commissionDefault)} />
          <InfoRow icon={DollarSign} label="Products in Catalog" value={String(brand.products.length)} />
        </Card>
      </div>

      {brand.notes && (
        <Card padding="md">
          <h3 className="mb-2 text-sm font-semibold text-zinc-100">Internal Notes</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{brand.notes}</p>
        </Card>
      )}
    </div>
  )
}
