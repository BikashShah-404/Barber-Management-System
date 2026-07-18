import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Scissors, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const mainLinks = [
  { to: '/services', label: 'Services' },
  { to: '/shops', label: 'Shops' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }) =>
  cn(
    'relative py-1 text-sm font-medium transition-colors whitespace-nowrap',
    'after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:bg-ink after:transition-transform after:duration-300',
    isActive
      ? 'text-ink after:scale-x-100 after:origin-bottom-left'
      : 'text-stone-600 hover:text-ink after:scale-x-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left'
  )

export default function Navbar() {
  const { user, logout, isAuth } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const dashPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'barber'
        ? '/barber'
        : '/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
    setProfileOpen(false)
  }

  const mobileLinks = [
    ...mainLinks,
    ...(isAuth ? [{ to: dashPath, label: 'Dashboard' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <motion.span
            whileHover={{ rotate: -12 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-cream"
          >
            <Scissors className="h-4 w-4" />
          </motion.span>
          <span className="font-display text-2xl tracking-tight text-ink">
            Blade<span className="text-bronze">Book</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuth ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white pl-1.5 pr-3 py-1.5 text-sm hover:border-stone-300 transition-colors"
                onClick={() => setProfileOpen((v) => !v)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-stone-200" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 border border-stone-200">
                    <User className="h-4 w-4 text-stone-500" />
                  </div>
                )}
                <span className="max-w-28 truncate font-medium text-stone-700">{user.name}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-stone-400 transition', profileOpen && 'rotate-180')} />
              </button>
              
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-48 z-50 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl"
                  >
                    <div className="flex flex-col gap-1">
                      <Link 
                        to={dashPath} 
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-600 transition hover:bg-cream hover:text-ink"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <div className="my-1 border-t border-stone-100"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger transition hover:bg-danger/5"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button variant="bronze" size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-200 bg-cream lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {mobileLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-2 py-2.5 text-sm font-medium text-stone-700 hover:bg-white"
                >
                  {l.label === 'Dashboard' ? (
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </span>
                  ) : (
                    l.label
                  )}
                </Link>
              ))}
              {isAuth ? (
                <Button variant="outline" className="mt-2" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      navigate('/login')
                      setOpen(false)
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    className="flex-1"
                    variant="bronze"
                    onClick={() => {
                      navigate('/register')
                      setOpen(false)
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
