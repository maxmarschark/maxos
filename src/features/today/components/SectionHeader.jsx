export function SectionHeader({ title, count, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-zinc-100">
        {title}
        {count != null && (
          <span className="ml-1.5 font-normal text-zinc-500">({count})</span>
        )}
      </h2>
      {action}
    </div>
  )
}
