import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ChevronRight } from 'lucide-react'

gsap.registerPlugin(useGSAP)

export default function PageHero({ eyebrow, title, subtitle, crumbs = [] }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.ph-crumb', { y: -15, opacity: 0, duration: 0.4 })
        .from('.ph-eyebrow', { x: -20, opacity: 0, duration: 0.45 }, '-=0.2')
        .from('.ph-title', { x: 30, opacity: 0, duration: 0.65 }, '-=0.25')
        .from('.ph-sub', { y: 20, opacity: 0, duration: 0.5 }, '-=0.35')
    },
    { scope: ref }
  )

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-sand/40 to-cream"
    >
      <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-bronze/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-zinc-200/30 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1300px] px-4 py-14 sm:px-6 sm:py-16">
        {crumbs.length > 0 && (
          <nav className="ph-crumb mb-4 flex flex-wrap items-center gap-1 text-xs text-stone-500">
            <Link to="/" className="hover:text-bronze">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <span className="text-stone-700">{c}</span>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="ph-eyebrow text-sm font-medium uppercase tracking-widest text-bronze">
            {eyebrow}
          </p>
        )}
        <h1 className="ph-title mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="ph-sub mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
