import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  CreditCard,
  Briefcase,
  ImagePlus,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, Badge } from '../../components/ui/Card'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatPrice, statusColor, cn } from '../../lib/utils'

const TABS = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'slots', label: 'Slots', icon: Clock },
  { id: 'bookings', label: 'Requests', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function BarberDashboard() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const [tab, setTab] = useState('business')
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [slotDate, setSlotDate] = useState(new Date().toISOString().slice(0, 10))
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [tab])

  const [bizForm, setBizForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    latitude: '27.7172',
    longitude: '85.324',
    facilities: '',
  })
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
  })
  const [bulkSlot, setBulkSlot] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '17:00',
    intervalMinutes: 15,
  })
  const [recurringSlot, setRecurringSlot] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '10:00',
    endTime: '17:00',
    intervalMinutes: 15,
  })
  const [billing, setBilling] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    notes: '',
  })
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  const loadBusiness = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/businesses/mine')
      setBusiness(data.business)
      const b = data.business
      setBizForm({
        name: b.name || '',
        description: b.description || '',
        address: b.address || '',
        city: b.city || '',
        phone: b.phone || '',
        latitude: String(b.latitude ?? 27.7172),
        longitude: String(b.longitude ?? 85.324),
        facilities: (b.facilities || []).join(', '),
      })
      setBilling({
        accountName: b.billingDetails?.accountName || '',
        accountNumber: b.billingDetails?.accountNumber || '',
        bankName: b.billingDetails?.bankName || '',
        notes: b.billingDetails?.notes || '',
      })
    } catch {
      setBusiness(null)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/bookings/owner')
      setBookings(data.bookings)
    } catch {
      setBookings([])
    }
  }

  const loadSlots = async (date = slotDate) => {
    try {
      const { data } = await api.get('/slots/mine', { params: { date } })
      setSlots(data.slots)
    } catch {
      setSlots([])
    }
  }

  useEffect(() => {
    loadBusiness()
  }, [])

  useEffect(() => {
    if (tab === 'bookings') loadBookings()
    if (tab === 'slots' && business) loadSlots()
  }, [tab, business])

  useEffect(() => {
    if (tab === 'slots' && business) loadSlots(slotDate)
  }, [slotDate])

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (imageFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    setImageFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const saveBusiness = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', bizForm.name)
      formData.append('description', bizForm.description)
      formData.append('address', bizForm.address)
      formData.append('city', bizForm.city)
      formData.append('phone', bizForm.phone)
      formData.append('latitude', bizForm.latitude)
      formData.append('longitude', bizForm.longitude)
      formData.append(
        'facilities',
        JSON.stringify(
          bizForm.facilities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        )
      )
      imageFiles.forEach((f) => formData.append('images', f))

      let data
      if (business) {
        ;({ data } = await api.put('/businesses/mine', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }))
      } else {
        ;({ data } = await api.post('/businesses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }))
      }
      toast.success(data.message)
      setBusiness(data.business)
      setImageFiles([])
      setImagePreviews([])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const addService = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/businesses/services', {
        ...serviceForm,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
      })
      toast.success(data.message)
      setBusiness((b) => ({ ...b, services: data.services }))
      setServiceForm({ name: '', description: '', price: '', duration: '30' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const removeService = async (serviceId) => {
    try {
      const { data } = await api.delete(`/businesses/services/${serviceId}`)
      toast.success(data.message)
      setBusiness((b) => ({ ...b, services: data.services }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const createSlots = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/slots/bulk', bulkSlot)
      toast.success(`${data.message} (${data.count} slots created${data.skipped ? `, ${data.skipped} skipped (overlapping)` : ''})`)
      setSlotDate(bulkSlot.date)
      loadSlots(bulkSlot.date)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const createRecurring = async (e) => {
    e.preventDefault()
    if (!recurringSlot.endDate) {
      toast.error('End date is required for recurring slots')
      return
    }
    try {
      const { data } = await api.post('/slots/recurring', recurringSlot)
      toast.success(`${data.message} — ${data.totalCreated} slots across ${data.dates?.length || 0} days`)
      loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const cleanupSlots = async () => {
    if (!confirm('Remove all unbooked past slots?')) return
    try {
      const { data } = await api.delete('/slots/cleanup')
      toast.success(`${data.message} — ${data.deleted} removed`)
      loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const deleteSlot = async (id) => {
    try {
      await api.delete(`/slots/${id}`)
      toast.success('Slot removed')
      loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const respond = async (id, status) => {
    try {
      const { data } = await api.put(`/bookings/${id}/respond`, { status })
      toast.success(data.message)
      loadBookings()
      if (tab === 'slots') loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const saveBilling = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/businesses/billing', billing)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/auth/profile', profile)
      updateUser(data.user)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const toggleRecurringDay = (day) => {
    setRecurringSlot((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }))
  }

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-stone-500 uppercase tracking-widest font-semibold mb-1">Barber owner</p>
        <h1 className="font-display text-3xl mb-3">{user?.name}</h1>
        {business && (
          <Badge className={cn('text-sm', statusColor(business.status))}>
            Shop: {business.status}
          </Badge>
        )}
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-24">
          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition w-full text-left',
                tab === t.id ? 'bg-ink text-cream shadow-md' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
              )}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0">
        {business?.status === 'rejected' && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Rejected: {business.rejectionReason || 'Please update and resubmit.'}
          </div>
        )}
        {business?.status === 'pending' && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900">
            Your shop is awaiting admin approval. Customers will see it once approved.
          </div>
        )}
        {tab === 'business' && (
          <Card>
            <h2 className="font-display text-2xl">
              {business ? 'Update business' : 'Create business profile'}
            </h2>
            <form onSubmit={saveBusiness} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Business name"
                  required
                  value={bizForm.name}
                  onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                />
                <Input
                  label="City"
                  value={bizForm.city}
                  onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    required
                    value={bizForm.address}
                    onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Description"
                    value={bizForm.description}
                    onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })}
                  />
                </div>
                <Input
                  label="Phone"
                  value={bizForm.phone}
                  onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                />
                <Input
                  label="Facilities (comma separated)"
                  value={bizForm.facilities}
                  onChange={(e) => setBizForm({ ...bizForm, facilities: e.target.value })}
                  placeholder="WiFi, AC, Parking"
                />
                <Input
                  label="Latitude"
                  value={bizForm.latitude}
                  onChange={(e) => setBizForm({ ...bizForm, latitude: e.target.value })}
                />
                <Input
                  label="Longitude"
                  value={bizForm.longitude}
                  onChange={(e) => setBizForm({ ...bizForm, longitude: e.target.value })}
                />
              </div>

              {/* Image Upload Section */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-stone-700">Shop Images</label>
                <p className="mt-1 text-xs text-stone-500">Up to 5 images. First image becomes the cover.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {business?.images?.map((img, i) => (
                    <div key={`existing-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <span className="absolute top-1 left-1 rounded bg-stone-800/70 px-1.5 py-0.5 text-[10px] text-white">
                        {i === 0 ? 'Cover' : `#${i + 1}`}
                      </span>
                    </div>
                  ))}
                  {imagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-bronze/30">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.length + (business?.images?.length || 0) < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-bronze/50 hover:text-bronze"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="mt-1 text-[10px]">Add image</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" variant="bronze" loading={saving}>
                  {business ? 'Save changes' : 'Submit for approval'}
                </Button>
              </div>
            </form>

            <hr className="my-8 border-stone-100" />
            <h3 className="font-display text-xl">Owner profile</h3>
            <form onSubmit={saveProfile} className="mt-4 grid max-w-md gap-4">
              <Input
                label="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
              <Button type="submit" variant="outline">
                Update profile
              </Button>
            </form>
          </Card>
        )}

        {tab === 'services' && (
          !business ? (
            <EmptyState
              icon={Briefcase}
              title="Create business first"
              description="Add your shop profile before managing services."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                  <h2 className="font-display text-2xl">Add service</h2>
                  <form onSubmit={addService} className="mt-4 space-y-3">
                    <Input
                      label="Name"
                      required
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    />
                    <Input
                      label="Description"
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, description: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Price (Rs)"
                        type="number"
                        required
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      />
                      <Input
                        label="Duration (min)"
                        type="number"
                        required
                        value={serviceForm.duration}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, duration: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" variant="bronze">
                      <Plus className="h-4 w-4" /> Add service
                    </Button>
                  </form>
                </Card>
                <Card>
                  <h2 className="font-display text-2xl">Your services</h2>
                  <div className="mt-4 space-y-3">
                    {business.services?.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between rounded-2xl border border-stone-100 bg-cream/50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-stone-500">
                            {formatPrice(s.price)} · {s.duration} min
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeService(s._id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    {!business.services?.length && (
                      <p className="text-sm text-stone-500">No services yet.</p>
                    )}
                  </div>
                </Card>
            </div>
          )
        )}

        {tab === 'slots' && (
          !business ? (
            <EmptyState icon={Clock} title="Create business first" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bulk Generate */}
                <Card>
                  <h2 className="font-display text-2xl">Generate slots</h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Tip: use 15-min intervals for maximum booking flexibility.
                  </p>
                  <form onSubmit={createSlots} className="mt-4 space-y-3">
                    <Input
                      label="Date"
                      type="date"
                      value={bulkSlot.date}
                      onChange={(e) => setBulkSlot({ ...bulkSlot, date: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start"
                        type="time"
                        value={bulkSlot.startTime}
                        onChange={(e) => setBulkSlot({ ...bulkSlot, startTime: e.target.value })}
                      />
                      <Input
                        label="End"
                        type="time"
                        value={bulkSlot.endTime}
                        onChange={(e) => setBulkSlot({ ...bulkSlot, endTime: e.target.value })}
                      />
                    </div>
                    <Select
                      label="Interval"
                      value={bulkSlot.intervalMinutes}
                      onChange={(e) =>
                        setBulkSlot({ ...bulkSlot, intervalMinutes: Number(e.target.value) })
                      }
                    >
                      <option value={15}>15 min (recommended)</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </Select>
                    <Button type="submit" variant="bronze">
                      <Sparkles className="h-4 w-4" /> Generate slots
                    </Button>
                  </form>
                </Card>

                {/* Recurring Generate */}
                <Card>
                  <h2 className="font-display text-2xl">Recurring schedule</h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Generate slots across multiple days automatically.
                  </p>
                  <form onSubmit={createRecurring} className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="From"
                        type="date"
                        value={recurringSlot.startDate}
                        onChange={(e) =>
                          setRecurringSlot({ ...recurringSlot, startDate: e.target.value })
                        }
                      />
                      <Input
                        label="To"
                        type="date"
                        required
                        value={recurringSlot.endDate}
                        onChange={(e) =>
                          setRecurringSlot({ ...recurringSlot, endDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Days</label>
                      <div className="mt-1.5 flex gap-1.5">
                        {DAY_KEYS.map((day, i) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleRecurringDay(day)}
                            className={cn(
                              'h-9 w-9 rounded-lg text-xs font-medium transition',
                              recurringSlot.days.includes(day)
                                ? 'bg-ink text-cream'
                                : 'bg-cream text-stone-600 hover:bg-stone-200'
                            )}
                          >
                            {DAY_LABELS[i]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start"
                        type="time"
                        value={recurringSlot.startTime}
                        onChange={(e) =>
                          setRecurringSlot({ ...recurringSlot, startTime: e.target.value })
                        }
                      />
                      <Input
                        label="End"
                        type="time"
                        value={recurringSlot.endTime}
                        onChange={(e) =>
                          setRecurringSlot({ ...recurringSlot, endTime: e.target.value })
                        }
                      />
                    </div>
                    <Select
                      label="Interval"
                      value={recurringSlot.intervalMinutes}
                      onChange={(e) =>
                        setRecurringSlot({ ...recurringSlot, intervalMinutes: Number(e.target.value) })
                      }
                    >
                      <option value={15}>15 min (recommended)</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </Select>
                    <Button type="submit" variant="bronze">
                      <RotateCcw className="h-4 w-4" /> Generate recurring
                    </Button>
                  </form>
                </Card>

                {/* Slot List */}
                <Card className="lg:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl">Slots</h2>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="h-10 rounded-xl border border-stone-200 px-3 text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={cleanupSlots}>
                        <Trash2 className="h-3.5 w-3.5" /> Clean past
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                    {slots.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm"
                      >
                        <span>
                          {s.startTime} – {s.endTime}{' '}
                          {s.isBooked && (
                            <Badge className="ml-2 border-zinc-200 bg-zinc-50 text-zinc-800">
                              booked
                            </Badge>
                          )}
                        </span>
                        {!s.isBooked && (
                          <button
                            type="button"
                            onClick={() => deleteSlot(s._id)}
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {!slots.length && (
                      <p className="py-4 text-center text-sm text-stone-500">
                        No slots for this date.
                      </p>
                    )}
                  </div>
                </Card>
            </div>
          )
        )}

        {tab === 'bookings' && (
          <div className="space-y-4">
            {!business ? (
              <EmptyState icon={Calendar} title="Create business first" />
            ) : bookings.length ? (
              bookings.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{b.user?.name}</h3>
                        <Badge className={statusColor(b.status)}>{b.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {b.service?.name} · {formatPrice(b.service?.price)}
                      </p>
                      <p className="text-sm text-stone-500">
                        {b.slots?.[0]?.date} · {b.slots?.[0]?.startTime} –{' '}
                        {b.slots?.[b.slots.length - 1]?.endTime}
                      </p>
                      <p className="text-xs text-stone-400">
                        {b.user?.email} {b.user?.phone ? `· ${b.user.phone}` : ''}
                      </p>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="bronze" onClick={() => respond(b._id, 'accepted')}>
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => respond(b._id, 'rejected')}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                    {b.status === 'accepted' && (
                      <Button size="sm" variant="soft" onClick={() => respond(b._id, 'completed')}>
                        Mark completed
                      </Button>
                    )}
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState icon={Calendar} title="No booking requests yet" />
            )}
          </div>
        )}

        {tab === 'billing' && (
          <Card className="max-w-lg">
            <h2 className="font-display text-2xl">Billing details</h2>
            <p className="mt-1 text-sm text-stone-500">
              Offline / reference details only — no online payments in this version.
            </p>
            {!business ? (
              <p className="mt-4 text-sm text-stone-500">Create business first.</p>
            ) : (
              <form onSubmit={saveBilling} className="mt-5 space-y-3">
                <Input
                  label="Account name"
                  value={billing.accountName}
                  onChange={(e) => setBilling({ ...billing, accountName: e.target.value })}
                />
                <Input
                  label="Account number"
                  value={billing.accountNumber}
                  onChange={(e) => setBilling({ ...billing, accountNumber: e.target.value })}
                />
                <Input
                  label="Bank name"
                  value={billing.bankName}
                  onChange={(e) => setBilling({ ...billing, bankName: e.target.value })}
                />
                <Textarea
                  label="Notes"
                  value={billing.notes}
                  onChange={(e) => setBilling({ ...billing, notes: e.target.value })}
                />
                <Button type="submit" variant="bronze">
                  Save billing
                </Button>
              </form>
            )}
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}
