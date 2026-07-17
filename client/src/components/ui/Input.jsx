import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input(
  { className, label, error, hint, ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-stone-700">{label}</span>}
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-ink outline-none transition focus:border-bronze/50 focus:ring-4 focus:ring-bronze/10 placeholder:text-stone-400',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      {hint && !error && <span className="text-xs text-stone-500">{hint}</span>}
    </label>
  )
})

export const Textarea = forwardRef(function Textarea(
  { className, label, error, ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-stone-700">{label}</span>}
      <textarea
        ref={ref}
        className={cn(
          'min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-ink outline-none transition focus:border-bronze/50 focus:ring-4 focus:ring-bronze/10 placeholder:text-stone-400',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
})

export const Select = forwardRef(function Select(
  { className, label, error, children, ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-stone-700">{label}</span>}
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-ink outline-none transition focus:border-bronze/50 focus:ring-4 focus:ring-bronze/10',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
})
