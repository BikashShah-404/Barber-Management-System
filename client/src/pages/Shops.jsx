import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { Search, Filter, Navigation, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import ShopCard from '../components/ShopCard'
import { PageLoader } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function Shops() {
  const root = useRef(null)
  const [params, setParams] = useSearchParams()
  const [shops, setShops] = useState([])
  const [renderedShops, setRenderedShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState(params.get('q') || '')
  const [service, setService] = useState(params.get('service') || '')
  const [city, setCity] = useState(params.get('city') || '')

  const [locating, setLocating] = useState(false)

  const load = async (query = {}) => {
    setLoading(true)
    try {
      let data;
      if (query.lat && query.lng) {
        const res = await api.get('/businesses/nearest', { params: { ...query, limit: 12 } })
        data = res.data
      } else {
        const res = await api.get('/businesses', { params: query })
        data = res.data
      }
      setShops(data.businesses)
      setRenderedShops(data.businesses.slice(0, 6))
    } catch {
      setShops([])
      setRenderedShops([])
    } finally {
      setLoading(false)
    }
  }

  const findNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(5)
        const lo = pos.coords.longitude.toFixed(5)
        setLocating(false)
        setQ('')
        setService('')
        setCity('')
        setParams({ lat: la, lng: lo })
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    load({
      q: params.get('q') || undefined,
      service: params.get('service') || undefined,
      city: params.get('city') || undefined,
      lat: params.get('lat') || undefined,
      lng: params.get('lng') || undefined,
    })
  }, [params])

  // Defer rendering of off-screen cards to prevent main-thread freeze
  // from stuttering the initial GSAP text animations
  useEffect(() => {
    if (shops.length > 6) {
      const timer = setTimeout(() => {
        setRenderedShops(shops)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [shops])

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.shop-eyebrow', { y: 16, opacity: 0, duration: 0.45 })
        .from('.shop-title', { y: 36, opacity: 0, duration: 0.65 }, '-=0.25')
        .from('.shop-sub', { y: 20, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.shop-form', { y: 24, opacity: 0, duration: 0.6 }, '-=0.3')
    },
    { scope: root, dependencies: [] }
  )

  const apply = (e) => {
    e?.preventDefault()
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (service) next.set('service', service)
    if (city) next.set('city', city)
    setParams(next)
  }

  return (
    <div ref={root} className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6">
      <div>
        <p className="shop-eyebrow text-sm font-medium uppercase tracking-widest text-bronze">Directory</p>
        <h1 className="shop-title mt-2 font-display text-4xl text-ink sm:text-5xl">Find a barbershop</h1>
        <p className="shop-sub mt-2 max-w-lg text-stone-500">
          Search by name, owner, services, or city. Results use text matching with relevance ranking.
        </p>
      </div>

      <form
        onSubmit={apply}
        className="shop-form mt-8 grid gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-4"
      >
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-[2.35rem] h-4 w-4 text-stone-400" />
          <Input
            label="Search"
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Haircut, fade, shop or owner name…"
          />
        </div>
        <Input
          label="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="e.g. Beard"
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Kathmandu"
        />
        <div className="sm:col-span-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={findNearMe}
            disabled={locating}
            className="text-stone-600"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Near Me
          </Button>
          <Button type="submit" variant="bronze">
            <Filter className="h-4 w-4" /> Apply filters
          </Button>
        </div>
      </form>

      <div className="mt-10">
        {loading ? (
          <PageLoader />
        ) : shops.length ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                {shops.length} {service ? `shop(s) found for "${service}"` : 'shop(s) found'}
              </p>
              {service && (
                <Link to="/shops">
                  <Button variant="outline" size="sm">View All Shops</Button>
                </Link>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {renderedShops.map((s, i) => (
                <ShopCard key={s._id} shop={s} index={i} hideMatch={!!(q || service || city || params.get('lat'))} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching shops"
            description="Try a different search term or clear filters."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ('')
                  setService('')
                  setCity('')
                  setParams({})
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
