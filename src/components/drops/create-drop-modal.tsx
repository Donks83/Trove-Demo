'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { X, Upload, MapPin, Clock, Eye, EyeOff, AlertCircle, Users, Crown, QrCode, Copy, Check, Radio, Wifi, Navigation, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import { toast as sonnerToast } from 'sonner'
import { createDropSchema } from '@/lib/validations'
import { getTierLimits, validateDropForTier, getUpgradeBenefits } from '@/lib/tiers'
import { formatDistance } from '@/lib/geo'
import type { CreateDropInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface CreateDropModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLocation: { lat: number; lng: number } | null
  selectedRadius?: number
  onSuccess?: (drop: any) => void
}

export function CreateDropModal({ isOpen, onClose, selectedLocation, selectedRadius = 50, onSuccess }: CreateDropModalProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [dropType, setDropType] = useState<'private' | 'public' | 'hunt'>('private')
  const [showHuntForm, setShowHuntForm] = useState(false)
  const [huntCode, setHuntCode] = useState<string>('')
  const [huntQRCode, setHuntQRCode] = useState<string>('')
  const [huntDifficulty, setHuntDifficulty] = useState<'beginner' | 'intermediate' | 'expert' | 'master'>('beginner')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const tierLimits = user ? getTierLimits(user.tier) : getTierLimits('free')

  const form = useForm<CreateDropInput>({
    resolver: zodResolver(createDropSchema),
    defaultValues: {
      title: '',
      description: '',
      secret: '',
      coords: selectedLocation || { lat: 0, lng: 0 },
      geofenceRadiusM: selectedRadius,
      scope: 'private',
      dropType: 'private',
      retrievalMode: 'remote',
    },
  })

  // Watch retrieval mode changes
  const selectedRetrievalMode = form.watch('retrievalMode')

  // Handle retrieval mode selection with tier check
  const handleRetrievalModeChange = (mode: 'remote' | 'physical') => {
    if (mode === 'physical' && !tierLimits.canUsePhysicalMode) {
      // Show upgrade prompt
      setShowUpgradeModal(true)
      sonnerToast.error('Premium Feature', {
        description: '👑 Physical unlock mode is only available for Premium+ users',
        action: {
          label: 'Upgrade',
          onClick: () => setShowUpgradeModal(true),
        },
      })
      return
    }
    form.setValue('retrievalMode', mode)
  }

  // Generate hunt code when hunt type is selected
  const generateHuntCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    const newCode = `HUNT-${timestamp}-${random}`
    setHuntCode(newCode)
    
    // Generate QR code URL (you could use a QR code library or service)
    const baseUrl = window.location.origin
    const qrUrl = `${baseUrl}/join-hunt?code=${newCode}`
    setHuntQRCode(qrUrl)
  }

  // Copy hunt code to clipboard
  const copyHuntCode = async () => {
    try {
      await navigator.clipboard.writeText(huntCode)
      setCopiedCode(true)
      sonnerToast.success('Hunt code copied!', {
        description: 'Share this code with participants to join the hunt.',
      })
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (error) {
      sonnerToast.error('Copy failed', {
        description: 'Please copy the code manually.',
      })
    }
  }

  // Update form when drop type changes
  useEffect(() => {
    form.setValue('dropType', dropType)
    if (dropType === 'hunt') {
      form.setValue('scope', 'private')
      form.setValue('retrievalMode', 'physical')
      if (!huntCode) {
        generateHuntCode()
      }
    }
  }, [dropType, form, huntCode])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0)
    const totalSizeMB = totalSize / (1024 * 1024)

    if (totalSizeMB > tierLimits.maxFileSizeMB) {
      sonnerToast.error('Files too large', {
        description: `Total file size exceeds ${tierLimits.maxFileSizeMB}MB limit for ${user?.tier} tier`,
      })
      return
    }

    setFiles(acceptedFiles)
  }, [tierLimits.maxFileSizeMB, user?.tier])

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
        sonnerToast.error('Tier limits exceeded', {
          description: tierValidation.errors.join(', '),
          action: tierValidation.errors.some(e => e.includes('Physical')) ? {
            label: 'Upgrade to Premium',
            onClick: () => setShowUpgradeModal(true),
          } : undefined,
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
      formData.append('dropType', data.dropType)
      formData.append('retrievalMode', data.retrievalMode)
      if (data.expiresAt) formData.append('expiresAt', data.expiresAt.toISOString())
      
      // Add hunt-specific data
      if (dropType === 'hunt') {
        formData.append('huntCode', huntCode)
        formData.append('huntDifficulty', huntDifficulty)
      }

      files.forEach((file) => {
        formData.append('files', file)
      })

      // Get auth token
      let token
      try {
        token = await firebaseUser.getIdToken(true)
      } catch (tokenError) {
        console.error('Error getting token:', tokenError)
        if (process.env.NODE_ENV === 'development') {
          token = 'dev-token-' + user.uid + '-' + Date.now()
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
        
        // Map error codes to user-friendly messages
        let errorMessage = error.error || 'Failed to create drop'
        let showUpgrade = false
        
        if (error.error?.includes('physical') || error.error?.includes('Physical')) {
          errorMessage = '👑 Physical unlock mode requires Premium+'
          showUpgrade = true
        } else if (error.error?.includes('radius') || error.error?.includes('distance')) {
          errorMessage = `📍 ${error.error}`
        } else if (error.error?.includes('file size') || error.error?.includes('MB')) {
          errorMessage = `📦 ${error.error}`
        }
        
        sonnerToast.error('Failed to create drop', {
          description: errorMessage,
          action: showUpgrade ? {
            label: 'Upgrade',
            onClick: () => setShowUpgradeModal(true),
          } : undefined,
        })
        throw new Error(error.error || 'Failed to create drop')
      }

      const result = await response.json()

      sonnerToast.success(
        dropType === 'hunt' ? '🏴‍☠️ Treasure hunt created!' : '✅ Drop created!',
        {
          description: dropType === 'hunt' 
            ? `Your treasure hunt has been created! Share code: ${huntCode}`
            : result.message || 'Your files have been buried at this location.',
        }
      )

      onSuccess?.(result.drop)
      onClose()
      form.reset()
      setFiles([])
      setHuntCode('')
      setHuntQRCode('')
      setDropType('private')
      setShowHuntForm(false)
      setHuntDifficulty('beginner')
    } catch (error: any) {
      console.error('Drop creation error:', error)
      // Error already shown via sonner above
    } finally {
      setUploading(false)
    }
  }

  const totalFileSize = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)
  const radiusValue = form.watch('geofenceRadiusM')

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {dropType === 'hunt' && <Crown className="w-6 h-6 text-purple-600" />}
              {dropType === 'hunt' ? 'Create Treasure Hunt' : 'Bury Files'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new {dropType === 'hunt' ? 'treasure hunt' : 'drop'} at {selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Drop Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDropType('private')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    dropType === 'private'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">Private</div>
                      <div className="text-xs text-gray-500">Secure sharing</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setDropType('public')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    dropType === 'public'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">Public</div>
                      <div className="text-xs text-gray-500">Open sharing</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (user?.tier === 'free') {
                      sonnerToast.error('Premium Feature', {
                        description: '👑 Treasure hunts are only available for Premium+ users',
                        action: {
                          label: 'Upgrade',
                          onClick: () => setShowUpgradeModal(true),
                        },
                      })
                      return
                    }
                    setDropType('hunt')
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    dropType === 'hunt'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    user?.tier === 'free' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">Hunt</div>
                      <div className="text-xs text-gray-500">
                        {user?.tier === 'free' ? 'Premium only' : 'Gamified'}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Drop type descriptions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                {dropType === 'private' && (
                  <div>
                    <strong>Private drops</strong> are only accessible with exact coordinates and secret phrase. 
                    Zero proximity hints - maximum security for confidential documents.
                  </div>
                )}
                {dropType === 'public' && (
                  <div>
                    <strong>Public drops</strong> are visible on the map for anyone to discover. 
                    No proximity hints - users must find them by exploring the map.
                  </div>
                )}
                {dropType === 'hunt' && (
                  <div>
                    <strong>Hunt drops</strong> create gamified experiences with proximity hints for invited participants only. 
                    Perfect for team building and interactive adventures.
                  </div>
                )}
              </div>
            </div>

            {/* Hunt Configuration - only show if hunt type selected */}
            {dropType === 'hunt' && (
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">Hunt Code & Settings</h3>
                  <button
                    type="button"
                    onClick={() => setShowHuntForm(!showHuntForm)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    {showHuntForm ? 'Hide' : 'Configure'}
                  </button>
                </div>

                {/* Hunt Code Display */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Hunt Code (Share with participants)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={huntCode}
                        readOnly
                        className="bg-white dark:bg-purple-900/20 border-purple-300 font-mono text-center font-semibold"
                      />
                      <Button
                        type="button"
                        onClick={copyHuntCode}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedCode ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        type="button"
                        onClick={generateHuntCode}
                        variant="outline"
                        size="sm"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                      Participants enter this code to join the hunt and get proximity hints
                    </p>
                  </div>

                  {huntQRCode && (
                    <div className="text-center">
                      <p className="text-xs text-purple-600 dark:text-purple-300 mb-2">
                        QR Code URL: {huntQRCode}
                      </p>
                    </div>
                  )}
                </div>
                
                {showHuntForm && (
                  <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                    <div>
                      <label className="block text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                        Difficulty Level
                      </label>
                      <select 
                        value={huntDifficulty}
                        onChange={(e) => setHuntDifficulty(e.target.value as typeof huntDifficulty)}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-purple-900/20"
                      >
                        <option value="beginner">🟢 Beginner (100m+ radius, strong hints)</option>
                        <option value="intermediate">🟡 Intermediate (50m radius, moderate hints)</option>
                        <option value="expert">🟠 Expert (25m radius, minimal hints)</option>
                        <option value="master">🔴 Master (exact coordinates required)</option>
                      </select>
                      <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                        Controls how precise hunters need to be and hint strength
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dropType === 'hunt' ? 'Treasure files to hide' : 'Files to bury'}
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
                {dropType === 'hunt' ? 'Hunt title (clue description)' : 'Title'} *
              </label>
              <Input
                placeholder={dropType === 'hunt' ? 'e.g., Find the coffee machine treasure!' : 'Enter drop title...'}
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dropType === 'hunt' ? 'Clue description' : 'Description'}
              </label>
              <textarea
                placeholder={dropType === 'hunt' ? 'Give hunters a hint about this location...' : 'Optional description...'}
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
                  placeholder={dropType === 'hunt' ? 'e.g., coffee time' : 'Enter secret phrase...'}
                  className="pr-10"
                  autoComplete="new-password"
                  data-lpignore="true"
                  {...form.register('secret')}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {dropType === 'hunt' 
                  ? 'This phrase will be shared with hunt participants' 
                  : 'This phrase will be required to unlock your drop'
                }
              </p>
              {form.formState.errors.secret && (
                <p className="text-sm text-red-600">{form.formState.errors.secret.message}</p>
              )}
            </div>

            {/* Drop Radius Display (set from map sidebar) */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Drop Radius</h4>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {formatDistance(radiusValue)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {radiusValue <= 25 && '🏢 Building precision - Files unlock within room/building'}
                    {radiusValue > 25 && radiusValue <= 100 && '🏙️ City block accuracy - Files unlock within city block'}
                    {radiusValue > 100 && '🗺️ General area - Files unlock within general area'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    💡 <strong>Tip:</strong> Adjust the radius using the slider on the map before opening this dialog.
                  </p>
                </div>
              </div>
            </div>

            {/* Only show scope and retrieval options for non-hunt drops */}
            {dropType !== 'hunt' && (
              <>
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

                {/* ENHANCED Retrieval Mode Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unlock Mode
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Remote Mode Card */}
                    <button
                      type="button"
                      onClick={() => handleRetrievalModeChange('remote')}
                      className={cn(
                        'relative p-4 rounded-lg border-2 transition-all text-left',
                        selectedRetrievalMode === 'remote'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Wifi className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Remote Unlock</span>
                            <Radio className="w-3 h-3 text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Access from anywhere with coordinates & secret phrase
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-3 h-3" />
                            <span>Available on all tiers</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Physical Mode Card */}
                    <button
                      type="button"
                      onClick={() => handleRetrievalModeChange('physical')}
                      className={cn(
                        'relative p-4 rounded-lg border-2 transition-all text-left',
                        selectedRetrievalMode === 'physical'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 hover:border-gray-300',
                        !tierLimits.canUsePhysicalMode && 'opacity-75'
                      )}
                    >
                      {!tierLimits.canUsePhysicalMode && (
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Crown className="w-3 h-3" />
                          <span>Premium+</span>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            tierLimits.canUsePhysicalMode 
                              ? 'bg-purple-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}>
                            <Navigation className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Physical Unlock</span>
                            {tierLimits.canUsePhysicalMode && (
                              <Radio className="w-3 h-3 text-purple-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Must be physically present at the location to access
                          </p>
                          {tierLimits.canUsePhysicalMode ? (
                            <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                              <Navigation className="w-3 h-3" />
                              <span>GPS validation enabled</span>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Crown className="w-3 h-3" />
                              <span>Upgrade to unlock</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
                    {selectedRetrievalMode === 'remote' ? (
                      <div className="flex items-start gap-2">
                        <Wifi className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Remote mode:</strong> Anyone with the coordinates and secret phrase can access the files from anywhere in the world. Perfect for secure sharing with trusted recipients.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-gray-900 dark:text-gray-100">Physical mode:</strong> Requires users to be physically present within the geofence radius to unlock. GPS-validated for treasure hunts, geocaching, and location-based experiences.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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
                {uploading ? (
                  dropType === 'hunt' ? 'Creating Hunt...' : 'Creating...'
                ) : (
                  dropType === 'hunt' ? 'Create Hunt' : 'Bury Drop'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Crown className="w-6 h-6 text-purple-500" />
                Upgrade to Premium
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Unlock premium features and take your drops to the next level!
              </p>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">
                  Premium Benefits:
                </h4>
                <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                  {user && getUpgradeBenefits(user.tier, 'premium').map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    sonnerToast.info('Coming soon!', {
                      description: 'Upgrade functionality will be available soon.',
                    })
                    setShowUpgradeModal(false)
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
