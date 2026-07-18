import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
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
    <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row bg-white">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 bg-stone-100 relative">
        <img
          src="/images/category2.jpg"
          alt="Barber"
          className="absolute inset-0 h-full w-full object-cover grayscale-[20%]"
        />
      </div>

      {/* Right side: Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-display text-4xl text-ink">Sign In</h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label="Your username or email address"
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

            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-ink focus:ring-ink" />
                Remember me
              </label>
              <a href="#" className="text-sm font-semibold text-ink hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base mt-2 bg-ink text-white hover:bg-stone-800 border-0 rounded-xl"
              loading={loading}
            >
              Sign In
            </Button>

            <div className="text-center mt-4">
              <p className="text-stone-500 text-sm">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-semibold text-bronze hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-xs text-stone-500">
            <p className="font-semibold text-stone-700 mb-1">Demo accounts</p>
            <p className="mt-1">user@demo.com / User@123</p>
            <p>barber@demo.com / Barber@123</p>
            <p>admin@barber.com / Admin@123</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
