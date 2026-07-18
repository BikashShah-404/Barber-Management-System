import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Phone, Check, User, Clock } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { queryKeys, fetchShop } from '../lib/queries'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Select, Textarea } from '../components/ui/Input'
import { PageLoader } from '../components/ui/Spinner'
import { formatPrice, cn } from '../lib/utils'

export default function ShopDetail() {
  const { id } = useParams()
  const { user, isAuth } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedService, setSelectedService] = useState('')
  const [selectedWindow, setSelectedWindow] = useState(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)

  const { data: shop, isLoading, error: shopError } = useQuery({
    queryKey: queryKeys.shop(id),
    queryFn: () => fetchShop(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (shopError) toast.error('Shop not found')
  }, [shopError])

  useEffect(() => {
    if (shop?.services?.[0]) {
      setSelectedService(shop.services[0].name)
    }
  }, [shop])

  const selectedSvc = shop?.services?.find((s) => s.name === selectedService)
  const serviceDuration = selectedSvc?.duration || 30

  const { data: windows = [] } = useQuery({
    queryKey: ['slots', 'windows', id, date, serviceDuration],
    queryFn: async () => {
      const { data } = await api.get('/slots/windows', {
        params: { businessId: id, date, duration: serviceDuration },
      })
      return data.windows
    },
    enabled: !!id && !!date,
  })

  useEffect(() => {
    setSelectedWindow(null)
  }, [date, serviceDuration])

  const bookMutation = useMutation({
    mutationFn: async () => {
      const svc = shop.services.find((s) => s.name === selectedService)
      const { data } = await api.post('/bookings', {
        businessId: id,
        slotIds: selectedWindow.slotIds,
        service: { name: svc.name, price: svc.price, duration: svc.duration },
        notes,
      })
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      navigate('/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed')
    },
    onSettled: () => setBooking(false),
  })

  const book = () => {
    if (!isAuth) {
      toast.message('Please log in to book')
      navigate('/login', { state: { from: `/shops/${id}` } })
      return
    }
    if (user.role !== 'user') {
      toast.error('Only customer accounts can book appointments')
      return
    }
    if (!selectedService || !selectedWindow) {
      toast.error('Select a service and time slot')
      return
    }
    setBooking(true)
    bookMutation.mutate()
  }

  if (isLoading) return <PageLoader />
  if (!shop) return null

  const cover =
    shop.coverImage ||
    shop.images?.[0] ||
    'https://images.unsplash.com/photo-1598887142487-3c854d19bb35?w=1200&q=80&auto=format&fit=crop'

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${shop.longitude - 0.02}%2C${shop.latitude - 0.015}%2C${shop.longitude + 0.02}%2C${shop.latitude + 0.015}&layer=mapnik&marker=${shop.latitude}%2C${shop.longitude}`

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full min-h-[350px] overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-200 shadow-sm"
      >
        <img
          src={cover}
          alt={shop.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1598887142487-3c854d19bb35?w=1200&q=80&auto=format&fit=crop'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-cream sm:p-8">
          <div className="flex items-end gap-4">
            {shop.owner?.avatar ? (
              <img
                src={shop.owner.avatar}
                alt={shop.owner?.name || 'Owner'}
                className="hidden h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-lg sm:block"
              />
            ) : (
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-stone-400 shadow-lg sm:flex">
                <User className="h-6 w-6 text-stone-200" />
              </div>
            )}
            <div>
              <h1 className="font-display text-4xl sm:text-5xl">{shop.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-stone-200">
                <MapPin className="h-4 w-4 shrink-0" />
                {shop.address}
                {shop.city ? `, ${shop.city}` : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5 items-start">
        <div className="space-y-6 lg:col-span-3 order-2 lg:order-1">
          <Card>
            <h2 className="font-display text-2xl">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {shop.description || 'No description provided.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
              {shop.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-bronze" /> {shop.phone}
                </span>
              )}
            </div>
            {shop.owner && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                {shop.owner.avatar ? (
                  <img
                    src={shop.owner.avatar}
                    alt={shop.owner.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-300">
                    <User className="h-4 w-4 text-stone-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-ink">{shop.owner.name}</p>
                  <p className="text-xs text-stone-500">Shop Owner</p>
                </div>
              </div>
            )}
            {shop.facilities?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {shop.facilities.map((f) => (
                  <Badge key={f} className="border-stone-200 bg-cream text-stone-700">
                    <Check className="mr-1 h-3 w-3" /> {f}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-2xl">Services</h2>
            <div className="mt-4 divide-y divide-stone-100">
              {shop.services?.map((s) => (
                <div key={s._id || s.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-stone-500">
                      {s.duration} min {s.description ? `· ${s.description}` : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-bronze">{formatPrice(s.price)}</p>
                </div>
              ))}
              {!shop.services?.length && (
                <p className="py-4 text-sm text-stone-500">No services listed yet.</p>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-stone-100 px-5 py-4">
              <h2 className="font-display text-2xl">Location</h2>
              <p className="text-sm text-stone-500">Map view of the shop</p>
            </div>
            <iframe
              title="map"
              src={mapSrc}
              className="h-64 w-full border-0"
              loading="lazy"
            />
            <div className="px-5 py-3 text-xs text-stone-500">
              <a
                href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-bronze hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="sticky top-24">
            <h2 className="font-display text-2xl">Book appointment</h2>
            <p className="mt-1 text-sm text-stone-500">Request a slot — owner will accept or reject.</p>

            <div className="mt-5 space-y-4">
              <Select
                label="Service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {shop.services?.map((s) => (
                  <option key={s._id || s.name} value={s.name}>
                    {s.name} — {formatPrice(s.price)} · {s.duration} min
                  </option>
                ))}
              </Select>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-stone-700">Date</span>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-2xl border border-stone-200 px-4 outline-none focus:border-bronze/50 focus:ring-4 focus:ring-bronze/10"
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-medium text-stone-700">
                  {serviceDuration}-min slots
                </p>
                {(() => {
                  if (windows.length === 0) {
                    return (
                      <div className="rounded-xl border border-stone-100 bg-cream/50 px-4 py-6 text-center text-sm text-stone-500">
                        No {serviceDuration}-min slots available for this date.
                        <br />
                        <span className="text-xs text-stone-400">Try another date or contact the shop.</span>
                      </div>
                    )
                  }

                  const displayWindows = []
                  let currentGroup = null

                  windows.forEach((w) => {
                    if (w.available) {
                      if (currentGroup) {
                        displayWindows.push(currentGroup)
                        currentGroup = null
                      }
                      displayWindows.push(w)
                    } else {
                      if (!currentGroup) {
                        currentGroup = { ...w, isGroup: true, groupStartTime: w.startTime, groupEndTime: w.endTime }
                      } else {
                        currentGroup.groupEndTime = w.endTime
                        currentGroup.slotIds = [...currentGroup.slotIds, ...w.slotIds]
                      }
                    }
                  })
                  if (currentGroup) displayWindows.push(currentGroup)

                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {displayWindows.map((w, idx) => (
                        <button
                          key={w.isGroup ? `group-${idx}` : w.slotIds.join('-')}
                          type="button"
                          onClick={() => w.available && setSelectedWindow(w)}
                          disabled={!w.available}
                          className={cn(
                            'flex items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] sm:text-xs font-medium transition',
                            !w.available && 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400',
                            w.available && selectedWindow === w && 'border-bronze bg-bronze text-white',
                            w.available && selectedWindow !== w && 'border-stone-200 bg-cream hover:border-bronze/40'
                          )}
                        >
                          <Clock className={cn('h-3 w-3 shrink-0', !w.available && 'text-stone-300')} />
                          <span className="whitespace-nowrap">
                            {w.isGroup ? `${w.groupStartTime} – ${w.groupEndTime}` : `${w.startTime} – ${w.endTime}`}
                          </span>
                          {!w.available && (
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold ml-0.5 whitespace-nowrap">
                              (Booked)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>

              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any preferences?"
              />

              <Button
                variant="bronze"
                className="w-full"
                loading={booking}
                onClick={book}
                disabled={!shop.services?.length}
              >
                Submit booking request
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
