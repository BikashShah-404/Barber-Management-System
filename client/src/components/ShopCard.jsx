import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Sparkles, User, Crown } from 'lucide-react'
import { formatPrice } from '../lib/utils'
import { Badge } from './ui/Card'

export default function ShopCard({ shop, index = 0 }) {
  const minPrice = shop.services?.length
    ? Math.min(...shop.services.map((s) => s.price))
    : null

  const cover =
    shop.coverImage ||
    shop.images?.[0] ||
    'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=800&q=80&auto=format&fit=crop'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 6) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/shops/${shop._id}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg hover:shadow-stone-900/5"
      >
        <div className="relative shrink-0 aspect-[16/10] overflow-hidden bg-stone-200">
          <img
            src={cover.startsWith('http') ? cover : cover}
            alt={shop.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=800&q=80&auto=format&fit=crop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3">
            {shop.owner?.avatar ? (
              <img
                src={shop.owner.avatar}
                alt={shop.owner?.name || 'Owner'}
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-stone-300 shadow-md">
                <User className="h-4 w-4 text-stone-500" />
              </div>
            )}
          </div>
          {shop.distanceKm !== undefined && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
              {shop.distanceKm} km
            </span>
          )}
          {shop.relevance > 0 && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-bronze/90 px-2.5 py-1 text-xs font-medium text-white">
              <Sparkles className="h-3 w-3" /> Match
            </span>
          )}
          {shop.promotion?.tier && shop.promotion.tier !== 'none' && (
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-sm">
              <Crown className="h-4 w-4 text-bronze" />
            </span>
          )}
        </div>
        <div className="flex grow flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl leading-tight text-ink group-hover:text-bronze transition-colors">
                {shop.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">
                  {shop.city ? `${shop.city} · ` : ''}
                  {shop.address}
                </span>
              </p>
            </div>
            {minPrice !== null && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-wide text-stone-400">from</p>
                <p className="text-sm font-semibold text-ink">{formatPrice(minPrice)}</p>
              </div>
            )}
          </div>
          {shop.services?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {shop.services.slice(0, 3).map((s) => (
                <Badge key={s._id || s.name} className="border-stone-200 bg-cream text-stone-600">
                  {s.name}
                </Badge>
              ))}
              {shop.services.length > 3 && (
                <Badge className="border-stone-200 bg-cream text-stone-500">
                  +{shop.services.length - 3}
                </Badge>
              )}
            </div>
          )}
          <div className="mt-auto pt-4 flex items-center gap-1 text-xs text-stone-400">
            <Clock className="h-3.5 w-3.5" />
            Book online · Instant request
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
