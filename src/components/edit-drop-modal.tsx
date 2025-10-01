'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getTierLimits } from '@/lib/tiers'
import { formatDistance } from '@/lib/geo'
import { cn } from '@/lib/utils'
import type { Drop } from '@/types'

interface EditDropModalProps {
  drop: Drop
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  firebaseUser: any
  userTier: 'free' | 'premium' | 'paid' // Add user tier for validation
}

export function EditDropModal({ drop, isOpen, onClose, onSuccess, firebaseUser, userTier }: EditDropModalProps) {
  const [title, setTitle] = useState(drop.title)
  const [description, setDescription] = useState(drop.description || '')
  const [secret, setSecret] = useState('')
  const [radius, setRadius] = useState(drop.geofenceRadiusM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tierLimits = getTierLimits(userTier)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(drop.title)
      setDescription(drop.description || '')
      setSecret('')
      setRadius(drop.geofenceRadiusM)
      setError(null)
    }
  }, [isOpen, drop])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        geofenceRadiusM: radius, // Add radius to update
      }

      // Only include secret if it's been changed
      if (secret.trim()) {
        updateData.secret = secret.trim()
      }

      const response = await fetch(`/api/drops/${drop.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update drop')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating drop:', error)
      setError(error.message || 'Failed to update drop')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Drop
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter drop title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter drop description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="secret">Secret Phrase</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Leave blank to keep current secret"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only fill this in if you want to change the secret phrase
            </p>
          </div>

          {/* Radius Editor */}
          <div className="space-y-3">
            <Label>Drop Radius</Label>
            <div className={cn(
              "rounded-lg p-4 border-2",
              radius < 100 && "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
              radius >= 100 && radius < 300 && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
              radius >= 300 && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  radius < 100 && "bg-purple-500",
                  radius >= 100 && radius < 300 && "bg-blue-500",
                  radius >= 300 && "bg-green-500"
                )}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      radius < 100 && "text-purple-900 dark:text-purple-100",
                      radius >= 100 && radius < 300 && "text-blue-900 dark:text-blue-100",
                      radius >= 300 && "text-green-900 dark:text-green-100"
                    )}>
                      {formatDistance(radius)}
                      {radius < 100 && <span className="ml-2 text-xs">👑 Premium</span>}
                      {radius >= 100 && radius < 300 && <span className="ml-2 text-xs">💳 Paid</span>}
                      {radius >= 300 && <span className="ml-2 text-xs">🆓 Free</span>}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={tierLimits.minRadiusM}
                    max={tierLimits.maxRadiusM}
                    step="5"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatDistance(tierLimits.minRadiusM)}</span>
                    <span>{formatDistance(tierLimits.maxRadiusM)}</span>
                  </div>
                  
                  <p className={cn(
                    "text-xs mt-2",
                    radius < 100 && "text-purple-700 dark:text-purple-300",
                    radius >= 100 && radius < 300 && "text-blue-700 dark:text-blue-300",
                    radius >= 300 && "text-green-700 dark:text-green-300"
                  )}>
                    {radius <= 25 && '🏢 High precision - Files unlock within room/building'}
                    {radius > 25 && radius <= 100 && '🏙️ High precision - Files unlock within city block'}
                    {radius > 100 && radius <= 300 && '🏛️ Medium precision - Files unlock within district'}
                    {radius > 300 && '🗺️ General area - Files unlock within neighborhood'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
