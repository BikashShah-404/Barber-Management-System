import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Scissors } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(data.message || 'Logged in successfully')
      const from = location.state?.from
      if (from) {
        navigate(from)
      } else if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'barber') {
        navigate('/barber')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1300px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block"
      >
        <div className="overflow-hidden rounded-[2rem] border border-stone-200">
          <img
            src="https://images.unsplash.com/photo-1593060790757-01004a55877c?w=900&q=80&auto=format&fit=crop"
            alt="Barber"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-cream">
            <Scissors className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-display text-3xl">Welcome back</h1>
            <p className="text-sm text-stone-500">Sign in to continue booking</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          <Button type="submit" variant="bronze" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-bronze hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-xs text-stone-500">
          <p className="font-medium text-stone-700">Demo accounts</p>
          <p className="mt-1">user@demo.com / User@123</p>
          <p>barber@demo.com / Barber@123</p>
          <p>admin@barber.com / Admin@123</p>
        </div>
      </motion.div>
    </div>
  )
}
