import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Loader2 } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { toast } from 'sonner'

const KATHMANDU = [27.7172, 85.324]

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 15)
  }, [center, map])
  return null
}

export default function LocationPicker({ latitude, longitude, onChange }) {
  const [locating, setLocating] = useState(false)
  const lat = parseFloat(latitude) || KATHMANDU[0]
  const lng = parseFloat(longitude) || KATHMANDU[1]
  const center = [lat, lng]

  const handlePick = useCallback((lat, lng) => {
    onChange(String(lat.toFixed(6)), String(lng.toFixed(6)))
  }, [onChange])

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePick(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
        toast.success('Location detected')
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getMyLocation}
          disabled={locating}
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Get my location
        </Button>
        <span className="text-xs text-stone-400">or click on the map to place a pin</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200">
        <MapContainer
          center={center}
          zoom={14}
          className="h-64 w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={pinIcon} />
          <ClickHandler onPick={handlePick} />
          <Recenter center={center} />
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          value={latitude}
          onChange={(e) => onChange(e.target.value, longitude)}
        />
        <Input
          label="Longitude"
          value={longitude}
          onChange={(e) => onChange(latitude, e.target.value)}
        />
      </div>
    </div>
  )
}
