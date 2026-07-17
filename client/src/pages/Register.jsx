import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await register(form)
      toast.success(data.message || 'Account created')
      if (data.user.role === 'barber') navigate('/barber')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-ink">Create account</h1>
        <p className="mt-2 text-stone-500">Join as a customer or barbershop owner</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="98XXXXXXXX"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            hint="At least 6 characters"
          />
          <Select
            label="I am a"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">Customer</option>
            <option value="barber">Barbershop owner</option>
          </Select>
          <Button type="submit" variant="bronze" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-bronze hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
