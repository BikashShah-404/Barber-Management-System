import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Calendar, Clock, Plus, Trash2, Check, X,
  CreditCard, Briefcase, ImagePlus, RotateCcw, Sparkles, MapPin, Navigation,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, Badge } from '../../components/ui/Card'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import LocationPicker from '../../components/ui/LocationPicker'
import { formatPrice, statusColor, cn } from '../../lib/utils'
import { queryKeys, fetchBusiness, fetchBookings, fetchSlots, fetchSlotStats } from '../../lib/queries'

const TABS = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'slots', label: 'Slots', icon: Clock },
  { id: 'bookings', label: 'Requests', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function BarberDashboard() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [tab, setTab] = useState('business')
  const [saving, setSaving] = useState(false)
  const [slotDate, setSlotDate] = useState(new Date().toISOString().slice(0, 10))
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [showBusinessMap, setShowBusinessMap] = useState(false)

  const { data: business, isLoading: bizLoading } = useQuery({
    queryKey: queryKeys.business,
    queryFn: fetchBusiness,
    retry: false,
  })

  const { data: slots = [] } = useQuery({
    queryKey: queryKeys.slots(slotDate),
    queryFn: () => fetchSlots(slotDate),
    enabled: tab === 'slots' && !!business,
  })

  const { data: slotStats } = useQuery({
    queryKey: queryKeys.slotStats,
    queryFn: fetchSlotStats,
    enabled: tab === 'slots' && !!business,
  })

  const { data: bookings = [] } = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: fetchBookings,
    enabled: tab === 'bookings' && !!business,
  })

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [tab])

  const [bizForm, setBizForm] = useState({ name: '', description: '', address: '', city: '', phone: '', latitude: '27.7172', longitude: '85.324', facilities: '' })
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration: '30' })
  const [bulkSlot, setBulkSlot] = useState({ date: new Date().toISOString().slice(0, 10), startTime: '10:00', endTime: '17:00', intervalMinutes: 15 })
  const [recurringSlot, setRecurringSlot] = useState({ startDate: new Date().toISOString().slice(0, 10), endDate: '', days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], startTime: '10:00', endTime: '17:00', intervalMinutes: 15 })
  const [billing, setBilling] = useState({ accountName: '', accountNumber: '', bankName: '', notes: '' })
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteRange, setDeleteRange] = useState({ start: '', end: '' })

  useEffect(() => {
    if (business) {
      const b = business
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
    }
  }, [business])

  const invalidateSlots = () => {
    queryClient.invalidateQueries({ queryKey: ['slots'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.slotStats })
  }

  const { mutateAsync: saveBusinessMut } = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('name', bizForm.name)
      formData.append('description', bizForm.description)
      formData.append('address', bizForm.address)
      formData.append('city', bizForm.city)
      formData.append('phone', bizForm.phone)
      formData.append('latitude', bizForm.latitude)
      formData.append('longitude', bizForm.longitude)
      formData.append('facilities', JSON.stringify(bizForm.facilities.split(',').map(s => s.trim()).filter(Boolean)))
      imageFiles.forEach(f => formData.append('images', f))
      if (business) {
        const { data } = await api.put('/businesses/mine', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        return data
      } else {
        const { data } = await api.post('/businesses', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        return data
      }
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.setQueryData(queryKeys.business, data.business)
      queryClient.invalidateQueries({ queryKey: ['shops'] })
      setImageFiles([]); setImagePreviews([])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  })

  const saveBusiness = (e) => { e.preventDefault(); saveBusinessMut() }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBizForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }))
          toast.success('Location updated!')
        },
        () => {
          toast.error('Unable to retrieve your location')
        }
      )
    } else {
      toast.error('Geolocation not supported by this browser')
    }
  }

  const { mutateAsync: addServiceMut } = useMutation({
    mutationFn: () => api.post('/businesses/services', { ...serviceForm, price: Number(serviceForm.price), duration: Number(serviceForm.duration) }),
    onSuccess: ({ data }) => {
      toast.success(data.message)
      queryClient.setQueryData(queryKeys.business, (old) => old ? { ...old, services: data.services } : old)
      queryClient.invalidateQueries({ queryKey: ['shops'] })
      setServiceForm({ name: '', description: '', price: '', duration: '30' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const addService = (e) => { e.preventDefault(); addServiceMut() }

  const { mutateAsync: removeServiceMut } = useMutation({
    mutationFn: (id) => api.delete(`/businesses/services/${id}`),
    onSuccess: ({ data }) => {
      toast.success(data.message)
      queryClient.setQueryData(queryKeys.business, (old) => old ? { ...old, services: data.services } : old)
      queryClient.invalidateQueries({ queryKey: ['shops'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: createSlotsMut } = useMutation({
    mutationFn: () => api.post('/slots/bulk', bulkSlot),
    onSuccess: ({ data }) => {
      toast.success(data.totalDeleted ? `Replaced ${data.totalDeleted} old slots · Created ${data.count} new slots` : `Created ${data.count} slots`)
      setSlotDate(bulkSlot.date)
      invalidateSlots()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
  const createSlotsFn = (e) => { e.preventDefault(); createSlotsMut() }

  const { mutateAsync: createRecurringMut } = useMutation({
    mutationFn: () => api.post('/slots/recurring', recurringSlot),
    onSuccess: ({ data }) => {
      toast.success(`${data.totalDeleted ? `Replaced ${data.totalDeleted} old slots · ` : ''}Created ${data.totalCreated} new slots across ${data.dates?.length || 0} days`)
      invalidateSlots()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
  const createRecurringFn = (e) => {
    e.preventDefault()
    if (!recurringSlot.endDate) return toast.error('End date is required for recurring slots')
    createRecurringMut()
  }

  const { mutateAsync: cleanupMut } = useMutation({
    mutationFn: () => api.delete('/slots/cleanup'),
    onSuccess: ({ data }) => { toast.success(`${data.message} — ${data.deleted} removed`); invalidateSlots() },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: deleteSlotMut } = useMutation({
    mutationFn: (id) => api.delete(`/slots/${id}`),
    onSuccess: () => { toast.success('Slot removed'); invalidateSlots() },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: deleteTodayMut } = useMutation({
    mutationFn: () => api.delete(`/slots/date/${slotDate}`),
    onSuccess: ({ data }) => { toast.success(data.message); invalidateSlots() },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: deleteRangeMut } = useMutation({
    mutationFn: () => api.delete('/slots/range', { data: { startDate: deleteRange.start, endDate: deleteRange.end } }),
    onSuccess: ({ data }) => { toast.success(data.message); invalidateSlots(); setShowDeleteDialog(false) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: deleteAllMut } = useMutation({
    mutationFn: () => api.delete('/slots/all'),
    onSuccess: ({ data }) => { toast.success(data.message); invalidateSlots() },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: respondMut } = useMutation({
    mutationFn: ({ id, status }) => api.put(`/bookings/${id}/respond`, { status }),
    onSuccess: ({ data }) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      invalidateSlots()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutateAsync: saveBillingMut } = useMutation({
    mutationFn: () => api.put('/businesses/billing', billing),
    onSuccess: ({ data }) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: queryKeys.business })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const saveProfileFn = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', profile.name)
      formData.append('phone', profile.phone)
      if (avatarFile) formData.append('avatar', avatarFile)
      const { data } = await api.put('/auth/profile', formData)
      updateUser(data.user)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (imageFiles.length + files.length > 5) { toast.error('Maximum 5 images allowed'); return }
    setImageFiles(p => [...p, ...files])
    setImagePreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (i) => {
    setImageFiles(p => p.filter((_, idx) => idx !== i))
    setImagePreviews(p => p.filter((_, idx) => idx !== i))
  }

  const toggleRecurringDay = (day) => setRecurringSlot(p => ({ ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day] }))

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (bizLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-stone-500 uppercase tracking-widest font-semibold mb-1">Barber owner</p>
        <h1 className="font-display text-3xl mb-3">{user?.name}</h1>
        {business && <Badge className={cn('text-sm', statusColor(business.status))}>Shop: {business.status}</Badge>}
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-24">
          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition w-full text-left', tab === t.id ? 'bg-ink text-cream shadow-md' : 'text-stone-600 hover:bg-stone-100 hover:text-ink')}>
                <t.icon className="h-5 w-5" /> {t.label}
              </button>
            ))}
          </div>
        </div>

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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">{business ? 'Update business' : 'Create business profile'}</h2>
              </div>
              
              <form onSubmit={saveBusiness} className="space-y-6">
                {/* Basic Details */}
                <Card>
                  <div className="border-b border-stone-200 pb-3 mb-4">
                    <h3 className="text-lg font-medium text-ink">Basic Details</h3>
                    <p className="text-sm text-stone-500">Essential information about your shop.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Business name" required value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} />
                    <Input label="Facilities (comma separated)" value={bizForm.facilities} onChange={e => setBizForm({ ...bizForm, facilities: e.target.value })} placeholder="WiFi, AC, Parking" />
                    <div className="sm:col-span-2">
                      <Textarea label="Description" value={bizForm.description} onChange={e => setBizForm({ ...bizForm, description: e.target.value })} />
                    </div>
                  </div>
                </Card>

                {/* Contact & Location */}
                <Card>
                  <div className="border-b border-stone-200 pb-3 mb-4">
                    <h3 className="text-lg font-medium text-ink">Contact & Location</h3>
                    <p className="text-sm text-stone-500">Where customers can find you.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Phone" value={bizForm.phone} onChange={e => setBizForm({ ...bizForm, phone: e.target.value })} />
                    <Input label="City" value={bizForm.city} onChange={e => setBizForm({ ...bizForm, city: e.target.value })} />
                    <div className="sm:col-span-2"><Input label="Address" required value={bizForm.address} onChange={e => setBizForm({ ...bizForm, address: e.target.value })} /></div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-stone-700">Map Location</label>
                      <div className="mt-1.5 flex flex-col sm:flex-row flex-wrap sm:items-end gap-3">
                        <div className="flex w-full sm:w-auto items-center gap-2">
                          <label className="flex flex-col gap-1 w-full sm:w-36">
                            <span className="text-xs font-medium text-stone-500">Latitude</span>
                            <input type="number" step="any" placeholder="Latitude" value={bizForm.latitude} onChange={e => setBizForm({ ...bizForm, latitude: e.target.value })} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-bronze" />
                          </label>
                          <label className="flex flex-col gap-1 w-full sm:w-36">
                            <span className="text-xs font-medium text-stone-500">Longitude</span>
                            <input type="number" step="any" placeholder="Longitude" value={bizForm.longitude} onChange={e => setBizForm({ ...bizForm, longitude: e.target.value })} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-bronze" />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={handleGetCurrentLocation} className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-ink">
                            <Navigation className="h-3.5 w-3.5" />
                            Pick my location
                          </button>
                          <button type="button" onClick={() => setShowBusinessMap(v => !v)} className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition hover:border-bronze/40 hover:text-bronze">
                            <MapPin className="h-3.5 w-3.5" />
                            {showBusinessMap ? 'Close map' : 'Pick on map'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showBusinessMap && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="mt-4 h-64 overflow-hidden rounded-xl border border-stone-200">
                          <LocationPicker latitude={bizForm.latitude} longitude={bizForm.longitude} onChange={(lat, lng) => setBizForm({ ...bizForm, latitude: lat, longitude: lng })} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Shop Images */}
                <Card>
                  <div className="border-b border-stone-200 pb-3 mb-4">
                    <h3 className="text-lg font-medium text-ink">Shop Images</h3>
                    <p className="text-sm text-stone-500">Up to 5 images. First image becomes the cover.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {business?.images?.map((img, i) => (
                      <div key={`existing-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <span className="absolute top-1 left-1 rounded bg-stone-800/70 px-1.5 py-0.5 text-[10px] text-white">{i === 0 ? 'Cover' : `#${i + 1}`}</span>
                      </div>
                    ))}
                    {imagePreviews.map((src, i) => (
                      <div key={`new-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-bronze/30">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    {imageFiles.length + (business?.images?.length || 0) < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-bronze/50 hover:text-bronze">
                        <ImagePlus className="h-6 w-6" /><span className="mt-1 text-[10px]">Add image</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </div>
                </Card>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="bronze" loading={saving}>{business ? 'Save changes' : 'Submit for approval'}</Button>
                </div>
              </form>

              <Card>
                <div className="border-b border-stone-200 pb-3 mb-4">
                  <h3 className="text-lg font-medium text-ink">Owner Profile</h3>
                  <p className="text-sm text-stone-500">Your personal contact and display information.</p>
                </div>
                <form onSubmit={saveProfileFn} className="grid max-w-md gap-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-stone-200 bg-stone-50">
                      {avatarPreview ? <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone-400"><ImagePlus className="h-6 w-6" /></div>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Profile Picture</label>
                      <input type="file" accept="image/*" className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:rounded-full file:border-0 file:bg-bronze/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-bronze hover:file:bg-bronze/20 cursor-pointer" onChange={e => { if (e.target.files[0]) { setAvatarFile(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])) } }} />
                    </div>
                  </div>
                  <Input label="Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                  <Input label="Phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  <div className="pt-2">
                    <Button type="submit" variant="outline" loading={saving}>Update profile</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {tab === 'services' && !business ? (
            <EmptyState icon={Briefcase} title="Create business first" description="Add your shop profile before managing services." />
          ) : tab === 'services' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="font-display text-2xl">Add service</h2>
                <form onSubmit={addService} className="mt-4 space-y-3">
                  <Input label="Name" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
                  <Input label="Description" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Price (Rs)" type="number" required value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
                    <Input label="Duration (min)" type="number" required value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} />
                  </div>
                  <Button type="submit" variant="bronze"><Plus className="h-4 w-4" /> Add service</Button>
                </form>
              </Card>
              <Card>
                <h2 className="font-display text-2xl">Your services</h2>
                <div className="mt-4 space-y-3">
                  {business?.services?.map(s => (
                    <div key={s._id} className="flex items-center justify-between rounded-2xl border border-stone-100 bg-cream/50 px-4 py-3">
                      <div><p className="font-medium">{s.name}</p><p className="text-xs text-stone-500">{formatPrice(s.price)} · {s.duration} min</p></div>
                      <Button variant="ghost" size="icon" onClick={() => removeServiceMut(s._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  ))}
                  {!business?.services?.length && <p className="text-sm text-stone-500">No services yet.</p>}
                </div>
              </Card>
            </div>
          )}

          {tab === 'slots' && !business ? (
            <EmptyState icon={Clock} title="Create business first" />
          ) : tab === 'slots' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="font-display text-2xl">Generate slots</h2>
                <p className="mt-1 text-xs text-stone-500">Tip: use 15-min intervals for maximum booking flexibility.</p>
                <form onSubmit={createSlotsFn} className="mt-4 space-y-3">
                  <Input label="Date" type="date" value={bulkSlot.date} onChange={e => setBulkSlot({ ...bulkSlot, date: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Start" type="time" value={bulkSlot.startTime} onChange={e => setBulkSlot({ ...bulkSlot, startTime: e.target.value })} />
                    <Input label="End" type="time" value={bulkSlot.endTime} onChange={e => setBulkSlot({ ...bulkSlot, endTime: e.target.value })} />
                  </div>
                  <Select label="Interval" value={bulkSlot.intervalMinutes} onChange={e => setBulkSlot({ ...bulkSlot, intervalMinutes: Number(e.target.value) })}>
                    <option value={15}>15 min (recommended)</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </Select>
                  <Button type="submit" variant="bronze"><Sparkles className="h-4 w-4" /> Generate slots</Button>
                </form>
              </Card>

              <Card>
                <h2 className="font-display text-2xl">Recurring schedule</h2>
                <p className="mt-1 text-xs text-stone-500">Generate slots across multiple days automatically.</p>
                <form onSubmit={createRecurringFn} className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="From" type="date" value={recurringSlot.startDate} onChange={e => setRecurringSlot({ ...recurringSlot, startDate: e.target.value })} />
                    <Input label="To" type="date" required value={recurringSlot.endDate} onChange={e => setRecurringSlot({ ...recurringSlot, endDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Days</label>
                    <div className="mt-1.5 flex gap-1.5">
                      {DAY_KEYS.map((day, i) => (
                        <button key={day} type="button" onClick={() => toggleRecurringDay(day)} className={cn('h-9 w-9 rounded-lg text-xs font-medium transition', recurringSlot.days.includes(day) ? 'bg-ink text-cream' : 'bg-cream text-stone-600 hover:bg-stone-200')}>
                          {DAY_LABELS[i]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Start" type="time" value={recurringSlot.startTime} onChange={e => setRecurringSlot({ ...recurringSlot, startTime: e.target.value })} />
                    <Input label="End" type="time" value={recurringSlot.endTime} onChange={e => setRecurringSlot({ ...recurringSlot, endTime: e.target.value })} />
                  </div>
                  <Select label="Interval" value={recurringSlot.intervalMinutes} onChange={e => setRecurringSlot({ ...recurringSlot, intervalMinutes: Number(e.target.value) })}>
                    <option value={15}>15 min (recommended)</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </Select>
                  <Button type="submit" variant="bronze"><RotateCcw className="h-4 w-4" /> Generate recurring</Button>
                </form>
              </Card>

              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl">Slots</h2>
                  <div className="flex items-center gap-3">
                    <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} className="h-10 rounded-xl border border-stone-200 px-3 text-sm" />
                    <Button variant="outline" size="sm" onClick={() => { if (confirm(`Remove all unbooked slots for ${slotDate}?`)) deleteTodayMut() }}><Trash2 className="h-3.5 w-3.5" /> Delete today</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}><Trash2 className="h-3.5 w-3.5" /> Delete range</Button>
                    <Button variant="outline" size="sm" onClick={() => { if (confirm('Delete ALL unbooked slots? This cannot be undone.')) deleteAllMut() }}><Trash2 className="h-3.5 w-3.5" /> Delete all</Button>
                    <Button variant="outline" size="sm" onClick={() => { if (confirm('Remove all unbooked past slots?')) cleanupMut() }}><Trash2 className="h-3.5 w-3.5" /> Clean past</Button>
                  </div>
                </div>

                {slotStats && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-cream px-1.5 py-2.5 shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">Total</p>
                      <p className="text-lg font-bold text-ink">{slotStats.total}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-cream px-1.5 py-2.5 shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-700">Available</p>
                      <p className="text-lg font-bold text-stone-700">{slotStats.totalUnbooked}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-cream px-1.5 py-2.5 shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-bronze">Booked</p>
                      <p className="text-lg font-bold text-bronze">{slotStats.totalBooked}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-cream px-1.5 py-2.5 shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">Today</p>
                      <p className="text-lg font-bold text-ink">{slotStats.todaySlots}</p>
                      <p className="text-[9px] text-stone-400">{slotStats.todayBooked} booked</p>
                    </div>
                    {slotStats.dateRange && (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-cream px-1.5 py-2.5 shadow-sm">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">Range</p>
                        <p className="text-xs font-semibold text-ink leading-tight text-center">{slotStats.dateRange.from}<br />{slotStats.dateRange.to}</p>
                      </div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {showDeleteDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)}>
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="relative mx-4 w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
                        <button type="button" onClick={() => setShowDeleteDialog(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition">
                          <X className="h-4 w-4" />
                        </button>
                        <h3 className="font-display text-xl pr-8">Delete slots by range</h3>
                        <p className="mt-1 text-sm text-stone-500">Removes all unbooked slots in the date range.</p>
                        <div className="mt-5 space-y-3">
                          <Input label="From" type="date" value={deleteRange.start} onChange={e => setDeleteRange({ ...deleteRange, start: e.target.value })} />
                          <Input label="To" type="date" value={deleteRange.end} onChange={e => setDeleteRange({ ...deleteRange, end: e.target.value })} />
                          <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                            <Button variant="danger" onClick={() => { if (!deleteRange.start || !deleteRange.end) return toast.error('Select start and end date'); if (confirm(`Remove all unbooked slots from ${deleteRange.start} to ${deleteRange.end}?`)) deleteRangeMut() }}><Trash2 className="h-4 w-4" /> Delete range</Button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                  {slots.map(s => (
                    <div key={s._id} className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm">
                      <span>{s.startTime} – {s.endTime} {s.isBooked && <Badge className="ml-2 border-bronze/30 bg-bronze/10 text-bronze">booked</Badge>}</span>
                      {!s.isBooked && <button type="button" onClick={() => { if (confirm('Remove this slot?')) deleteSlotMut(s._id) }} className="text-red-600 hover:underline">Remove</button>}
                    </div>
                  ))}
                  {!slots.length && <p className="py-4 text-center text-sm text-stone-500">No slots for this date.</p>}
                </div>
              </Card>
            </div>
          )}

          {tab === 'bookings' && !business ? (
            <EmptyState icon={Calendar} title="Create business first" />
          ) : tab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length ? bookings.map((b, i) => (
                <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{b.user?.name}</h3>
                        <Badge className={statusColor(b.status)}>{b.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">{b.service?.name} · {formatPrice(b.service?.price)}</p>
                      <p className="text-sm text-stone-500">{b.slots?.[0]?.date} · {b.slots?.[0]?.startTime} – {b.slots?.[b.slots.length - 1]?.endTime}</p>
                      <p className="text-xs text-stone-400">{b.user?.email} {b.user?.phone ? `· ${b.user.phone}` : ''}</p>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="bronze" onClick={() => respondMut({ id: b._id, status: 'accepted' })}><Check className="h-4 w-4" /> Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => respondMut({ id: b._id, status: 'rejected' })}><X className="h-4 w-4" /> Reject</Button>
                      </div>
                    )}
                    {b.status === 'accepted' && b.slots?.[0]?.date <= new Date().toISOString().slice(0, 10) && <Button size="sm" variant="soft" onClick={() => respondMut({ id: b._id, status: 'completed' })}>Mark completed</Button>}
                  </Card>
                </motion.div>
              )) : <EmptyState icon={Calendar} title="No booking requests yet" />}
            </div>
          )}

          {tab === 'billing' && (
            <Card className="max-w-lg">
              <h2 className="font-display text-2xl">Billing details</h2>
              <p className="mt-1 text-sm text-stone-500">Offline / reference details only.</p>
              {!business ? <p className="mt-4 text-sm text-stone-500">Create business first.</p> : (
                <form onSubmit={(e) => { e.preventDefault(); saveBillingMut() }} className="mt-5 space-y-3">
                  <Input label="Account name" value={billing.accountName} onChange={e => setBilling({ ...billing, accountName: e.target.value })} />
                  <Input label="Account number" value={billing.accountNumber} onChange={e => setBilling({ ...billing, accountNumber: e.target.value })} />
                  <Input label="Bank name" value={billing.bankName} onChange={e => setBilling({ ...billing, bankName: e.target.value })} />
                  <Textarea label="Notes" value={billing.notes} onChange={e => setBilling({ ...billing, notes: e.target.value })} />
                  <Button type="submit" variant="bronze">Save billing</Button>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
