import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Store,
  Check,
  X,
  Power,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, Badge } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { statusColor, cn, formatPrice } from '../../lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'businesses', label: 'Shops', icon: Store },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    const { data } = await api.get('/admin/dashboard')
    setStats(data.stats)
  }

  const loadBusinesses = async (status = filter) => {
    const { data } = await api.get('/admin/businesses', {
      params: status === 'all' ? {} : { status },
    })
    setBusinesses(data.businesses)
  }

  const loadUsers = async () => {
    const { data } = await api.get('/admin/users')
    setUsers(data.users)
  }

  const loadBookings = async () => {
    const { data } = await api.get('/admin/bookings')
    setBookings(data.bookings)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        await loadStats()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (tab === 'businesses') loadBusinesses(filter)
    if (tab === 'users') loadUsers()
    if (tab === 'bookings') loadBookings()
    if (tab === 'overview') loadStats()
  }, [tab, filter])

  const review = async (id, status) => {
    const rejectionReason =
      status === 'rejected' ? prompt('Rejection reason (optional):') || '' : ''
    try {
      const { data } = await api.put(`/admin/businesses/${id}/review`, {
        status,
        rejectionReason,
      })
      toast.success(data.message)
      loadBusinesses(filter)
      loadStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`)
      toast.success(data.message)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-stone-500">Administration</p>
        <h1 className="font-display text-4xl">Admin panel</h1>
      </motion.div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              tab === t.id ? 'bg-ink text-cream' : 'text-stone-600 hover:bg-cream'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'overview' && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Customers', value: stats.users, color: 'from-zinc-50 to-white' },
              { label: 'Barbers', value: stats.barbers, color: 'from-zinc-50 to-white' },
              { label: 'Total shops', value: stats.businesses, color: 'from-stone-50 to-white' },
              { label: 'Pending approval', value: stats.pendingBusinesses, color: 'from-zinc-50 to-white' },
              { label: 'Approved shops', value: stats.approvedBusinesses, color: 'from-emerald-50 to-white' },
              { label: 'Bookings', value: stats.bookings, color: 'from-sky-50 to-white' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`bg-gradient-to-br ${s.color}`}>
                  <p className="text-sm text-stone-500">{s.label}</p>
                  <p className="mt-2 font-display text-4xl text-ink">{s.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'businesses' && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {['pending', 'approved', 'rejected', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium capitalize',
                    filter === f ? 'bg-ink text-cream' : 'bg-white border border-stone-200 text-stone-600'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {businesses.map((b) => (
                <Card key={b._id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl">{b.name}</h3>
                      <Badge className={statusColor(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {b.address}
                      {b.city ? `, ${b.city}` : ''}
                    </p>
                    <p className="text-xs text-stone-400">
                      Owner: {b.owner?.name} · {b.owner?.email}
                    </p>
                    <p className="text-xs text-stone-400">
                      Services: {b.services?.map((s) => s.name).join(', ') || '—'}
                    </p>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="bronze" onClick={() => review(b._id, 'approved')}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => review(b._id, 'rejected')}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                  {b.status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => review(b._id, 'rejected')}>
                      Revoke
                    </Button>
                  )}
                  {b.status === 'rejected' && (
                    <Button size="sm" variant="bronze" onClick={() => review(b._id, 'approved')}>
                      Approve
                    </Button>
                  )}
                </Card>
              ))}
              {!businesses.length && (
                <p className="py-12 text-center text-stone-500">No shops in this filter.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-100 bg-cream/80 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-stone-600">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          u.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }
                      >
                        {u.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <Button size="sm" variant="ghost" onClick={() => toggleUser(u._id)}>
                          <Power className="h-4 w-4" />
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">
                    {b.user?.name} → {b.business?.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    {b.service?.name} · {formatPrice(b.service?.price)} · {b.slot?.date}{' '}
                    {b.slot?.startTime}
                  </p>
                </div>
                <Badge className={statusColor(b.status)}>{b.status}</Badge>
              </Card>
            ))}
            {!bookings.length && (
              <p className="py-12 text-center text-stone-500">No bookings yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
