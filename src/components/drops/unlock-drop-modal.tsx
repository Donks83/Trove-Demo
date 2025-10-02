'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Lock, MapPin, Download, AlertCircle, Navigation, Shield, Eye, EyeOff, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReportModal } from '@/components/drops/report-modal'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import { unlockDropSchema, type UnlockDropInput } from '@/lib/validations'
import { formatDistance, getCompassDirection } from '@/lib/geo'
import type { Drop, UnlockDropResponse } from '@/types'
import { cn } from '@/lib/utils'

interface UnlockDropModalProps {
  isOpen: boolean
  onClose: () => void
  drop?: Partial<Drop>
  dropId?: string
  unlockResult?: UnlockDropResponse | null
  prefilledLocation?: { lat: number; lng: number }
}

export function UnlockDropModal({ isOpen, onClose, drop, dropId, unlockResult: initialUnlockResult, prefilledLocation }: UnlockDropModalProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const [unlocking, setUnlocking] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [unlockResult, setUnlockResult] = useState<UnlockDropResponse | null>(initialUnlockResult || null)
  const [showSecret, setShowSecret] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const form = useForm<UnlockDropInput>({
    resolver: zodResolver(unlockDropSchema),
    defaultValues: {
      dropId: dropId || drop?.id || '',
      secret: '',
      userCoords: undefined,
    },
  })

  // Update unlock result when prop changes
  useEffect(() => {
    if (initialUnlockResult) {
      setUnlockResult(initialUnlockResult)
    }
  }, [initialUnlockResult])

  // Get user's location
  useEffect(() => {
    // If prefilled location is provided (from drop link), use it
    if (prefilledLocation) {
      setUserLocation(prefilledLocation)
      form.setValue('userCoords', prefilledLocation)
      return
    }
    
    if (isOpen && (drop?.retrievalMode === 'physical' || drop?.coords)) {
      setLocationError(null)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation({ lat: latitude, lng: longitude })
            form.setValue('userCoords', { lat: latitude, lng: longitude })
          },
          (error) => {
            setLocationError(error instanceof GeolocationPositionError ? error.message : 'Location error')
            setUserLocation(null)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        )
      } else {
        setLocationError('Geolocation is not supported by this browser')
      }
    }
  }, [isOpen, drop, form, prefilledLocation])

  const onSubmit = async (data: UnlockDropInput) => {
    if (!user || !firebaseUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to unlock drops.',
        variant: 'destructive',
      })
      return
    }

    setUnlocking(true)
    try {
      // Get auth token
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch(`/api/drops/${data.dropId}/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          secret: data.secret,
          userCoords: data.userCoords,
        }),
      })

      const result: UnlockDropResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unlock drop')
      }

      if (result.success) {
        setUnlockResult(result)
        toast({
          title: 'Drop unlocked!',
          description: 'Your download links are ready.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Failed to unlock drop',
        description: error.message || 'Please check your secret phrase and try again.',
        variant: 'destructive',
      })
    } finally {
      setUnlocking(false)
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Show success feedback
    toast({
      title: 'File downloaded',
      description: `${fileName} has been downloaded to your device.`,
    })
  }

  const handleClose = () => {
    setUnlockResult(null)
    form.reset()
    setUserLocation(null)
    setLocationError(null)
    setShowSecret(false)
    onClose()
  }

  // Calculate distance and direction if we have both locations
  const distance = userLocation && drop?.coords 
    ? Math.round(
        Math.sqrt(
          Math.pow((userLocation.lat - drop.coords.lat) * 111320, 2) +
          Math.pow((userLocation.lng - drop.coords.lng) * 111320 * Math.cos(drop.coords.lat * Math.PI / 180), 2)
        )
      )
    : null

  const direction = userLocation && drop?.coords
    ? getCompassDirection(userLocation.lat, userLocation.lng, drop.coords.lat, drop.coords.lng)
    : null

  const isWithinRadius = drop?.geofenceRadiusM && distance 
    ? distance <= drop.geofenceRadiusM 
    : true

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Unlock Drop
          </DialogTitle>
          {drop && (
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">{drop.title}</h3>
              {drop.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{drop.description}</p>
              )}
            </div>
          )}
        </DialogHeader>

        {unlockResult ? (
          // Success state - show download links
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Drop Unlocked!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your files are ready for download
              </p>
            </div>

            {unlockResult.metadata && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {unlockResult.metadata.title}
                </h4>
                {unlockResult.metadata.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {unlockResult.metadata.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Created: {new Date(unlockResult.metadata.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Files ({unlockResult.downloadUrls?.length || 0})
              </h4>
              {unlockResult.downloadUrls?.map((url, index) => {
                const fileName = unlockResult.metadata?.fileNames[index] || `file_${index + 1}`
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleDownload(url, fileName)}
                  >
                    <span className="truncate">{fileName}</span>
                    <Download className="w-4 h-4 ml-2 flex-shrink-0" />
                  </Button>
                )
              })}
            </div>

            {unlockResult.distance !== undefined && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                You were {formatDistance(unlockResult.distance)} from the drop
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Flag className="w-4 h-4" />
                Report
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Form state - prevent password save prompts
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            
            {/* Location status */}
            {drop?.coords && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Location Check
                    </h4>
                    {userLocation ? (
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {distance !== null ? (
                          <>
                            You are {formatDistance(distance)} {direction} of the drop
                            {drop.geofenceRadiusM && (
                              <div className={cn(
                                'font-medium mt-1',
                                isWithinRadius ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              )}>
                                {isWithinRadius 
                                  ? 'Within unlock radius' 
                                  : `Need to be within ${formatDistance(drop.geofenceRadiusM)}`
                                }
                              </div>
                            )}
                          </>
                        ) : (
                          'Location acquired'
                        )}
                      </div>
                    ) : locationError ? (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {locationError}
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Getting your location...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security warning for physical-only drops */}
            {drop?.retrievalMode === 'physical' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      Physical-Only Mode
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You must be physically at the drop location to unlock this file.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Secret phrase input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Secret phrase *
              </label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="Enter secret phrase"
                  {...form.register('secret')}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-1password-ignore="true"
                  className="pr-10"
                  name="x-secret-phrase-field"
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
              {form.formState.errors.secret && (
                <p className="text-sm text-red-600">{form.formState.errors.secret.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter the exact phrase provided by the drop creator
              </p>
            </div>

            {/* Drop info */}
            {drop && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Radius:</span>
                  <span className="font-medium">{formatDistance(drop.geofenceRadiusM || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                  <span className="font-medium capitalize">{drop.retrievalMode || 'remote'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Views:</span>
                  <span className="font-medium">{drop.stats?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Unlocks:</span>
                  <span className="font-medium">{drop.stats?.unlocks || 0}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={unlocking || (drop?.retrievalMode === 'physical' && !userLocation)}
                className="flex-1"
              >
                {unlocking ? 'Unlocking...' : 'Unlock Drop'}
              </Button>
            </div>
          </form>
        )}  
        </DialogContent>
          
            {/* Report Modal */}
      {drop && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          dropId={drop.id || dropId || ''}
          dropTitle={drop.title || 'Unknown Drop'}
        />
      )}
    </Dialog>
  )
}
