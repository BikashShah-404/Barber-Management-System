import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Check, User, Info } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, Badge } from '../components/ui/Card'
import { Select, Textarea } from '../components/ui/Input'
import { PageLoader } from '../components/ui/Spinner'
import { formatPrice, cn } from '../lib/utils'

export default function ShopDetail() {
  const { id } = useParams()
  const { user, isAuth } = useAuth()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [slots, setSlots] = useState([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedService, setSelectedService] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/businesses/${id}`)
        setShop(data.business)
        if (data.business.services?.[0]) {
          setSelectedService(data.business.services[0].name)
        }
      } catch {
        toast.error('Shop not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!id || !date) return
    api
      .get(`/slots/business/${id}`, { params: { date } })
      .then((res) => setSlots(res.data.slots))
      .catch(() => setSlots([]))
    setSelectedSlot('')
  }, [id, date])

  const usingDefaults = slots.length === 0 && selectedSlot?.startsWith('default-')

  const book = async () => {
    if (!isAuth) {
      toast.message('Please log in to book')
      navigate('/login', { state: { from: `/shops/${id}` } })
      return
    }
    if (user.role !== 'user') {
      toast.error('Only customer accounts can book appointments')
      return
    }
    if (!selectedService || !selectedSlot) {
      toast.error('Select a service and time slot')
      return
    }
    if (usingDefaults) {
      toast.message(`Contact ${shop.phone || 'the shop'} to confirm ${selectedSlot.replace('default-', '').replace('-', ':')} availability`)
      return
    }
    const svc = shop.services.find((s) => s.name === selectedService)
    setBooking(true)
    try {
      const { data } = await api.post('/bookings', {
        businessId: id,
        slotId: selectedSlot,
        service: {
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
        },
        notes,
      })
      toast.success(data.message)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <PageLoader />
  if (!shop) return null

  const cover =
    shop.coverImage ||
    shop.images?.[0] ||
    'https://images.unsplash.com/photo-1598887142487-3c854d19bb35?w=1200&q=80&auto=format&fit=crop'

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${shop.longitude - 0.02}%2C${shop.latitude - 0.015}%2C${shop.longitude + 0.02}%2C${shop.latitude + 0.015}&layer=mapnik&marker=${shop.latitude}%2C${shop.longitude}`

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6">
      {/* Top Section: Hero + About (Combined Card) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col lg:flex-row overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm"
      >
        {/* Left: Hero */}
        <div className="relative w-full lg:w-3/5 min-h-[300px] bg-stone-200">
          <img
            src={cover}
            alt={shop.name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1598887142487-3c854d19bb35?w=1200&q=80&auto=format&fit=crop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
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
        </div>

        {/* Right: About */}
        <div className="w-full lg:w-2/5 border-t border-stone-200 lg:border-t-0 lg:border-l p-6 sm:p-8 flex flex-col justify-center">
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
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">

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

        <div className="lg:col-span-2">
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
                    {s.name} — {formatPrice(s.price)}
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
                <p className="mb-2 text-sm font-medium text-stone-700">Available slots</p>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlot(slot._id)}
                        className={cn(
                          'rounded-xl border px-2 py-2 text-xs font-medium transition',
                          selectedSlot === slot._id
                            ? 'border-bronze bg-bronze text-white'
                            : 'border-stone-200 bg-cream hover:border-bronze/40'
                        )}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-start gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Default times shown — confirm availability with the shop owner.</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5].map((t) => {
                        const h = Math.floor(t)
                        const m = (t % 1) * 60
                        const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
                        const fakeId = `default-${start}`
                        return (
                          <button
                            key={fakeId}
                            type="button"
                            onClick={() => setSelectedSlot(fakeId)}
                            className={cn(
                              'rounded-xl border px-2 py-2 text-xs font-medium transition',
                              selectedSlot === fakeId
                                ? 'border-bronze bg-bronze text-white'
                                : 'border-stone-200 bg-cream hover:border-bronze/40'
                            )}
                          >
                            {start}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
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
                {usingDefaults ? 'Contact to confirm booking' : 'Submit booking request'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
