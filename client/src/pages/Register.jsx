import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
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
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let payload = form
      
      if (avatar) {
        payload = new FormData()
        Object.keys(form).forEach(key => payload.append(key, form[key]))
        payload.append('avatar', avatar)
      }
      
      const data = await register(payload)
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
    <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row bg-white">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 bg-stone-100 relative">
        <img 
          src="/images/banner.jpg" 
          alt="Barbershop" 
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
            <h1 className="font-display text-4xl text-ink">Sign up</h1>
            <p className="mt-2 text-stone-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col mb-4">
              <label className="text-sm font-medium text-stone-700 mb-2">Profile Picture</label>
              <div 
                className="relative h-20 w-20 rounded-full border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-stone-400">
                    <Upload className="h-5 w-5 mb-1" />
                    <span className="text-[9px] font-medium uppercase">Upload</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <Input
              label="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
            <Input
              label="Email address"
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Select
              label="Account type"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Customer</option>
              <option value="barber">Barbershop owner</option>
            </Select>

            <div className="flex items-start gap-2 text-sm text-stone-600 my-4">
              <input type="checkbox" required className="mt-1 rounded border-stone-300 text-ink focus:ring-ink" />
              <span>
                I agree with <a href="#" className="font-semibold text-ink hover:underline">Privacy Policy</a> and <a href="#" className="font-semibold text-ink hover:underline">Terms of Use</a>
              </span>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2 bg-ink text-white hover:bg-stone-800 border-0 rounded-xl" loading={loading}>
              Sign Up
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
