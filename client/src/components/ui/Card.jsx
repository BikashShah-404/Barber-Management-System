import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Card({ className, children, hover = false, ...props }) {
  const Comp = hover ? motion.div : 'div'
  const motionProps = hover
    ? {
        whileHover: { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } },
      }
    : {}

  return (
    <Comp
      className={cn(
        'rounded-3xl border border-stone-200/80 bg-white/80 p-5 shadow-sm shadow-stone-900/5 backdrop-blur-sm',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function Badge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        className
      )}
    >
      {children}
    </span>
  )
}
