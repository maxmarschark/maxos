import { cn } from "../../lib/cn"

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-950/40",
  secondary:
    "bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50",
  ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
  outline:
    "border border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
}

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-10 px-5 text-sm gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  loading = false,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2} />
      )}
      {children}
    </button>
  )
}
