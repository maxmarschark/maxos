import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { SortableHead } from "../../../components/ui/SortableTable"
import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { EntityLinks } from "../../../components/ui/EntityLink"
import { formatDate } from "../../../lib/format"
import { PRIORITY_VARIANTS, STATUS_VARIANTS } from "../constants"
import { cn } from "../../../lib/cn"

export function TasksTable({
  tasks,
  sortField,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onMarkComplete,
  todayISO,
}) {
  return (
    <Table maxHeight="70vh">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <SortableHead
            field="title"
            label="Title"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            resizable
          />
          <SortableHead
            field="type"
            label="Type"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="priority"
            label="Priority"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="status"
            label="Status"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <SortableHead
            field="dueDate"
            label="Due"
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
          />
          <TableHead>Linked To</TableHead>
          <TableHead className="w-28" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const overdue =
            task.dueDate &&
            task.status !== "Complete" &&
            task.status !== "Snoozed" &&
            task.dueDate < todayISO

          return (
            <TableRow key={task.id}>
              <TableCell>
                <button
                  type="button"
                  onClick={() => onMarkComplete(task)}
                  className="text-zinc-600 transition-colors hover:text-indigo-400"
                  aria-label={task.status === "Complete" ? "Completed" : "Mark complete"}
                >
                  {task.status === "Complete" ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>
              </TableCell>
              <TableCell>
                <p
                  className={cn(
                    "font-medium text-zinc-200",
                    task.status === "Complete" && "line-through text-zinc-500"
                  )}
                >
                  {task.title}
                </p>
                {task.dueTime && (
                  <p className="text-xs text-zinc-600">{task.dueTime}</p>
                )}
              </TableCell>
              <TableCell className="text-zinc-400">{task.type}</TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANTS[task.priority] ?? "default"} className="normal-case tracking-normal">
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[task.status] ?? "default"} className="normal-case tracking-normal">
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-400">
                {task.dueDate ? (
                  <span className={overdue ? "text-red-400" : undefined}>
                    {formatDate(task.dueDate)}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-[220px]">
                <EntityLinks
                  items={[
                    {
                      key: "account",
                      to: task.accountId ? `/accounts/${task.accountId}` : null,
                      label: task.accountName,
                    },
                    {
                      key: "contact",
                      to: task.contactId ? `/contacts/${task.contactId}` : null,
                      label: task.contactName,
                    },
                    {
                      key: "brand",
                      to: task.brandId ? `/brands/${task.brandId}` : null,
                      label: task.brandName,
                    },
                    {
                      key: "order",
                      to: task.orderId ? `/orders/${task.orderId}` : null,
                      label: task.orderNumber ? `#${task.orderNumber}` : "",
                    },
                  ]}
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Pencil}
                    aria-label="Edit task"
                    onClick={() => onEdit(task)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="Delete task"
                    className="hover:text-red-400"
                    onClick={() => onDelete(task)}
                  />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
