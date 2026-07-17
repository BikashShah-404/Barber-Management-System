import { cn } from '../../lib/utils'

export function Spinner({ className }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-bronze border-r-transparent" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-bronze border-r-transparent" />
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    </div>
  )
}
