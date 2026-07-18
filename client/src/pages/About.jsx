import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowRight,
  Heart,
  Target,
  Users,
  Sparkles,
  Shield,
  Zap,
  Scissors,
  Star,
} from 'lucide-react'
import PageHero from '../components/PageHero'
import { Button } from '../components/ui/Button'
import { aboutStats, aboutValues } from '../data/siteContent'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── mission features ─── */
const missionFeatures = [
  {
    icon: Shield,
    title: 'Verified Marketplace',
    text: 'Every shop is admin-reviewed before going live — customers book with confidence.',
  },
  {
    icon: Zap,
    title: 'Instant Scheduling',
    text: 'Real-time slot availability means zero phone tag and zero double-bookings.',
  },
  {
    icon: Sparkles,
    title: 'Craft-First UX',
    text: 'Designed around how barbers actually work — not how enterprise software thinks they should.',
  },
]

/* ─── 3D tilt handler for value cards ─── */
function useTilt() {
  const ref = useRef(null)

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    gsap.to(el, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800,
    })
  }, [])

  const handleLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    })
  }, [])

  return { ref, handleMove, handleLeave }
}

/* ─── Value card with tilt ─── */
function ValueCard({ icon: Icon, title, text, index }) {
  const { ref, handleMove, handleLeave } = useTilt()

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="value-card group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-sm will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* shimmer highlight */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-bronze/8 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

      <div className="relative z-10">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sand to-sand/60 text-bronze shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </div>
  )
}

/* ─── Main About page ─── */
export default function About() {
  const root = useRef(null)

  useGSAP(
    () => {
      /* ── Stats counter row ── */
      const statEls = gsap.utils.toArray('.stat-card')
      statEls.forEach((el) => {
        const numEl = el.querySelector('.stat-number')
        const raw = numEl?.dataset.value
        if (!raw) return
        const isNumeric = /^\d+$/.test(raw)

        // Fade + slide in for all cards
        gsap.from(el, {
          scrollTrigger: { trigger: '.stats-section', start: 'top 85%' },
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
        })

        // Count up for numeric values
        if (isNumeric) {
          const counter = { val: 0 }
          gsap.to(counter, {
            val: parseInt(raw, 10),
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.stats-section', start: 'top 85%' },
            onUpdate() {
              numEl.textContent = Math.round(counter.val)
            },
          })
        }
      })

      /* ── Our Story — parallax image ── */
      gsap.to('.story-image', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.story-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Story text stagger
      gsap.from('.story-text > *', {
        scrollTrigger: { trigger: '.story-text', start: 'top 80%' },
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Story floating card
      gsap.from('.story-float-card', {
        scrollTrigger: { trigger: '.story-section', start: 'top 70%' },
        scale: 0.8,
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'back.out(1.6)',
        delay: 0.3,
      })

      /* ── Mission section ── */
      gsap.from('.mission-heading > *', {
        scrollTrigger: { trigger: '.mission-section', start: 'top 75%' },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.from('.mission-feature', {
        scrollTrigger: { trigger: '.mission-features', start: 'top 82%' },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      })

      /* ── Values ── */
      gsap.from('.value-card', {
        scrollTrigger: { trigger: '.values-section', start: 'top 78%' },
        scale: 0.85,
        opacity: 0,
        y: 50,
        stagger: 0.14,
        duration: 0.9,
        ease: 'back.out(1.7)',
      })

      /* ── CTA banner ── */
      gsap.from('.cta-banner', {
        scrollTrigger: { trigger: '.cta-banner', start: 'top 88%' },
        scale: 0.92,
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'back.out(1.4)',
      })
    },
    { scope: root }
  )

  const valueIcons = [Heart, Target, Users]

  return (
    <div ref={root}>
      {/* ═══════════ 1. HERO ═══════════ */}
      <PageHero
        eyebrow="About BladeBook"
        title="Modern booking for an age-old craft."
        subtitle="We built a MERN platform so customers, barbershop owners, and admins can replace phone calls and paper registers with a clear digital workflow."
        crumbs={['About']}
      />

      {/* ═══════════ 2. STATS SECTION ═══════════ */}
      <section className="stats-section relative mx-auto max-w-[1300px] px-4 py-12 sm:px-6 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {aboutStats.map((s) => (
            <div
              key={s.label}
              className="stat-card group relative overflow-hidden rounded-[2rem] border border-stone-200/60 bg-white/80 p-8 shadow-xl shadow-stone-200/50 backdrop-blur-xl text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bronze/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span
                className="stat-number relative z-10 block font-display text-5xl font-semibold text-ink"
                data-value={s.value}
              >
                {/^\d+$/.test(s.value) ? '0' : s.value}
              </span>
              <span className="relative z-10 mt-2 block text-sm font-medium tracking-wide text-stone-500 uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ 3. OUR STORY ═══════════ */}
      <section className="story-section relative overflow-hidden border-y border-stone-200/60 bg-gradient-to-br from-white/60 via-cream to-sand/30 py-24">
        <div className="grain pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative z-10 mx-auto grid max-w-[1300px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          {/* image column */}
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-stone-200/60 shadow-2xl shadow-stone-900/10">
              <img
                src="/images/banner.jpg"
                alt="Barbershop interior"
                className="story-image aspect-[4/3] w-full scale-110 object-cover"
              />
            </div>

            {/* floating card overlay */}
            <div className="story-float-card absolute -bottom-6 -right-4 rounded-2xl border border-stone-200/80 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md sm:-right-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bronze/10 text-bronze">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Since 2026</p>
                  <p className="text-xs text-muted">Crafted with care</p>
                </div>
              </div>
            </div>
          </div>

          {/* text column */}
          <div className="story-text">
            <p className="text-sm font-medium uppercase tracking-widest text-bronze">
              Our story
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Built for real barbershops
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600">
              Traditional booking relies on walk-ins, calls, and notebooks — which leads to double
              bookings, long waits, and limited visibility for small shops. BladeBook digitizes that
              flow without forcing shops to change how they deliver great cuts.
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Customers discover approved shops, owners manage services and slots, and admins keep
              the marketplace trustworthy. All on a strict MERN stack with JWT security and local
              MongoDB for academic and production-ready demos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services">
                <Button variant="bronze" size="lg">
                  Explore services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 4. OUR MISSION ═══════════ */}
      <section className="mission-section relative overflow-hidden bg-ink py-28">
        {/* background glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze/8 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-60 w-60 rounded-full bg-zinc-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-48 w-48 rounded-full bg-bronze/6 blur-3xl" />
        <div className="grain pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mission-heading">
            <p className="text-sm font-medium uppercase tracking-widest text-bronze-light">
              Our Mission
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-5xl">
              Make every chair count, every cut matter.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-400">
              We believe local barbershops deserve modern tools — without enterprise complexity or
              hefty subscriptions. BladeBook bridges the gap.
            </p>
          </div>

          <div className="mission-features mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
            {missionFeatures.map((f) => (
              <div
                key={f.title}
                className="mission-feature group rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-bronze/30 hover:bg-white/8"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/15 text-bronze-light transition-colors duration-300 group-hover:bg-bronze/25">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg text-cream">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 5. VALUES ═══════════ */}
      <section className="values-section relative overflow-hidden bg-gradient-to-b from-cream to-sand/20 py-24">
        <div className="grain pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-bronze/6 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-[1300px] px-4 sm:px-6">
          <div className="mb-14 max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-bronze">Values</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              What we stand for
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Three principles that shape every feature, every pixel, and every line of code we
              ship.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {aboutValues.map((v, i) => (
              <ValueCard
                key={v.title}
                icon={valueIcons[i]}
                title={v.title}
                text={v.text}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 7. CTA BANNER ═══════════ */}
      <section className="mx-auto max-w-[1300px] px-4 py-20 sm:px-6">
        <div className="cta-banner relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center shadow-2xl shadow-stone-900/20 sm:px-12 sm:py-20">
          {/* glow accents */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-bronze/15 blur-[80px]" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-zinc-500/10 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bronze/15 text-bronze-light">
              <Scissors className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
              Ready to upgrade your booking?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-stone-400">
              Join BladeBook today — whether you're a customer looking for the perfect cut or a shop
              owner ready to fill every chair.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button variant="bronze" size="lg">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shops">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-cream hover:bg-white/10"
                >
                  Browse shops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
