import { cn } from "../../lib/cn"

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn("border-b border-zinc-800/80 bg-zinc-900/50", className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }) {
  return <tbody className={cn("divide-y divide-zinc-800/60", className)}>{children}</tbody>
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-zinc-800/30",
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500",
        className
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-4 py-3 text-zinc-300", className)}>{children}</td>
  )
}
