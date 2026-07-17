import { Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Explore',
    links: [
      { to: '/shops', label: 'Find shops' },
      { to: '/nearest', label: 'Near me' },
      { to: '/services', label: 'Services' },
      { to: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/blog', label: 'Blog' },
      { to: '/contact', label: 'Contact' },
      { to: '/register', label: 'Join' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-ink text-cream">
      <div className="mx-auto grid max-w-[1300px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bronze text-white">
              <Scissors className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-xl">BladeBook</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
            Book barbershop appointments online. Manage slots, services, and requests — all in one
            place on a modern MERN platform.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-400 transition hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-500">
        Barber Appointment Booking Management System · MERN Stack
      </div>
    </footer>
  )
}
