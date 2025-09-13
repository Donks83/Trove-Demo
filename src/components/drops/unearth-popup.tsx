'use client'

import { useState } from 'react'
import { MapPin, Search, X, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  if (!isVisible || !location) return null

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
      const response = await fetch('/api/drops/unearth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          coords: location,
          secret: secret.trim(),
        }),
      })

      const result: UnlockDropResponse = await response.json()

      if (!response.ok) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnearth()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
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
                  data-lpignore="true"
                  spellCheck="false"
                  className="w-full pr-10"
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
  )
}
