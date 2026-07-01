import { cn } from "../../lib/cn"

export function Table({ children, className, stickyHeader = true, maxHeight }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-zinc-800/80",
        maxHeight && "overflow-y-auto",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        className={cn("w-full min-w-[640px] text-sm", stickyHeader && "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10")}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className }) {
  return (
    <thead
      className={cn(
        "border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur-sm",
        className
      )}
    >
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
        onClick && "cursor-pointer hover:bg-zinc-800/40",
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
        "whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500",
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

export function TableFooter({ children, className }) {
  return (
    <tfoot className={cn("border-t border-zinc-800/80 bg-zinc-900/30", className)}>
      {children}
    </tfoot>
  )
}
