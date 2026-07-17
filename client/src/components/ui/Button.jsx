import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-ink text-cream hover:bg-ink-soft shadow-sm shadow-stone-900/10',
  bronze:
    'bg-bronze text-white hover:bg-bronze-light shadow-sm shadow-zinc-900/20',
  outline:
    'border border-stone-300 bg-transparent text-ink hover:bg-stone-100',
  ghost: 'bg-transparent text-ink hover:bg-stone-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  soft: 'bg-sand text-ink hover:bg-stone-200',
}

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-2xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
}

export const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading,
    children,
    disabled,
    asChild,
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </motion.button>
  )
})
