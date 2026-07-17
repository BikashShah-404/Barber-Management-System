import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShieldCheck,
  Phone,
  Undo2,
  Truck,
  Star,
  Check,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import ShopCard from '../components/ShopCard'
import { blogPosts } from '../data/siteContent'
import { format } from 'date-fns'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function Home() {
  const [shops, setShops] = useState([])
  const root = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/businesses/featured?limit=4')
      .then((res) => {
        if (res.data.businesses.length > 0) {
          setShops(res.data.businesses);
        } else {
          return api.get('/businesses');
        }
      })
      .then((res) => {
        if (res) {
          setShops(res.data.businesses.slice(0, 4));
        }
      })
      .catch(() => {})
  }, [])

  useGSAP(
    () => {
      // 1. Hero Fullscreen Animation
      gsap.fromTo('.hero-bg-image', 
        { scale: 1.1 },
        { scale: 1, duration: 2, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-content > *', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1, delay: 0.3, ease: 'power3.out' }
      )

      // 2. Categories Grid
      gsap.fromTo('.grid-category', 
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: '.categories-grid', start: 'top 85%' }, y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' }
      )

      // 3. Featured / New Arrivals horizontal scroll reveal (Header)
      gsap.fromTo('.featured-head', 
        { y: 30, opacity: 0 },
        { scrollTrigger: { trigger: '.featured-section', start: 'top 85%' }, y: 0, opacity: 1, duration: 0.7 }
      )

      // 4. Features strip
      gsap.fromTo('.feature-item', 
        { y: 30, opacity: 0 },
        { scrollTrigger: { trigger: '.features-strip', start: 'top 85%' }, y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      )

      // 5. Split Promo Section
      gsap.fromTo('.promo-img', 
        { scale: 0.9, opacity: 0 },
        { scrollTrigger: { trigger: '.promo-section', start: 'top 80%' }, scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }
      )
      gsap.fromTo('.promo-text > *', 
        { x: 40, opacity: 0 },
        { scrollTrigger: { trigger: '.promo-section', start: 'top 80%' }, x: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' }
      )

      // 6. Blog
      gsap.fromTo('.blog-card', 
        { y: 40, opacity: 0 },
        { scrollTrigger: { trigger: '.blog-section', start: 'top 85%' }, y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' }
      )

      // 7. Newsletter
      gsap.fromTo('.newsletter-content', 
        { y: 40, opacity: 0 },
        { scrollTrigger: { trigger: '.newsletter-section', start: 'top 80%' }, y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      )
    },
    { scope: root, dependencies: [] }
  )

  useGSAP(
    () => {
      // 3b. Featured / New Arrivals Cards
      if (shops.length > 0) {
        gsap.fromTo('.featured-card', 
          { x: 50, opacity: 0 },
          { scrollTrigger: { trigger: '.featured-grid', start: 'top 80%' }, x: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
        )
      }
    },
    { scope: root, dependencies: [shops] }
  )

  return (
    <div ref={root} className="overflow-hidden bg-cream font-sans">
      {/* ════════════ FULL SCREEN HERO ════════════ */}
      <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1920&q=80&auto=format&fit=crop"
            alt="Barbershop Hero"
            className="hero-bg-image h-full w-full object-cover opacity-60 scale-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"></div>
        </div>
        
        <div className="hero-content relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 text-cream flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl opacity-0 translate-y-10">
            <p className="text-bronze font-bold tracking-widest uppercase text-sm mb-4">
              Established since 2026
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">
              Precision Cuts<span className="text-bronze">.</span><br />
              Masterful Styling<span className="text-bronze">.</span>
            </h1>
            <p className="text-base md:text-lg text-cream/80 mb-8 font-light leading-relaxed">
              <span className="font-bold text-white">BladeBook</span> is a modern booking platform based in Kathmandu, Nepal. Experience premium grooming with our curated selection of top-tier barbers.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/services">
                <Button variant="bronze" className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold">Book Appointment</Button>
              </Link>
              <Link to="/shops" className="text-white hover:text-bronze font-semibold flex items-center transition-colors">
                Explore Shops <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col gap-10 border-l border-white/20 pl-10 py-4 opacity-0 translate-y-10">
            <div className="hero-stat">
              <h3 className="text-5xl font-display text-white mb-1">50+</h3>
              <p className="text-xs text-cream/60 uppercase tracking-[0.2em] font-medium">Top Barbers</p>
            </div>
            <div className="hero-stat">
              <h3 className="text-5xl font-display text-white mb-1">12k+</h3>
              <p className="text-xs text-cream/60 uppercase tracking-[0.2em] font-medium">Happy Clients</p>
            </div>
            <div className="hero-stat">
              <h3 className="text-5xl font-display text-white mb-1">4.8/5</h3>
              <p className="text-xs text-cream/60 uppercase tracking-[0.2em] font-medium">Average Rating</p>
            </div>
            <div className="hero-stat">
              <h3 className="text-5xl font-display text-white mb-1">15+</h3>
              <p className="text-xs text-cream/60 uppercase tracking-[0.2em] font-medium">Locations</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-white/50 flex flex-col items-center animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Scroll</span>
          <div className="w-[1px] h-8 bg-white/30"></div>
          <ChevronDown className="h-4 w-4 mt-1" />
        </div>
      </section>

      {/* ════════════ CATEGORIES ════════════ */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl text-ink">Premium Services</h2>
          <Link to="/services" className="text-sm font-medium border-b border-ink pb-0.5 inline-flex items-center hover:text-zinc-600">
            View all services <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        {/* 3-Card Grid */}
        <div className="categories-grid grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Large Left Card */}
          <div className="grid-category group relative overflow-hidden bg-zinc-900 rounded-3xl flex flex-col justify-between aspect-[3/4] md:aspect-auto md:h-[500px]">
            <div className="absolute inset-0">
               <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80&auto=format&fit=crop" alt="Classic Cuts" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent"></div>
            <div className="z-10 relative mt-auto p-8 text-white">
              <h3 className="font-display text-4xl mb-3">Classic Cuts</h3>
              <p className="text-cream/70 mb-6 max-w-xs">Timeless styles tailored to your unique face shape and personality.</p>
              <Link to="/services" className="inline-flex items-center text-sm font-semibold border-b border-white pb-0.5 hover:text-bronze hover:border-bronze transition-colors">
                Book Now <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            <div className="grid-category group relative overflow-hidden bg-zinc-900 rounded-3xl flex items-center justify-between h-[230px] lg:h-[234px]">
              <div className="absolute inset-0">
                 <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80&auto=format&fit=crop" alt="Beard Trim" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-ink/90 to-transparent"></div>
              <div className="z-10 relative w-full h-full p-8 flex justify-between items-center text-white">
                <div>
                  <h3 className="font-display text-3xl mb-1">Beard Trim</h3>
                  <p className="text-sm text-cream/70">Shape & Style</p>
                </div>
                <Link to="/services" className="inline-flex items-center text-sm font-semibold text-bronze hover:text-white transition-colors">
                  <span className="p-4 bg-white/10 rounded-full backdrop-blur-sm group-hover:bg-bronze group-hover:text-ink transition-colors"><ArrowRight size={20} /></span>
                </Link>
              </div>
            </div>

            <div className="grid-category group relative overflow-hidden bg-zinc-900 rounded-3xl flex items-center justify-between h-[230px] lg:h-[234px]">
              <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1512496115851-a1c8e04ce244?w=800&q=80&auto=format&fit=crop" alt="Facial & Spa" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-ink/90 to-transparent"></div>
              <div className="z-10 relative w-full h-full p-8 flex justify-between items-center text-white">
                <div>
                  <h3 className="font-display text-3xl mb-1">Facial & Spa</h3>
                  <p className="text-sm text-cream/70">Relaxing Treatments</p>
                </div>
                <Link to="/services" className="inline-flex items-center text-sm font-semibold text-bronze hover:text-white transition-colors">
                  <span className="p-4 bg-white/10 rounded-full backdrop-blur-sm group-hover:bg-bronze group-hover:text-ink transition-colors"><ArrowRight size={20} /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ NEW ARRIVALS / FEATURED SHOPS ════════════ */}
      <section className="featured-section mx-auto max-w-[1440px] px-4 sm:px-6 py-16">
        <div className="featured-head flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl text-ink">Featured Barbers</h2>
          <Link to="/shops" className="text-sm font-medium border-b border-ink pb-0.5 inline-flex items-center hover:text-zinc-600">
            More Shops <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        <div className="featured-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop, i) => (
            <div key={shop._id} className="featured-card group cursor-pointer" onClick={() => navigate(`/shops/${shop._id}`)}>
              <div className="relative aspect-square mb-4 overflow-hidden rounded-3xl bg-zinc-100">
                <div className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink z-10 shadow-sm">
                  NEW
                </div>
                <div className="absolute top-3 right-3 bg-white p-1.5 rounded-full z-10 shadow-sm text-zinc-400 hover:text-ink transition-colors">
                  <Heart size={16} />
                </div>
                <img src={shop.coverImage || shop.images?.[0] || 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&q=80&auto=format&fit=crop'} alt={shop.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
                   <Button variant="bronze" className="w-full bg-ink text-cream hover:bg-zinc-800">Book Appointment</Button>
                </div>
              </div>
              <div className="flex text-zinc-800 mb-1">
                {[1,2,3,4,5].map(star => <Star key={star} size={12} className="fill-current" />)}
              </div>
              <h4 className="font-semibold text-ink text-sm mb-1">{shop.name}</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-ink">Rs. 500+</span>
                <span className="text-zinc-400 line-through">Rs. 800</span>
              </div>
            </div>
          ))}
          {/* Fallbacks if DB has < 4 shops */}
          {shops.length < 4 && [
            'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=500&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1520338661084-68034fd53002?w=500&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1593702295094-aea22597af65?w=500&q=80&auto=format&fit=crop'
          ].slice(0, 4 - shops.length).map((imgUrl, i) => (
            <div key={i} className="featured-card group cursor-pointer" onClick={() => navigate('/shops')}>
              <div className="relative aspect-square mb-4 overflow-hidden rounded-3xl bg-zinc-100">
                 <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider z-10">
                  -50%
                </div>
                <img src={imgUrl} alt="Shop" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex text-zinc-800 mb-1">
                {[1,2,3,4,5].map(star => <Star key={star} size={12} className="fill-current" />)}
              </div>
              <h4 className="font-semibold text-ink text-sm mb-1">Premium Cut</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-ink">Rs. 400</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ 4-COLUMN FEATURES ════════════ */}
      <section className="features-strip mx-auto max-w-[1440px] px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="feature-item bg-cream-dark/30 p-8 flex flex-col items-start gap-4 rounded-3xl">
            <Truck className="h-7 w-7 text-ink" strokeWidth={1.5} />
            <div>
              <h4 className="font-semibold text-ink mb-1 text-sm">Fast Booking</h4>
              <p className="text-xs text-stone-500">Confirm in under 2 mins</p>
            </div>
          </div>
          <div className="feature-item bg-cream-dark/30 p-8 flex flex-col items-start gap-4 rounded-3xl">
            <Undo2 className="h-7 w-7 text-ink" strokeWidth={1.5} />
            <div>
              <h4 className="font-semibold text-ink mb-1 text-sm">Money-back</h4>
              <p className="text-xs text-stone-500">Satisfaction guarantee</p>
            </div>
          </div>
          <div className="feature-item bg-cream-dark/30 p-8 flex flex-col items-start gap-4 rounded-3xl">
            <ShieldCheck className="h-7 w-7 text-ink" strokeWidth={1.5} />
            <div>
              <h4 className="font-semibold text-ink mb-1 text-sm">Secure Platform</h4>
              <p className="text-xs text-stone-500">Verified shop listings</p>
            </div>
          </div>
          <div className="feature-item bg-cream-dark/30 p-8 flex flex-col items-start gap-4 rounded-3xl">
            <Phone className="h-7 w-7 text-ink" strokeWidth={1.5} />
            <div>
              <h4 className="font-semibold text-ink mb-1 text-sm">24/7 Support</h4>
              <p className="text-xs text-stone-500">Phone and email support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 50/50 PROMO SECTION ════════════ */}
      <section className="promo-section flex flex-col md:flex-row w-full mt-12 border-t border-b border-zinc-200">
        <div className="promo-img w-full md:w-1/2 h-[400px] md:h-[500px]">
          <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80&auto=format&fit=crop" alt="Promo" className="h-full w-full object-cover" />
        </div>
        <div className="promo-text w-full md:w-1/2 bg-zinc-100 flex flex-col justify-center p-12 lg:p-24">
          <p className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-4">Sale up to 35% off</p>
          <h2 className="font-display text-4xl lg:text-5xl text-ink leading-tight mb-4">
            HUNDREDS of<br />New lower prices!
          </h2>
          <p className="text-stone-500 text-base mb-8 max-w-sm">
            It's more affordable than ever to give your grooming routine a stylish makeover.
          </p>
          <div>
            <Link to="/pricing" className="inline-flex items-center text-sm font-semibold border-b border-ink pb-0.5 hover:text-zinc-600 transition-colors">
              Book Now <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ ARTICLES / BLOG ════════════ */}
      <section className="blog-section mx-auto max-w-[1440px] px-4 sm:px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl text-ink">Articles</h2>
          <Link to="/blog" className="text-sm font-medium border-b border-ink pb-0.5 inline-flex items-center hover:text-zinc-600">
            More Articles <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.slice(0, 3).map((post) => (
            <div key={post.slug} className="blog-card group cursor-pointer" onClick={() => navigate(`/blog/${post.slug}`)}>
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-200 mb-4">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-semibold text-ink text-base mb-2 group-hover:text-zinc-600 transition-colors">{post.title}</h3>
              <Link to={`/blog/${post.slug}`} className="text-xs font-semibold border-b border-ink pb-0.5 inline-flex items-center hover:text-zinc-600">
                Read More <ArrowRight size={12} className="ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ NEWSLETTER BANNER ════════════ */}
      <section className="newsletter-section relative overflow-hidden bg-ink py-20 px-4 sm:px-6 flex items-center justify-center min-h-[500px]">
        <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80&auto=format&fit=crop" alt="Newsletter" className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent"></div>
        <div className="newsletter-content relative z-10 w-full max-w-5xl mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="text-left w-full md:w-1/2">
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">Stay Sharp.</h2>
            <p className="text-cream/80 text-base md:text-lg font-light leading-relaxed">
              Subscribe to our newsletter for exclusive grooming tips, early access to premium products, and special VIP promotions.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex items-center bg-white/10 rounded-full p-2 border border-white/20 shadow-inner backdrop-blur-md focus-within:ring-2 focus-within:ring-bronze/50 transition-all">
               <input type="email" placeholder="Enter your email address" className="bg-transparent flex-1 px-4 py-2 text-sm md:text-base text-white placeholder:text-white/50" style={{ border: 'none', outline: 'none', boxShadow: 'none' }} />
               <Button variant="bronze" className="rounded-full px-6 py-4 font-semibold shadow-lg hover:shadow-bronze/20 text-white">Subscribe</Button>
            </div>
            <p className="text-white/40 text-xs mt-4 pl-4">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
