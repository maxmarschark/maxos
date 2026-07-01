import { cn } from "../../lib/cn"
import { Label } from "./Label"

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  )
}

export function Form({ children, className, onSubmit, ...props }) {
  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(e)
      }}
      {...props}
    >
      {children}
    </form>
  )
}
