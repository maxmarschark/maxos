import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/cn"
import { Button } from "./Button"

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden",
          "rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50",
          sizes[size],
          className
        )}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-zinc-100">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            icon={X}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-800 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
