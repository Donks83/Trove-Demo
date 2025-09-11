'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Search, Settings, Upload, Lock, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/navigation'
import { CreateDropModal } from '@/components/drops/create-drop-modal'
import { UnlockDropModal } from '@/components/drops/unlock-drop-modal'
import { UnearthPopup } from '@/components/drops/unearth-popup'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'
import type { Drop, UnlockDropResponse } from '@/types'

// Dynamically import map components to avoid SSR issues
const Map = dynamic(() => import('@/components/map/map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

interface MapViewProps {
  className?: string
}

export function MapView({ className }: MapViewProps) {
  const { user } = useAuth()
  const [mode, setMode] = useState<'bury' | 'unearth'>('bury')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [unearthLocation, setUnearthLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showUnearthPopup, setShowUnearthPopup] = useState(false)
  const [unearthResult, setUnearthResult] = useState<any>(null)
  const [selectedDrop, setSelectedDrop] = useState<Partial<Drop> | null>(null)
  const [drops, setDrops] = useState<Partial<Drop>[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch public drops when component mounts
  useEffect(() => {
    fetchPublicDrops()
  }, [])

  const fetchPublicDrops = async () => {
    setLoading(true)
    try {
      // Get map bounds (simplified - in production you'd get actual map bounds)
      const bounds = {
        north: 90,
        south: -90,
        east: 180,
        west: -180,
      }
      
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
      })
      
      const response = await fetch(`/api/drops?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDrops(data.drops || [])
      }
    } catch (error) {
      console.error('Error fetching drops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (!user) return
    
    if (mode === 'bury') {
      setSelectedLocation(coords)
      setUnearthLocation(null)
      setShowUnearthPopup(false)
    } else if (mode === 'unearth') {
      setUnearthLocation(coords)
      setSelectedLocation(null)
      setShowUnearthPopup(true)
    }
  }

  const handleDropClick = (drop: Partial<Drop>) => {
    console.log('Drop clicked:', drop)
    setSelectedDrop(drop)
    setShowUnlockModal(true)
  }

  const handleCreateDrop = () => {
    if (!selectedLocation) return
    setShowCreateModal(true)
  }

  const handleDropCreated = (newDrop: any) => {
    // Add the new drop to the list if it's public
    if (newDrop.scope === 'public') {
      setDrops(prev => [...prev, newDrop])
    }
    setSelectedLocation(null)
  }

  const handleUnearthSuccess = (result: UnlockDropResponse) => {
    // Create a mock drop object with the unearthed information
    const unearthedDrop: Partial<Drop> = {
      id: 'unearthed-drop',
      title: result.metadata?.title || 'Unearthed Files',
      description: result.metadata?.description || 'Files found at this location',
      coords: unearthLocation ? {
        lat: unearthLocation.lat,
        lng: unearthLocation.lng,
        geohash: ''
      } : undefined,
      stats: { views: 0, unlocks: 0 }
    }
    
    setSelectedDrop(unearthedDrop)
    setUnearthResult(result)
    setShowUnlockModal(true)
    setShowUnearthPopup(false)
    setUnearthLocation(null)
  }

  const handleUnearthClose = () => {
    setShowUnearthPopup(false)
    setUnearthLocation(null)
  }

  return (
    <div className={cn('relative w-full h-full flex flex-col', className)}>
      {/* Navigation */}
      <Navigation />
      
      {/* Map Container */}
      <div className="flex-1 relative">
        <Map
          onMapClick={handleMapClick}
          selectedLocation={mode === 'bury' ? selectedLocation : null}
          unearthLocation={mode === 'unearth' ? unearthLocation : null}
          drops={drops}
          onDropClick={handleDropClick}
          className="w-full h-full"
        />

        {/* Search Overlay - positioned absolutely over map */}
        <div className="absolute top-4 left-4 right-4 z-map-search pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2">
                  <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    🛠️ DEV MODE - Mock Data
                  </div>
                </div>
              )}
              
              {/* Mode Toggle */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex">
                <button
                  onClick={() => {
                    setMode('bury')
                    setSelectedLocation(null)
                    setUnearthLocation(null)
                    setShowUnearthPopup(false)
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    mode === 'bury'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Bury Mode
                </button>
                <button
                  onClick={() => {
                    setMode('unearth')
                    setSelectedLocation(null)
                    setUnearthLocation(null)
                    setShowUnearthPopup(false)
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    mode === 'unearth'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  Unearth Mode
                </button>
              </div>
              <div className="relative map-search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-primary w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Search results */}
                {searchQuery && (
                  <div className="map-search-results bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Search results for "{searchQuery}"
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          🔍 Location search coming soon!
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          For now, click on the map to place drops at specific locations.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bottom-action-bar p-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {user.tier === 'free' && '🆓 Free Explorer'}
                    {user.tier === 'premium' && '👑 Premium'}
                    {user.tier === 'business' && '🏢 Business'}
                    {process.env.NODE_ENV === 'development' && ' (Dev Mode)'}
                  </div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {!user 
                    ? 'Sign in to create drops'
                    : mode === 'bury'
                      ? selectedLocation 
                        ? 'Pin dropped! Click upload to bury files here.' 
                        : 'BURY MODE: Click anywhere on the map to place a drop. 🎯 Try unlocking test drops: &quot;test123&quot;, &quot;location123&quot;, or &quot;Fake Believe&quot;'
                      : unearthLocation
                        ? 'Enter the secret phrase to unearth files at this location.'
                        : 'UNEARTH MODE: Click anywhere on the map to search for buried files. Try: London (&quot;test123&quot;), North England (&quot;Fake Believe&quot;)'
                  }
                </span>
              </div>
              
              <div className="flex gap-2">
                {mode === 'bury' ? (
                  <>
                    <Button
                      onClick={() => setShowUnlockModal(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Unlock
                    </Button>
                    <Button
                      onClick={handleCreateDrop}
                      disabled={!selectedLocation || !user}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Bury Files
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setShowUnlockModal(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!user}
                  >
                    <Lock className="w-4 h-4" />
                    Unlock by Drop
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marker is now handled in the Map component itself - no redundant marker needed here */}

      {/* Modals */}
      <CreateDropModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedLocation={selectedLocation}
        onSuccess={handleDropCreated}
      />

      <UnlockDropModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false)
          setSelectedDrop(null)
          setUnearthResult(null)
        }}
        drop={selectedDrop || undefined}
        unlockResult={unearthResult}
      />

      <UnearthPopup
        isVisible={showUnearthPopup}
        location={unearthLocation}
        onClose={handleUnearthClose}
        onSuccess={handleUnearthSuccess}
      />
    </div>
  )
}
