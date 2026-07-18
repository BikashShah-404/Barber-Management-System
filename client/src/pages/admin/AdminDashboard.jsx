import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts'
import {
  LayoutDashboard,
  Users,
  Store,
  Check,
  X,
  Power,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { queryKeys, fetchAdminBusinesses, fetchAdminBookings, fetchAdminUsers } from '../../lib/queries'
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
  const [filter, setFilter] = useState('pending')
  const [filterOpen, setFilterOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [tab])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return data.stats
    },
  })

  const { data: businesses = [] } = useQuery({
    queryKey: [...queryKeys.adminBusinesses, filter],
    queryFn: async () => {
      const { data } = await api.get('/admin/businesses', {
        params: filter === 'all' ? {} : { status: filter },
      })
      return data.businesses
    },
    enabled: tab === 'businesses',
  })

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: fetchAdminUsers,
    enabled: tab === 'users',
  })

  const { data: bookings = [] } = useQuery({
    queryKey: queryKeys.adminBookings,
    queryFn: fetchAdminBookings,
    enabled: tab === 'bookings',
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }) => {
      const { data } = await api.put(`/admin/businesses/${id}/review`, {
        status,
        rejectionReason,
      })
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBusinesses })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['shops'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed')
    },
  })

  const toggleUserMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/admin/users/${id}/toggle`)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed')
    },
  })

  const review = (id, status) => {
    const rejectionReason =
      status === 'rejected' ? prompt('Rejection reason (optional):') || '' : ''
    reviewMutation.mutate({ id, status, rejectionReason })
  }

  const toggleUser = (id) => {
    toggleUserMutation.mutate(id)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-stone-500 uppercase tracking-widest font-semibold mb-1">Administration</p>
        <h1 className="font-display text-3xl">Admin panel</h1>
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
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Customers', value: stats.users },
                  { label: 'Barbers', value: stats.barbers },
                  { label: 'Total shops', value: stats.businesses },
                  { label: 'Pending approval', value: stats.pendingBusinesses },
                  { label: 'Approved shops', value: stats.approvedBusinesses },
                  { label: 'Bookings', value: stats.bookings },
                ].map((s) => (
                  <Card key={s.label}>
                    <p className="text-sm font-medium text-stone-500">{s.label}</p>
                    <p className="mt-2 font-display text-4xl text-ink">{s.value}</p>
                  </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="pt-6">
                <h3 className="mb-6 px-2 font-display text-xl text-ink">Platform Metrics</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Customers', value: stats.users },
                        { name: 'Barbers', value: stats.barbers },
                        { name: 'Shops', value: stats.businesses },
                        { name: 'Bookings', value: stats.bookings },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#78716c', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#78716c', fontSize: 12 }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f5f5f4' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#706f70" radius={[6, 6, 0, 0]} barSize={40}>
                        {
                          [
                            { name: 'Customers', value: stats.users },
                            { name: 'Barbers', value: stats.barbers },
                            { name: 'Shops', value: stats.businesses },
                            { name: 'Bookings', value: stats.bookings },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#706f70" />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="pt-6">
                <h3 className="mb-6 px-2 font-display text-xl text-ink">Shop Status Distribution</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: stats.approvedBusinesses, color: '#706f70' },
                          { name: 'Pending', value: stats.pendingBusinesses, color: '#acadb1' },
                          { name: 'Rejected', value: Math.max(0, stats.businesses - stats.approvedBusinesses - stats.pendingBusinesses), color: '#e7e5e4' }
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {
                          [
                            { name: 'Approved', value: stats.approvedBusinesses, color: '#706f70' },
                            { name: 'Pending', value: stats.pendingBusinesses, color: '#acadb1' },
                            { name: 'Rejected', value: Math.max(0, stats.businesses - stats.approvedBusinesses - stats.pendingBusinesses), color: '#e7e5e4' }
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-stone-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="pt-6 lg:col-span-2">
                <h3 className="mb-6 px-2 font-display text-xl text-ink">User Demographics</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Customers', value: stats.users, color: '#1c1917' },
                          { name: 'Barber Owners', value: stats.barbers, color: '#706f70' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {
                          [
                            { name: 'Customers', value: stats.users, color: '#1c1917' },
                            { name: 'Barber Owners', value: stats.barbers, color: '#706f70' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'businesses' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Shops List</h2>
              
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center justify-between w-36 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:border-stone-300 focus:border-bronze focus:outline-none focus:ring-1 focus:ring-bronze transition-all capitalize shadow-sm"
                >
                  {filter}
                  <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", filterOpen && "rotate-180")} />
                </button>

                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full z-20 mt-1.5 w-36 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
                    >
                      {['pending', 'approved', 'rejected', 'all'].map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setFilter(f)
                            setFilterOpen(false)
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-sm capitalize transition-colors hover:bg-stone-50",
                            filter === f ? "bg-cream text-ink font-medium" : "text-stone-600"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-stone-100 bg-cream/80 text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Shop Name</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((b) => (
                    <tr key={b._id} className="border-b border-stone-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{b.name}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {b.owner?.name} <br />
                        <span className="text-xs text-stone-400">{b.owner?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {b.city || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColor(b.status)}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {b.status === 'pending' && (
                            <>
                              <Button size="sm" variant="bronze" onClick={() => review(b._id, 'approved')} className="h-8 px-3">
                                <Check className="mr-1 h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => review(b._id, 'rejected')} className="h-8 px-3">
                                <X className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          {b.status === 'approved' && (
                            <Button size="sm" variant="outline" onClick={() => review(b._id, 'rejected')} className="h-8 px-3">
                              Revoke
                            </Button>
                          )}
                          {b.status === 'rejected' && (
                            <Button size="sm" variant="bronze" onClick={() => review(b._id, 'approved')} className="h-8 px-3">
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!businesses.length && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-stone-500">
                        No shops in this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                    {b.service?.name} · {formatPrice(b.service?.price)} · {b.slots?.[0]?.date}{' '}
                    {b.slots?.[0]?.startTime}
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
    </div>
  )
}
