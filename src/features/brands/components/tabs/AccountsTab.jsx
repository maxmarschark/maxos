import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { EmptyState } from "../../../../components/ui/EmptyState"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/Table"
import { Badge } from "../../../../components/ui/Badge"
import { formatCurrency } from "../../../../lib/format"
import { getAccountsForBrand } from "../../utils"

export function AccountsTab({ brandName }) {
  const navigate = useNavigate()
  const accounts = getAccountsForBrand(brandName)

  if (accounts.length === 0) {
    return (
      <Card padding="none">
        <EmptyState
          icon={Building2}
          title="No linked accounts"
          description="No accounts currently carry this brand. Update account records to link them."
        />
      </Card>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Balance Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow
            key={account.id}
            onClick={() => navigate(`/accounts/${account.id}`)}
          >
            <TableCell>
              <div className="font-medium text-zinc-200">{account.businessName}</div>
            </TableCell>
            <TableCell className="text-zinc-400">{account.owner || "—"}</TableCell>
            <TableCell>
              <Badge variant="default" className="normal-case tracking-normal">
                {account.city}, {account.state}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-zinc-300">
              {formatCurrency(account.outstandingBalance)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
