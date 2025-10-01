'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import { MapPin, Crown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { canShowProximityHints, shouldShowDistanceHints } from '@/lib/hunt-permissions'
import type { Drop, User } from '@/types'
import { useAuth } from '@/components/auth-provider'
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
  selectedRadius?: number
  unearthLocation?: { lat: number; lng: number } | null
  drops?: Partial<Drop>[]
  onDropClick?: (drop: Partial<Drop>) => void
  mode?: 'bury' | 'unearth'
  className?: string
}

// Distance circle animation component
function AnimatedDistanceCircles({ location }: { location: { lat: number; lng: number } }) {
  const [animationPhase, setAnimationPhase] = useState(0)
  const distanceRings = [
    { radius: 10, color: '#3B82F6', delay: 0, label: '10m' },    // Blue
    { radius: 50, color: '#10B981', delay: 500, label: '50m' },  // Green  
    { radius: 100, color: '#F59E0B', delay: 1000, label: '100m' }, // Yellow
    { radius: 250, color: '#EF4444', delay: 1500, label: '250m' }  // Red
  ]

  useEffect(() => {
    // Start animation sequence
    const startAnimation = () => {
      setAnimationPhase(1)
      
      // Fade out after a few cycles
      setTimeout(() => {
        setAnimationPhase(2)
      }, 4000) // Show for 4 seconds total
      
      setTimeout(() => {
        setAnimationPhase(0)
      }, 5000) // Complete fade out
    }

    startAnimation()
  }, [location])

  if (animationPhase === 0) return null

  return (
    <>
      {distanceRings.map((ring, index) => (
        <Circle
          key={`animated-ring-${ring.radius}-${location.lat}-${location.lng}`}
          center={[location.lat, location.lng]}
          radius={ring.radius}
          pathOptions={{
            color: ring.color,
            fillColor: ring.color,
            fillOpacity: animationPhase === 1 ? 0.1 : 0.05,
            weight: animationPhase === 1 ? 2 : 1,
            opacity: animationPhase === 1 ? 0.8 : 0.3,
            dashArray: '5, 10',
          }}
        />
      ))}
    </>
  )
}

// Custom drop marker icons
const createDropIcon = (dropType: string, tier: string) => {
  const baseColors = {
    free: '#6b7280',
    premium: '#a855f7', 
    paid: '#3b82f6',
  }
  
  const baseColor = baseColors[tier as keyof typeof baseColors] || '#6b7280'
  
  if (dropType === 'hunt') {
    // Special hunt marker with treasure chest styling
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <!-- Pulsing ring animation -->
          <circle cx="16" cy="16" r="14" fill="none" stroke="#8B5CF6" stroke-width="2" opacity="0.6">
            <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <!-- Main marker -->
          <circle cx="16" cy="16" r="11" fill="#8B5CF6" stroke="#fbbf24" stroke-width="2"/>
          <!-- Crown/treasure icon -->
          <path d="M16 9L18 13L22 13L19 16L20 20L16 18L12 20L13 16L10 13L14 13L16 9Z" 
                fill="#fbbf24" stroke="white" stroke-width="0.5"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    })
  } else {
    // Regular drop markers
    const icon = dropType === 'public' ? 'Users' : 'MapPin'
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12.5" cy="12.5" r="10" fill="${baseColor}" stroke="white" stroke-width="2"/>
          <path d="M12.5 7L12.5 18M7 12.5L18 12.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `)}`,
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
      popupAnchor: [0, -12.5],
    })
  }
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

function DropMarker({ 
  drop, 
  onClick, 
  userLocation, 
  currentUser 
}: { 
  drop: Partial<Drop>
  onClick?: (drop: Partial<Drop>) => void
  userLocation: LatLng | null
  currentUser: User | null
}) {
  const tier = drop.tier || 'free'
  const coords = drop.coords
  const isHunt = drop.dropType === 'hunt'
  
  if (!coords) return null

  // Calculate distance for proximity hints
  const distance = userLocation 
    ? Math.sqrt(
        Math.pow((userLocation.lat - coords.lat) * 111320, 2) +
        Math.pow((userLocation.lng - coords.lng) * 111320 * Math.cos(coords.lat * Math.PI / 180), 2)
      )
    : null

  // Check permissions for showing hints
  const permissionCheck = canShowProximityHints(drop as Drop, currentUser)
  const distanceHints = currentUser && distance !== null 
    ? shouldShowDistanceHints(drop as Drop, currentUser, distance)
    : { showHint: false, hintType: 'none' as const }

  return (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={createDropIcon(drop.dropType || 'private', tier)}
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
              tier === 'paid' && 'bg-blue-500'
            )}>
              {isHunt ? <Crown className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900">{drop.title}</h3>
              {isHunt && (
                <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Treasure Hunt
                  {drop.huntDifficulty && (
                    <span className="ml-1 capitalize">({drop.huntDifficulty})</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {drop.description && (
            <p className="text-sm text-gray-600 mb-2">{drop.description}</p>
          )}

          {/* Distance hints for authorized users */}
          {distanceHints.showHint && distance !== null && (
            <div className={cn(
              'mb-2 p-2 rounded-lg text-sm font-medium',
              distanceHints.hintType === 'close' && 'bg-green-100 text-green-800',
              distanceHints.hintType === 'medium' && 'bg-yellow-100 text-yellow-800',
              distanceHints.hintType === 'far' && 'bg-blue-100 text-blue-800'
            )}>
              {distanceHints.message}
              {distance > 0 && (
                <div className="text-xs opacity-75 mt-1">
                  Distance: {Math.round(distance)}m
                </div>
              )}
            </div>
          )}

          {/* Security indicators */}
          {!permissionCheck.canShowHints && drop.dropType === 'hunt' && (
            <div className="mb-2 p-2 bg-purple-50 rounded-lg text-sm">
              <div className="text-purple-700 font-medium">🔐 Join hunt for proximity hints</div>
              <div className="text-xs text-purple-600 mt-1">
                Hunt code required: {drop.huntCode || 'Unknown'}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>Radius: {drop.geofenceRadiusM}m</div>
            <div>Views: {drop.stats?.views || 0}</div>
            <div>Unlocks: {drop.stats?.unlocks || 0}</div>
            <div className="capitalize">Type: {drop.dropType || 'private'}</div>
            {drop.dropType === 'private' && (
              <div className="text-gray-600 font-medium">🔒 Zero hints (secure)</div>
            )}
            {drop.dropType === 'public' && (
              <div className="text-green-600 font-medium">🌍 Visible but no hints</div>
            )}
          </div>
          
          <button 
            onClick={() => onClick?.(drop)}
            className={cn(
              'mt-2 w-full text-white text-sm py-1 px-2 rounded hover:opacity-90 transition-colors',
              isHunt ? 'bg-purple-600' : drop.dropType === 'public' ? 'bg-green-600' : 'bg-gray-600'
            )}
          >
            {isHunt ? '🏴‍☠️ Hunt for Treasure!' : drop.dropType === 'public' ? '🌍 Try to Unlock' : '🔒 Try to Unlock'}
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

export default function Map({ 
  onMapClick, 
  selectedLocation, 
  selectedRadius = 50, 
  unearthLocation, 
  drops = [], 
  onDropClick, 
  mode = 'bury', 
  className 
}: MapProps) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const { user } = useAuth()
  const mapRef = useRef<any>(null)

  // Listen for navigation events from search
  useEffect(() => {
    const handleNavigate = (event: any) => {
      const { lat, lng, zoom } = event.detail
      console.log('Map navigating to:', lat, lng, 'zoom:', zoom)
      
      if (mapRef.current) {
        // Use Leaflet's flyTo method for smooth animation
        mapRef.current.flyTo([lat, lng], zoom || 15, {
          duration: 1.5 // Animation duration in seconds
        })
      }
    }
    
    window.addEventListener('navigateToLocation', handleNavigate)
    return () => window.removeEventListener('navigateToLocation', handleNavigate)
  }, [])

  // Get user's current location with better error handling
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation(new LatLng(latitude, longitude))
          setLocationError(null)
        },
        (error) => {
          console.warn('Could not get user location:', error)
          let errorMsg = 'Location unavailable'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location access denied. Using default location.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location unavailable. Using default location.'
              break
            case error.TIMEOUT:
              errorMsg = 'Location timeout. Using default location.'
              break
          }
          
          setLocationError(errorMsg)
          // Default to London
          setUserLocation(new LatLng(51.5074, -0.1278))
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setLocationError('Geolocation not supported. Using default location.')
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
    <div className={cn('w-full h-full relative', className)}>
      {/* Location status indicator */}
      {locationError && (
        <div className="absolute top-16 left-4 z-[1000] bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 shadow-sm">
          <div className="text-xs text-amber-800 dark:text-amber-200">
            📍 {locationError}
          </div>
        </div>
      )}
      
      <MapContainer
        ref={mapRef}
        center={userLocation}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`}
          attribution=""
        />
        
        {/* Map click handler */}
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Drop markers with permission-based proximity hints */}
        {drops.map((drop) => (
          <React.Fragment key={drop.id}>
            <DropMarker 
              drop={drop} 
              onClick={handleDropClick}
              userLocation={userLocation}
              currentUser={user}
            />
            
            {/* Show radius circles only for authorized hunt participants */}
            {drop.coords && drop.dropType === 'hunt' && user && mode === 'unearth' && (
              (() => {
                const permissionCheck = canShowProximityHints(drop as Drop, user)
                if (!permissionCheck.canShowHints) return null
                
                const distance = Math.sqrt(
                  Math.pow((userLocation.lat - drop.coords.lat) * 111320, 2) +
                  Math.pow((userLocation.lng - drop.coords.lng) * 111320 * Math.cos(drop.coords.lat * Math.PI / 180), 2)
                )
                
                const hintResult = shouldShowDistanceHints(drop as Drop, user, distance)
                if (!hintResult.showHint) return null
                
                return (
                  <Circle
                    center={[drop.coords.lat, drop.coords.lng]}
                    radius={drop.geofenceRadiusM || 100}
                    pathOptions={{
                      color: hintResult.hintType === 'close' ? '#10b981' : 
                             hintResult.hintType === 'medium' ? '#f59e0b' : '#3b82f6',
                      fillColor: hintResult.hintType === 'close' ? '#10b981' : 
                                 hintResult.hintType === 'medium' ? '#f59e0b' : '#3b82f6',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  />
                )
              })()
            )}
          </React.Fragment>
        ))}
        
        {/* Selected location marker (red) */}
        {selectedLocation && (
          <>
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={selectedLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-gray-900">📍 New Drop Location</p>
                  <p className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Precision radius: {selectedRadius}m
                  </p>
                </div>
              </Popup>
            </Marker>
            {/* Show radius circle for selected location */}
            <Circle
              center={[selectedLocation.lat, selectedLocation.lng]}
              radius={selectedRadius}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '3, 3'
              }}
            />
          </>
        )}
        
        {/* Unearth location marker (blue) with animated distance circles */}
        {unearthLocation && (
          <>
            <Marker
              position={[unearthLocation.lat, unearthLocation.lng]}
              icon={unearthLocationIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-gray-900">🔍 Unearth Location</p>
                  <p className="text-sm text-gray-600">
                    {unearthLocation.lat.toFixed(6)}, {unearthLocation.lng.toFixed(6)}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p className="font-medium">Distance Guide:</p>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>10m - Room level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>50m - Building level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>100m - Block level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>250m - Area level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {/* Animated distance guide circles for scale reference */}
            <AnimatedDistanceCircles location={unearthLocation} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
