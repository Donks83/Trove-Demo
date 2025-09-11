'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import { MapPin, Crown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Drop, UserTier } from '@/types'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  onMapClick?: (coords: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
  unearthLocation?: { lat: number; lng: number } | null
  drops?: Partial<Drop>[]
  onDropClick?: (drop: Partial<Drop>) => void
  className?: string
}

// Custom drop marker icons
const createDropIcon = (tier: UserTier) => {
  const colors = {
    free: '#6b7280',
    premium: '#a855f7', 
    business: '#3b82f6',
  }
  
  const color = colors[tier]
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.5" cy="12.5" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M12.5 7L12.5 18M7 12.5L18 12.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)}`,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5],
  })
}

const selectedLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
      <path d="M15 8L15 22M8 15L22 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `)}`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

const unearthLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="#3b82f6" stroke="white" stroke-width="3"/>
      <path d="M10 15L15 10L20 15M15 10L15 22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `)}`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

function MapClickHandler({ onMapClick }: { onMapClick?: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })
  
  return null
}

function DropMarker({ drop, onClick }: { drop: Partial<Drop>; onClick?: (drop: Partial<Drop>) => void }) {
  const tierIcons = {
    premium: <Crown className="w-3 h-3" />,
    business: <Users className="w-3 h-3" />,
    free: <MapPin className="w-3 h-3" />,
  }

  const tier = drop.tier || 'free'
  const coords = drop.coords
  
  if (!coords) return null

  return (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={createDropIcon(tier)}
      eventHandlers={{
        click: () => onClick?.(drop),
      }}
    >
      <Popup>
        <div className="p-2 min-w-48">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs',
              tier === 'free' && 'bg-gray-500',
              tier === 'premium' && 'bg-purple-500',
              tier === 'business' && 'bg-blue-500'
            )}>
              {tierIcons[tier]}
            </div>
            <h3 className="font-semibold text-gray-900">{drop.title}</h3>
          </div>
          
          {drop.description && (
            <p className="text-sm text-gray-600 mb-2">{drop.description}</p>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>Radius: {drop.geofenceRadiusM}m</div>
            <div>Views: {drop.stats?.views || 0}</div>
            <div>Unlocks: {drop.stats?.unlocks || 0}</div>
          </div>
          
          <button 
            onClick={() => onClick?.(drop)}
            className="mt-2 w-full bg-primary text-white text-sm py-1 px-2 rounded hover:bg-primary/90 transition-colors"
          >
            Try to Unlock
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

export default function Map({ onMapClick, selectedLocation, unearthLocation, drops = [], onDropClick, className }: MapProps) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const mapRef = useRef<any>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation(new LatLng(latitude, longitude))
        },
        (error) => {
          console.warn('Could not get user location:', error)
          // Default to London
          setUserLocation(new LatLng(51.5074, -0.1278))
        }
      )
    } else {
      // Default to London if geolocation not supported
      setUserLocation(new LatLng(51.5074, -0.1278))
    }
  }, [])

  const handleDropClick = (drop: Partial<Drop>) => {
    onDropClick?.(drop)
  }

  if (!userLocation) {
    return (
      <div className={cn('w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center', className)}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className={cn('w-full h-full', className)}>
      <MapContainer
        ref={mapRef}
        center={userLocation}
        zoom={13}
        className="w-full h-full"
        zoomControl={false} // Hide default zoom controls
        attributionControl={false} // Hide attribution
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`}
          attribution=""
        />
        
        {/* Map click handler */}
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Drop markers */}
        {drops.map((drop) => (
          <DropMarker key={drop.id} drop={drop} onClick={handleDropClick} />
        ))}
        
        {/* Selected location marker (red) */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={selectedLocationIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-gray-900">New Drop Location</p>
                <p className="text-sm text-gray-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Unearth location marker (blue) */}
        {unearthLocation && (
          <Marker
            position={[unearthLocation.lat, unearthLocation.lng]}
            icon={unearthLocationIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-gray-900">Unearth Location</p>
                <p className="text-sm text-gray-600">
                  {unearthLocation.lat.toFixed(6)}, {unearthLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
