import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(n) {
  return `Rs. ${Number(n || 0).toLocaleString('en-NP')}`
}

export function statusColor(status) {
  const map = {
    pending: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-stone-100 text-stone-600 border-stone-200',
    completed: 'bg-sky-100 text-sky-800 border-sky-200',
  }
  return map[status] || map.pending
}
