import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, XCircle, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, Badge } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatPrice, statusColor } from '../../lib/utils'

export default function UserDashboard() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [saving, setSaving] = useState(false)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/bookings/mine')
      setBookings(data.bookings)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      const { data } = await api.put(`/bookings/${id}/cancel`)
      toast.success(data.message)
      loadBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', profile)
      updateUser(data.user)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'bookings', label: 'My bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-stone-500">Customer dashboard</p>
        <h1 className="font-display text-4xl">Hello, {user?.name?.split(' ')[0]}</h1>
      </motion.div>

      <div className="mt-8 flex gap-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'bg-ink text-cream' : 'text-stone-600 hover:bg-cream'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'bookings' && (
          <>
            <div className="mb-4 flex justify-end">
              <Link to="/shops">
                <Button variant="bronze" size="sm">
                  <Scissors className="h-4 w-4" /> Book new
                </Button>
              </Link>
            </div>
            {loading ? (
              <PageLoader />
            ) : bookings.length ? (
              <div className="space-y-4">
                {bookings.map((b, i) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl">{b.business?.name}</h3>
                          <Badge className={statusColor(b.status)}>{b.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-stone-600">
                          {b.service?.name} · {formatPrice(b.service?.price)} · {b.service?.duration} min
                        </p>
                        <p className="text-sm text-stone-500">
                          {b.slot?.date} · {b.slot?.startTime} – {b.slot?.endTime}
                        </p>
                        {b.notes && <p className="mt-1 text-xs text-stone-400">Note: {b.notes}</p>}
                      </div>
                      {['pending', 'accepted'].includes(b.status) && (
                        <Button variant="outline" size="sm" onClick={() => cancel(b._id)}>
                          <XCircle className="h-4 w-4" /> Cancel
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings yet"
                description="Browse shops and request your first appointment."
                action={
                  <Link to="/shops">
                    <Button variant="bronze">Find shops</Button>
                  </Link>
                }
              />
            )}
          </>
        )}

        {tab === 'profile' && (
          <Card>
            <h2 className="font-display text-2xl">My profile</h2>
            <form onSubmit={saveProfile} className="mt-5 max-w-md space-y-4">
              <Input
                label="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
              <Input
                label="Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
              <Button type="submit" variant="bronze" loading={saving}>
                Save profile
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
