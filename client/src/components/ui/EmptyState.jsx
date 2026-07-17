import { motion } from 'framer-motion'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center"
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-bronze">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
