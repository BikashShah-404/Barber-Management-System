import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Crown,
  Flame,
  Scissors,
  Smile,
  Sparkles,
  Wand2,
  ArrowRight,
  Search,
  CalendarCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import PageHero from '../components/PageHero'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import api from '../lib/api'
import { formatPrice, cn } from '../lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── icon & category maps ─── */
const icons = { Scissors, Sparkles, Crown, Flame, Smile, Wand2 }

function getCategoryAndIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('beard') || n.includes('shave')) return { cat: 'Grooming', icon: 'Flame' }
  if (n.includes('combo') || n.includes('kids')) return { cat: 'Cuts', icon: 'Scissors' }
  if (n.includes('cut') || n.includes('hair') || n.includes('fade')) return { cat: 'Cuts', icon: 'Scissors' }
  if (n.includes('style') || n.includes('color') || n.includes('dye') || n.includes('wash') || n.includes('eyebrow')) return { cat: 'Styling', icon: 'Sparkles' }
  return { cat: 'Styling', icon: 'Smile' }
}

const categories = ['All', 'Cuts', 'Grooming', 'Styling']

const cutImages = [
  '/images/services/premium_cut.jpg',
  '/images/services/classic_cut.jpg',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80&auto=format&fit=crop'
]

const beardImages = [
  '/images/services/beard_trim.jpg',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520338661084-68034fd53002?w=800&q=80&auto=format&fit=crop'
]

const miscImages = [
  'https://images.unsplash.com/photo-1593702295094-aea22597af65?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80&auto=format&fit=crop'
]

const getImageForService = (service, index) => {
  const n = service.title.toLowerCase()
  if (n.includes('cut') || n.includes('hair') || n.includes('premium') || n.includes('combo') || n.includes('fade')) {
    return cutImages[index % cutImages.length]
  }
  if (n.includes('beard') || n.includes('trim') || n.includes('shave')) {
    return beardImages[index % beardImages.length]
  }
  
  return miscImages[index % miscImages.length]
}

const bentoPattern = [
  { span: "md:col-span-2 md:row-span-2 row-span-2", type: "large" },
  { span: "md:col-span-2 md:row-span-1 row-span-1", type: "wide" },
  { span: "md:col-span-1 md:row-span-1 row-span-1", type: "small" },
  { span: "md:col-span-1 md:row-span-1 row-span-1", type: "small" },
  { span: "md:col-span-1 md:row-span-2 row-span-2", type: "tall" },
  { span: "md:col-span-1 md:row-span-1 row-span-1", type: "small" },
  { span: "md:col-span-2 md:row-span-1 row-span-1", type: "wide" },
  { span: "md:col-span-2 md:row-span-1 row-span-1", type: "wide" },
  { span: "md:col-span-1 md:row-span-1 row-span-1", type: "small" },
]

/* ─── process steps ─── */
const steps = [
  {
    icon: Search,
    title: 'Search & discover',
    desc: 'Browse approved barbershops near you by service, city, or map location.',
  },
  {
    icon: CalendarCheck,
    title: 'Pick a slot',
    desc: 'Choose from real-time availability — no double bookings, no phone calls.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirm booking',
    desc: 'Lock in your appointment instantly and get reminders before your visit.',
  },
]

export default function Services() {
  const root = useRef(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get('/businesses', { params: { limit: 100 } })
        const shops = res.data.businesses || []
        
        const svcMap = new Map()
        shops.forEach(shop => {
          if (Array.isArray(shop.services)) {
            shop.services.forEach(s => {
              const name = s.name.trim()
              if (!svcMap.has(name)) {
                const { cat, icon } = getCategoryAndIcon(name)
                svcMap.set(name, {
                  id: name,
                  title: name,
                  desc: s.description || 'Professional grooming service.',
                  priceFrom: s.price,
                  duration: `${s.duration} min`,
                  category: cat,
                  icon: icon
                })
              } else {
                const existing = svcMap.get(name)
                if (s.price < existing.priceFrom) {
                  existing.priceFrom = s.price
                }
              }
            })
          }
        })
        setServices(Array.from(svcMap.values()))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filtered =
    activeFilter === 'All'
      ? services
      : services.filter((s) => s.category === activeFilter)

  /* ── GSAP master timeline ── */
  const { contextSafe } = useGSAP(
    () => {
      /* filter pills (fade from left) */
      gsap.fromTo('.filter-pill', 
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'back.out(1.4)',
        }
      )

      /* process section - restored to original */
      const processTl = gsap.timeline({
        scrollTrigger: { trigger: '.process-section', start: 'top 75%' },
        defaults: { ease: 'power3.out' },
      })
      processTl
        .from('.process-heading', { y: 30, opacity: 0, duration: 0.6 })
        .from('.process-sub', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from(
          '.process-line',
          { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'power2.inOut' },
          '-=0.2'
        )
        .from(
          '.process-step',
          { y: 50, opacity: 0, scale: 0.9, stagger: 0.15, duration: 0.6 },
          '-=0.5'
        )

      /* CTA banner - restored to original */
      gsap.from('.cta-banner', {
        scrollTrigger: { trigger: '.cta-banner', start: 'top 85%' },
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })
    },
    { scope: root }
  )

  useGSAP(
    () => {
      /* card reveal */
      gsap.fromTo('.svc-anim-wrapper',
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: 'back.out(1.4)',
        }
      )
    },
    { scope: root, dependencies: [activeFilter, loading, services], revertOnUpdate: true }
  )

  const handleFilter = contextSafe((cat) => {
    if (cat === activeFilter) return
    const cards = document.querySelectorAll('.svc-anim-wrapper')
    if (cards.length) {
      gsap.to(cards, {
        y: -20,
        opacity: 0,
        scale: 0.96,
        duration: 0.25,
        ease: 'power2.in',
        stagger: 0.03,
        onComplete: () => {
          setActiveFilter(cat)
        },
      })
    } else {
      setActiveFilter(cat)
    }
  })

  return (
    <div ref={root}>
      {/* ────── Hero ────── */}
      <PageHero
        eyebrow="Services"
        title="Grooming that fits your calendar."
        subtitle="Browse the kinds of services shops list on BladeBook — then book real availability at approved barbershops near you."
        crumbs={['Services']}
      />

      {/* ────── Filter Tabs + Cards ────── */}
      <section className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 lg:py-20">
        {/* filter bar */}
        <div className="filter-bar mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={cn(
                'filter-pill cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300',
                activeFilter === cat
                  ? 'bg-bronze text-white shadow-md shadow-bronze/25'
                  : 'bg-sand/70 text-muted hover:bg-sand hover:text-ink'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* cards grid */}
        {loading ? (
          <div className="py-20"><PageLoader /></div>
        ) : (
        <div className="svc-grid grid gap-4 md:gap-5 lg:gap-6 grid-cols-1 md:grid-cols-4 auto-rows-[220px] grid-flow-dense">
          {filtered.map((s, i) => {
            const Icon = icons[s.icon] || Scissors
            const bgImg = getImageForService(s, i)
            
            const bento = bentoPattern[i % bentoPattern.length]
            let t = bento.type
            let bentoSpan = bento.span
            
            if (i === filtered.length - 1) {
              bentoSpan = 'md:col-span-3 md:row-span-1 row-span-1'
              t = 'wide'
            }
            
            const isLarge = t === 'large'
            const isWide = t === 'wide'
            const isTall = t === 'tall'
            const isSmall = t === 'small'
            
            return (
              <div key={s.id} className={cn("svc-anim-wrapper w-full h-full", bentoSpan)}>
                <Link to={`/shops?service=${encodeURIComponent(s.title)}`} className="block w-full h-full cursor-pointer">
                  <article
                    className="svc-card group relative flex flex-col overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-900 w-full h-full shadow-lg border border-white/10 transition-shadow duration-500 hover:shadow-[-15px_25px_50px_-5px_rgba(112,111,112,0.5)]"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img src={bgImg} alt={s.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-30" />
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className={cn("absolute inset-0 transition-opacity duration-300", 
                      isLarge ? "bg-gradient-to-t from-ink via-ink/40 to-transparent group-hover:via-ink/60" : 
                      isWide ? "bg-gradient-to-r from-ink via-ink/60 to-transparent group-hover:via-ink/80" :
                      "bg-gradient-to-t from-ink via-ink/50 to-transparent group-hover:via-ink/70")} />
                    
                    {/* Content Container */}
                    <div className={cn("z-10 relative flex flex-col text-white w-full h-full p-5 lg:p-8", 
                      isLarge ? "justify-end" : 
                      isWide ? "justify-center w-2/3 md:w-3/4" : 
                      isTall ? "justify-between" : 
                      "justify-end")}>
                      
                      {/* Top Badge for Large/Tall */}
                      {(isLarge || isTall) && (
                        <div className={cn(isLarge ? "mb-auto" : "mb-4")}>
                          <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm border border-white/20">
                            {s.category}
                          </span>
                        </div>
                      )}
                      
                      {/* Title & Description */}
                      <div className={cn(isWide && "mb-4")}>
                        <h3 className={cn("font-display", 
                          isLarge ? "text-4xl lg:text-5xl mb-3" : 
                          isWide ? "text-3xl mb-2" :
                          isTall ? "text-3xl mb-3" :
                          "text-xl mb-1 leading-tight")}>{s.title}</h3>
                        
                        {(isLarge || isTall || isWide) && (
                          <p className={cn("text-white font-light", 
                            isLarge ? "mb-8 text-base max-w-sm line-clamp-2" : 
                            isWide ? "text-sm max-w-[280px] line-clamp-2" : 
                            isTall ? "mb-8 text-sm max-w-[200px] line-clamp-3" : "")}>{s.desc}</p>
                        )}
                      </div>

                      {/* Footer Row */}
                      <div className={cn("flex items-center justify-between w-full mt-auto", isSmall && "mt-3")}>
                        <div>
                          {(!isSmall) && <p className="text-[10px] uppercase tracking-wider text-white mb-0.5 font-medium">Starts from</p>}
                          <p className={cn("font-semibold text-white", 
                            isLarge ? "text-3xl" : 
                            isWide || isTall ? "text-xl" : 
                            "text-lg")}>{formatPrice(s.priceFrom)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Absolutely positioned time (bottom right) */}
                    <div className={cn("absolute bottom-5 right-5 lg:bottom-8 lg:right-8 flex items-center text-white font-medium z-20", 
                      isLarge ? "gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10" : 
                      "gap-1.5 text-xs")}>
                      <Clock className={isLarge ? "h-4 w-4" : "h-3.5 w-3.5"} />
                      {s.duration}
                    </div>
                    
                    {/* Floating Action Button for Hover */}
                    <div className="absolute top-5 right-5 z-20 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                       <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-xl hover:bg-bronze hover:text-white transition-colors">
                          <ArrowRight size={18} />
                       </span>
                    </div>
                  </article>
                </Link>
              </div>
            )
          })}
        </div>
        )}

        {/* empty state */}
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-stone-400">
            No services in this category.
          </p>
        )}
      </section>

      {/* ────── How Booking Works ────── */}
      <section className="process-section relative overflow-hidden bg-gradient-to-b from-cream to-sand/30 py-20 lg:py-24">
        <div className="grain pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          {/* heading */}
          <div className="text-center">
            <p className="process-heading text-sm font-medium uppercase tracking-widest text-bronze">
              How it works
            </p>
            <h2 className="process-sub mt-2 font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              Book in three simple steps
            </h2>
          </div>

          {/* steps */}
          <div className="relative mt-16">
            {/* connecting line — desktop */}
            <div className="process-line absolute top-14 right-[16.67%] left-[16.67%] hidden h-px border-t-2 border-dashed border-bronze/25 lg:block" />

            <div className="grid gap-10 lg:grid-cols-3 lg:gap-6">
              {steps.map((step, i) => {
                const StepIcon = step.icon
                return (
                  <div
                    key={step.title}
                    className="process-step flex flex-col items-center text-center"
                  >
                    {/* step number ring */}
                    <div className="relative">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-bronze/30 bg-white shadow-md shadow-stone-900/5">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-bronze to-bronze-light text-white shadow-lg shadow-bronze/20">
                          <StepIcon className="h-8 w-8" />
                        </div>
                      </div>
                      {/* step badge */}
                      <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream shadow-sm">
                        {i + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 font-display text-xl text-ink sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ────── CTA Banner ────── */}
      <section className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="cta-banner relative overflow-hidden rounded-[2rem] bg-ink shadow-xl border border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1600&q=80&auto=format&fit=crop" 
            alt="Barbershop" 
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          {/* Uniform transparent overlay so image is visible everywhere, just dark enough for text */}
          <div className="absolute inset-0 bg-ink/70"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 px-6 py-12 sm:px-10 lg:p-12">
            <div className="w-full lg:w-3/5 text-left">
              <span className="inline-flex items-center rounded-full bg-bronze/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze mb-4 border border-bronze/30 backdrop-blur-md">
                Don't Wait
              </span>
              <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl mb-4">
                Ready to book your next <span className="text-bronze italic">masterpiece?</span>
              </h2>
              <p className="text-base font-light leading-relaxed text-cream/80 max-w-lg">
                Prices above are typical starting points. Each shop sets its own catalog and availability. Find a top-rated barber near you and lock in a time that works.
              </p>
            </div>
            
            <div className="flex w-full lg:w-2/5 flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-end gap-3">
              <Link to="/shops" className="w-full sm:w-auto lg:w-full xl:w-auto">
                <Button variant="bronze" className="w-full rounded-full h-12 px-6 text-sm font-semibold shadow-lg hover:shadow-bronze/30 transition-all text-white">
                  Browse shops <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/nearest" className="w-full sm:w-auto lg:w-full xl:w-auto">
                <Button
                  variant="outline"
                  className="w-full rounded-full h-12 px-6 border-white/20 bg-white/5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:text-white transition-all"
                >
                  Nearby shops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
