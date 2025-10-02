'use client'

import { useState } from 'react'
import { MapPin, Search, X, Lock, Eye, EyeOff, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DisambiguationModal } from '@/components/drops/disambiguation-modal'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import type { UnlockDropResponse } from '@/types'

interface UnearthPopupProps {
  isVisible: boolean
  location: { lat: number; lng: number } | null
  onClose: () => void
  onSuccess: (result: UnlockDropResponse) => void
}

export function UnearthPopup({ isVisible, location, onClose, onSuccess }: UnearthPopupProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const [secret, setSecret] = useState('')
  const [searching, setSearching] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [showDisambiguation, setShowDisambiguation] = useState(false)
  const [dropOptions, setDropOptions] = useState<any[]>([])
  const [disambiguationLoading, setDisambiguationLoading] = useState(false)
  const [usingGPS, setUsingGPS] = useState(false)
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)

  if (!isVisible || !location) return null

  const handleUseMyLocation = () => {
    setGpsError(null)
    setUsingGPS(true)
    
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser')
      setUsingGPS(false)
      toast({
        title: 'GPS not supported',
        description: 'Your browser doesn\'t support geolocation',
        variant: 'destructive',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setGpsLocation({ lat: latitude, lng: longitude })
        setUsingGPS(true)
        toast({
          title: 'GPS location acquired',
          description: 'Now using your actual location for unlocking',
        })
      },
      (error) => {
        let errorMessage = 'Failed to get your location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable GPS in your browser settings.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out'
        }
        
        setGpsError(errorMessage)
        setUsingGPS(false)
        toast({
          title: 'GPS Error',
          description: errorMessage,
          variant: 'destructive',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleUseMapPin = () => {
    setUsingGPS(false)
    setGpsLocation(null)
    setGpsError(null)
    toast({
      title: 'Using map pin',
      description: 'Now using the map pin location',
    })
  }

  const handleUnearth = async () => {
    if (!secret.trim()) {
      toast({
        title: 'Secret required',
        description: 'Please enter a secret phrase to search for buried files.',
        variant: 'destructive',
      })
      return
    }

    if (!user || !firebaseUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to unearth files.',
        variant: 'destructive',
      })
      return
    }

    setSearching(true)
    try {
      // Get auth token
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      // Call the unearth API endpoint
      const coordsToUse = usingGPS && gpsLocation ? gpsLocation : location
      
      const response = await fetch('/api/drops/unearth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          coords: coordsToUse,
          secret: secret.trim(),
        }),
      })

      const result: UnlockDropResponse = await response.json()

      if (!response.ok) {
        // Check if disambiguation is required
        if (result.requiresDisambiguation && result.dropOptions) {
          console.log('Multiple drops found, showing disambiguation modal')
          setDropOptions(result.dropOptions)
          setShowDisambiguation(true)
          return
        }
        
        throw new Error(result.error || 'Failed to unearth files')
      }

      if (result.success) {
        toast({
          title: 'Files unearthed! 🎉',
          description: 'You found buried treasure! Download links are ready.',
        })
        onSuccess(result)
        onClose()
        setSecret('')
      }
    } catch (error: any) {
      console.error('Unearth error:', error)
      
      let errorMessage = 'No files found at this location with that secret phrase.'
      
      if (error.message) {
        if (error.message.includes('Authentication')) {
          errorMessage = 'Please sign in to search for buried files.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: 'Nothing found',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSearching(false)
    }
  }

  const handleDisambiguationSelect = async (dropId: string) => {
    setDisambiguationLoading(true)
    try {
      const token = await firebaseUser!.getIdToken()
      
      // Use GPS location if available, otherwise use map pin
      const coordsToUse = usingGPS && gpsLocation ? gpsLocation : location
      
      // Call the specific drop unlock endpoint
      const response = await fetch(`/api/drops/${dropId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          secret: secret.trim(),
          coords: coordsToUse,
        }),
      })

      const result: UnlockDropResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unlock drop')
      }

      if (result.success) {
        toast({
          title: 'Drop unlocked! 🎉',
          description: 'Download links are ready.',
        })
        setShowDisambiguation(false)
        onSuccess(result)
        onClose()
        setSecret('')
        setDropOptions([])
      }
    } catch (error: any) {
      console.error('Unlock error:', error)
      toast({
        title: 'Failed to unlock',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDisambiguationLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnearth()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[1000]">
        {/* Popup positioned above the marker */}
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: '40%', // Position above center
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-80 max-w-sm mx-4 sm:mx-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Unearth Location</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Location mode selector */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                Location Source:
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseMapPin}
                  className={`flex-1 ${!usingGPS ? 'bg-blue-100 dark:bg-blue-800 border-blue-500' : ''}`}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Map Pin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  className={`flex-1 ${usingGPS ? 'bg-green-100 dark:bg-green-800 border-green-500' : ''}`}
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  My GPS
                </Button>
              </div>
              {usingGPS && gpsLocation && (
                <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                  ✓ GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                </div>
              )}
              {usingGPS && !gpsLocation && (
                <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  Getting your location...
                </div>
              )}
              {gpsError && (
                <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                  {gpsError}
                </div>
              )}
              {!usingGPS && (
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  Using map pin: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secret Phrase
              </label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="Enter secret phrase..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  data-1password-ignore="true"
                  name="x-unearth-phrase-field"
                  className="w-full pr-10"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the secret phrase to search for buried files at this location
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnearth}
                disabled={searching || !secret.trim()}
                className="flex-1 flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Unearth
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow pointing down to marker */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
        </div>
      </div>
      </div>

      {/* Disambiguation Modal */}
      <DisambiguationModal
        isOpen={showDisambiguation}
        onClose={() => {
          setShowDisambiguation(false)
          setDropOptions([])
        }}
        dropOptions={dropOptions}
        onSelectDrop={handleDisambiguationSelect}
        loading={disambiguationLoading}
      />
    </>
  )
}
