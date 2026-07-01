export function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-6xl p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}
