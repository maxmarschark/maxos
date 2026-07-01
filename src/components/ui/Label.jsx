import { cn } from "../../lib/cn"

export function Label({ children, className, required, htmlFor, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-xs font-medium text-zinc-400", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  )
}
