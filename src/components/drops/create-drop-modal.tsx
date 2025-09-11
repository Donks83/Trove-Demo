'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { X, Upload, MapPin, Clock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import { createDropSchema } from '@/lib/validations'
import { getTierLimits, validateDropForTier } from '@/lib/tiers'
import { formatDistance } from '@/lib/geo'
import type { CreateDropInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface CreateDropModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLocation: { lat: number; lng: number } | null
  onSuccess?: (drop: any) => void
}

export function CreateDropModal({ isOpen, onClose, selectedLocation, onSuccess }: CreateDropModalProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const tierLimits = user ? getTierLimits(user.tier) : getTierLimits('free')

  const form = useForm<CreateDropInput>({
    resolver: zodResolver(createDropSchema),
    defaultValues: {
      title: '',
      description: '',
      secret: '',
      coords: selectedLocation || { lat: 0, lng: 0 },
      geofenceRadiusM: tierLimits.minRadiusM,
      scope: 'public',
      retrievalMode: 'remote',
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0)
    const totalSizeMB = totalSize / (1024 * 1024)

    if (totalSizeMB > tierLimits.maxFileSizeMB) {
      toast({
        title: 'Files too large',
        description: `Total file size exceeds ${tierLimits.maxFileSizeMB}MB limit for ${user?.tier} tier`,
        variant: 'destructive',
      })
      return
    }

    setFiles(acceptedFiles)
  }, [tierLimits.maxFileSizeMB, user?.tier, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: tierLimits.maxFileSizeMB * 1024 * 1024,
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CreateDropInput) => {
    if (!user || !firebaseUser || !selectedLocation || files.length === 0) return

    setUploading(true)
    try {
      // Validate against tier limits
      const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)
      const tierValidation = validateDropForTier(
        user.tier,
        totalSizeMB,
        data.geofenceRadiusM,
        data.scope === 'private',
        data.retrievalMode === 'physical'
      )

      if (!tierValidation.valid) {
        toast({
          title: 'Tier limits exceeded',
          description: tierValidation.errors.join(', '),
          variant: 'destructive',
        })
        return
      }

      // Create FormData for upload
      const formData = new FormData()
      formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      formData.append('secret', data.secret)
      formData.append('lat', selectedLocation.lat.toString())
      formData.append('lng', selectedLocation.lng.toString())
      formData.append('geofenceRadiusM', data.geofenceRadiusM.toString())
      formData.append('scope', data.scope)
      formData.append('retrievalMode', data.retrievalMode)
      if (data.expiresAt) formData.append('expiresAt', data.expiresAt.toISOString())

      files.forEach((file) => {
        formData.append('files', file)
      })

      // Get auth token with better debugging
      console.log('User object:', user)
      console.log('Firebase user:', firebaseUser)
      
      if (!firebaseUser) {
        throw new Error('No Firebase user found - please sign in again')
      }
      
      let token
      try {
        token = await firebaseUser.getIdToken(true) // Force refresh
        console.log('Token retrieved successfully:', token ? 'Yes' : 'No')
      } catch (tokenError) {
        console.error('Error getting token:', tokenError)
        
        // In development, if Firebase emulator is having issues, try a fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: attempting fallback auth')
          // Create a minimal token for development
          token = 'dev-token-' + user.uid + '-' + Date.now()
          console.log('Using development fallback token')
        } else {
          throw new Error(`Failed to get auth token: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`)
        }
      }
      
      if (!token) {
        throw new Error('Auth token is empty - please sign in again')
      }

      const response = await fetch('/api/drops', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create drop')
      }

      const result = await response.json()

      toast({
        title: 'Drop created!',
        description: result.message || 'Your files have been buried at this location.',
      })

      onSuccess?.(result.drop)
      onClose()
      form.reset()
      setFiles([])
    } catch (error: any) {
      toast({
        title: 'Failed to create drop',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const totalFileSize = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)
  const radiusValue = form.watch('geofenceRadiusM')
  const scope = form.watch('scope')
  const retrievalMode = form.watch('retrievalMode')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Bury Files</DialogTitle>
        </DialogHeader>
        <div className="text-gray-600 dark:text-gray-400 mb-4">
          Create a new drop at {selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files to bury
            </label>
            
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary',
                'dropzone'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Max {tierLimits.maxFileSizeMB}MB total for {user?.tier} tier
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected files ({files.length}):</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {totalFileSize.toFixed(2)} MB / {tierLimits.maxFileSizeMB} MB
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <Input
              placeholder="Enter drop title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Secret Phrase */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secret phrase *
            </label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder="Enter secret phrase..."
                className="pr-10"
                autoComplete="new-password"
                {...form.register('secret')}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              This phrase will be required to unlock your drop
            </p>
            {form.formState.errors.secret && (
              <p className="text-sm text-red-600">{form.formState.errors.secret.message}</p>
            )}
          </div>

          {/* Geofence Radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Precision radius
            </label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min={tierLimits.minRadiusM}
                max={tierLimits.maxRadiusM}
                {...form.register('geofenceRadiusM', { valueAsNumber: true })}
                className="w-24"
              />
              <span className="text-sm text-gray-500">meters</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({formatDistance(radiusValue)} radius)
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Range: {formatDistance(tierLimits.minRadiusM)} - {formatDistance(tierLimits.maxRadiusM)} for {user?.tier} tier
            </p>
            {form.formState.errors.geofenceRadiusM && (
              <p className="text-sm text-red-600">{form.formState.errors.geofenceRadiusM.message}</p>
            )}
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Visibility
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="public"
                  {...form.register('scope')}
                  className="text-primary"
                />
                <span className="text-sm">Public (visible on map)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="private"
                  {...form.register('scope')}
                  className="text-primary"
                  disabled={!tierLimits.canUsePrivateSpots}
                />
                <span className={cn(
                  'text-sm',
                  !tierLimits.canUsePrivateSpots && 'text-gray-400'
                )}>
                  Private (direct link only)
                  {!tierLimits.canUsePrivateSpots && ' (Premium+)'}
                </span>
              </label>
            </div>
          </div>

          {/* Retrieval Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Unlock mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="remote"
                  {...form.register('retrievalMode')}
                  className="text-primary"
                />
                <span className="text-sm">Remote (any location)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="physical"
                  {...form.register('retrievalMode')}
                  className="text-primary"
                  disabled={!tierLimits.canUsePhysicalMode}
                />
                <span className={cn(
                  'text-sm',
                  !tierLimits.canUsePhysicalMode && 'text-gray-400'
                )}>
                  Physical only (must be at location)
                  {!tierLimits.canUsePhysicalMode && ' (Premium+)'}
                </span>
              </label>
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-expire after
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={(e) => {
                const days = parseInt(e.target.value)
                if (days > 0) {
                  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
                  form.setValue('expiresAt', expiryDate)
                } else {
                  form.setValue('expiresAt', undefined)
                }
              }}
              defaultValue={tierLimits.defaultExpiryDays.toString()}
            >
              <option value={tierLimits.defaultExpiryDays}>{tierLimits.defaultExpiryDays} days (default)</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              {user?.tier !== 'free' && <option value="30">30 days</option>}
              {user?.tier !== 'free' && <option value="60">60 days</option>}
              {user?.tier !== 'free' && <option value="0">Never expire</option>}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || files.length === 0 || !selectedLocation}
              className="flex-1"
            >
              {uploading ? 'Creating...' : 'Bury Drop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
