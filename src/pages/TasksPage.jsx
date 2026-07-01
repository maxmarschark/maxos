import { useMemo, useState } from "react"
import { CheckSquare, Plus } from "lucide-react"
import { useTasks } from "../features/tasks/useTasks"
import { useAccounts } from "../features/accounts/useAccounts"
import { useContacts } from "../features/contacts/useContacts"
import { useOrders } from "../features/orders/useOrders"
import { TasksTable } from "../features/tasks/components/TasksTable"
import { TaskFormModal } from "../features/tasks/components/TaskFormModal"
import { DeleteTaskModal } from "../features/tasks/components/DeleteTaskModal"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { Select } from "../components/ui/Select"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Pagination } from "../components/ui/Pagination"
import { useToast } from "../components/ui/useToast"
import { usePagination } from "../hooks/usePagination"
import { useTableSort } from "../hooks/useTableSort"
import { sortRows } from "../lib/tableSort"
import { getTodayISO } from "../features/today/utils"
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  DUE_DATE_FILTERS,
  PRIORITY_RANK,
} from "../features/tasks/constants"
import { filterTasks } from "../features/tasks/utils"
import { loadFromStorage } from "../lib/storage"
import { BRANDS_STORAGE_KEY } from "../features/brands/constants"
import { SEED_BRANDS } from "../features/brands/seed"

const SORT_FIELD_TYPES = {
  dueDate: "date",
}

function sortByField(tasks, sortField, sortDir) {
  if (sortField === "priority") {
    return [...tasks].sort((a, b) => {
      const diff = (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0)
      return sortDir === "asc" ? -diff : diff
    })
  }
  return sortRows(tasks, sortField, sortDir, SORT_FIELD_TYPES)
}

export function TasksPage() {
  const { toast } = useToast()
  const { tasks, addTask, updateTask, deleteTask, markComplete } = useTasks()
  const { accounts } = useAccounts()
  const { contacts } = useContacts()
  const { orders } = useOrders()
  const brands = useMemo(() => loadFromStorage(BRANDS_STORAGE_KEY, SEED_BRANDS), [])

  const todayISO = getTodayISO()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [dueDateFilter, setDueDateFilter] = useState("")
  const { sortField, sortDir, handleSort } = useTableSort("dueDate", "asc")
  const [pageSize, setPageSize] = useState(25)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)

  const filtered = useMemo(() => {
    const rows = filterTasks(tasks, {
      search,
      statusFilter,
      priorityFilter,
      dueDateFilter,
      todayISO,
    })
    return sortByField(rows, sortField, sortDir)
  }, [tasks, search, statusFilter, priorityFilter, dueDateFilter, sortField, sortDir, todayISO])

  const pagination = usePagination(filtered, pageSize)

  const openCount = tasks.filter((t) => t.status !== "Complete").length

  function handleAdd() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function handleEdit(task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  function handleFormSubmit(data) {
    if (editingTask) {
      updateTask(editingTask.id, data)
      toast(`Updated "${data.title}"`)
    } else {
      addTask(data)
      toast(`Created "${data.title}"`)
    }
  }

  function handleMarkComplete(task) {
    if (task.status === "Complete") return
    markComplete(task.id)
    toast(`Completed "${task.title}"`)
  }

  function handleDelete() {
    deleteTask(deletingTask.id)
    toast(`Deleted "${deletingTask.title}"`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CheckSquare}
        title="Tasks"
        description={`${openCount} open task${openCount !== 1 ? "s" : ""} · ${tasks.length} total`}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAdd}>
            Add Task
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="flex-1"
          placeholder="Search tasks, links, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-36"
        >
          <option value="">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          {DUE_DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={CheckSquare}
            title={tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
            description={
              tasks.length === 0
                ? "Create tasks to track follow-ups, collections, and daily work."
                : "Try adjusting your search or filters."
            }
            actionLabel={tasks.length === 0 ? "Add Task" : undefined}
            onAction={tasks.length === 0 ? handleAdd : undefined}
          />
        </Card>
      ) : (
        <>
          <TasksTable
            tasks={pagination.paginatedItems}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={setDeletingTask}
            onMarkComplete={handleMarkComplete}
            todayISO={todayISO}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            pageSize={pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        accounts={accounts}
        contacts={contacts}
        brands={brands}
        orders={orders}
      />

      <DeleteTaskModal
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        taskTitle={deletingTask?.title ?? ""}
      />
    </div>
  )
}
