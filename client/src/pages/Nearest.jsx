import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import ShopCard from '../components/ShopCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'

export default function Nearest() {
  const [lat, setLat] = useState('27.7172')
  const [lng, setLng] = useState('85.324')
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [searched, setSearched] = useState(false)

  const find = async (la = lat, lo = lng) => {
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await api.get('/businesses/nearest', {
        params: { lat: la, lng: lo, limit: 3 },
      })
      setShops(data.businesses)
      if (!data.businesses.length) toast.message('No nearby approved shops found')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to find shops')
      setShops([])
    } finally {
      setLoading(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(5)
        const lo = pos.coords.longitude.toFixed(5)
        setLat(la)
        setLng(lo)
        setLocating(false)
        find(la, lo)
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location. Enter coordinates manually.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium uppercase tracking-widest text-bronze">Haversine</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Nearest barbershops</h1>
        <p className="mt-2 max-w-xl text-stone-500">
          We calculate great-circle distance from your coordinates and return the three closest approved shops.
        </p>
      </motion.div>

      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
          <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button variant="bronze" className="flex-1" loading={loading} onClick={() => find()}>
              <MapPin className="h-4 w-4" /> Find nearest
            </Button>
            <Button variant="outline" onClick={useMyLocation} disabled={locating}>
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              Use my location
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-stone-400">
          Default coordinates are Kathmandu (27.7172, 85.324). Click “Use my location” for GPS.
        </p>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-bronze" />
          </div>
        ) : shops.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((s, i) => (
              <ShopCard key={s._id} shop={s} index={i} />
            ))}
          </div>
        ) : searched ? (
          <EmptyState
            icon={MapPin}
            title="No shops nearby"
            description="Try different coordinates or browse all shops."
          />
        ) : null}
      </div>
    </div>
  )
}
