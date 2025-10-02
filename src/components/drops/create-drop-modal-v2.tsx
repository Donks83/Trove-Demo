'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { X, Upload, MapPin, Eye, EyeOff, Users, Crown, QrCode, Copy, Check, Radio, Wifi, Navigation, Sparkles, Lock, EyeOffIcon, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShareDropSuccessModal } from '@/components/drops/share-drop-success-modal'
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

type VisibilityType = 'hidden' | 'public' | 'hunt'
type AccessType = 'private' | 'shared'

export function CreateDropModal({ isOpen, onClose, selectedLocation, selectedRadius = 50, onSuccess }: CreateDropModalProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  
  // New state management: separate visibility from access control
  const [visibility, setVisibility] = useState<VisibilityType>('public')
  const [accessControl, setAccessControl] = useState<AccessType>('shared')
  
  const [showHuntForm, setShowHuntForm] = useState(false)
  const [huntCode, setHuntCode] = useState<string>('')
  const [huntQRCode, setHuntQRCode] = useState<string>('')
  const [huntDifficulty, setHuntDifficulty] = useState<'beginner' | 'intermediate' | 'expert' | 'master'>('beginner')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [createdDrop, setCreatedDrop] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  const tierLimits = user ? getTierLimits(user.tier) : getTierLimits('free')

  const form = useForm<CreateDropInput>({
    resolver: zodResolver(createDropSchema),
    defaultValues: {
      title: '',
      description: '',
      secret: '',
      coords: selectedLocation || { lat: 0, lng: 0 },
      geofenceRadiusM: selectedRadius,
      scope: 'public', // Default to shared access
      dropType: 'public', // Default to visible
      retrievalMode: 'remote',
    },
  })

  const selectedRetrievalMode = form.watch('retrievalMode')

  const handleRetrievalModeChange = (mode: 'remote' | 'physical') => {
    if (mode === 'physical' && !tierLimits.canUsePhysicalMode) {
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

  const generateHuntCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    const newCode = `HUNT-${timestamp}-${random}`
    setHuntCode(newCode)
    
    const baseUrl = window.location.origin
    const qrUrl = `${baseUrl}/join-hunt?code=${newCode}`
    setHuntQRCode(qrUrl)
  }

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

  // Update form based on visibility and access control
  useEffect(() => {
    if (visibility === 'hunt') {
      form.setValue('dropType', 'hunt')
      form.setValue('scope', 'private') // Hunts are always private
      form.setValue('retrievalMode', 'physical')
      if (!huntCode) {
        generateHuntCode()
      }
    } else {
      // Map visibility + access to dropType + scope
      // scope: 'private' = owner-only access, 'public' = anyone can access
      // dropType: 'private' = hidden from map, 'public' = visible on map
      
      form.setValue('scope', accessControl === 'private' ? 'private' : 'public')
      form.setValue('dropType', visibility === 'hidden' ? 'private' : 'public')
    }
  }, [visibility, accessControl, form, huntCode])

  useEffect(() => {
    if (selectedRadius) {
      form.setValue('geofenceRadiusM', selectedRadius)
    }
  }, [selectedRadius, form])

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
      
      if (visibility === 'hunt') {
        formData.append('huntCode', huntCode)
        formData.append('huntDifficulty', huntDifficulty)
      }

      files.forEach((file) => {
        formData.append('files', file)
      })

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
        visibility === 'hunt' ? '🏴‍☠️ Treasure hunt created!' : '✅ Drop created!',
        {
          description: visibility === 'hunt' 
            ? `Your treasure hunt has been created! Share code: ${huntCode}`
            : result.message || 'Your files have been buried at this location.',
        }
      )

      setCreatedDrop(result.drop)
      setShowShareModal(true)
      
      onSuccess?.(result.drop)
      
      form.reset()
      setFiles([])
      setHuntCode('')
      setHuntQRCode('')
      setVisibility('public')
      setAccessControl('shared')
      setShowHuntForm(false)
      setHuntDifficulty('beginner')
    } catch (error: any) {
      console.error('Drop creation error:', error)
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
              {visibility === 'hunt' && <Crown className="w-6 h-6 text-purple-600" />}
              {visibility === 'hunt' ? 'Create Treasure Hunt' : 'Bury Files'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new {visibility === 'hunt' ? 'treasure hunt' : 'drop'} at {selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            {/* Visibility Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visibility
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('hidden')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    visibility === 'hidden'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <EyeOffIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">Hidden</div>
                      <div className="text-xs text-gray-500">Not shown on map</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    visibility === 'public'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">Public</div>
                      <div className="text-xs text-gray-500">Visible on map</div>
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
                    setVisibility('hunt')
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    visibility === 'hunt'
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
              
              {/* Visibility description */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                {visibility === 'hidden' && (
                  <div>
                    <strong>Hidden drops</strong> are not displayed as pins on the map. 
                    People need to know the exact coordinates to find them. Great for secret sharing!
                  </div>
                )}
                {visibility === 'public' && (
                  <div>
                    <strong>Public drops</strong> are visible as pins on the map for anyone to discover. 
                    Perfect for geocaching and public treasure hunts!
                  </div>
                )}
                {visibility === 'hunt' && (
                  <div>
                    <strong>Hunt drops</strong> create gamified experiences with proximity hints for invited participants only. 
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs ml-2">
                      <Crown className="w-3 h-3" />
                      Premium+ only
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Access Control - only show for hidden/public (not hunt) */}
            {visibility !== 'hunt' && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Who Can Unlock
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessControl('shared')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      accessControl === 'shared'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">Shared</div>
                        <div className="text-xs text-gray-500">Anyone with secret phrase</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAccessControl('private')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      accessControl === 'private'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">Private</div>
                        <div className="text-xs text-gray-500">Only you (owner)</div>
                      </div>
                    </div>
                  </button>
                </div>
                
                {/* Access control description */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                  {accessControl === 'shared' ? (
                    <div>
                      <strong className="text-green-600 dark:text-green-400">Shared access:</strong> Anyone who knows the location and secret phrase can unlock the files. Perfect for sharing with friends or the community!
                    </div>
                  ) : (
                    <div>
                      <strong className="text-red-600 dark:text-red-400">Private access:</strong> Only you can unlock these files, even if someone else knows the secret phrase. Use this for personal storage or private bookmarks.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hunt Configuration */}
            {visibility === 'hunt' && (
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

            {/* Rest of the form continues... (File Upload, Title, Description, etc.) */}
            {/* I'll add the rest in the next part to keep this manageable */}