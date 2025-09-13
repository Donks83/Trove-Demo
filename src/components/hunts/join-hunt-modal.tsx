'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Users, Crown, QrCode, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import type { JoinHuntByCodeRequest, JoinHuntByCodeResponse } from '@/types'

interface JoinHuntModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

export function JoinHuntModal({ isOpen, onClose, initialCode = '' }: JoinHuntModalProps) {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [huntCode, setHuntCode] = useState(initialCode)
  const [joining, setJoining] = useState(false)

  const handleJoinHunt = async () => {
    if (!huntCode.trim()) {
      toast({
        title: 'Hunt code required',
        description: 'Please enter a valid hunt code.',
        variant: 'destructive',
      })
      return
    }

    if (!user || !firebaseUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join treasure hunts.',
        variant: 'destructive',
      })
      return
    }

    setJoining(true)
    try {
      // Get auth token
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      // Call the join hunt API
      const response = await fetch('/api/hunts/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          huntCode: huntCode.trim().toUpperCase()
        } as JoinHuntByCodeRequest),
      })

      const result: JoinHuntByCodeResponse = await response.json()

      if (result.success) {
        toast({
          title: 'Hunt joined! 🏴‍☠️',
          description: result.message || 'You can now see proximity hints for this treasure hunt!',
        })
        
        // Close modal and clear form
        onClose()
        setHuntCode('')
        
        // Optionally refresh the map or navigate to hunt
        // You could emit an event here to refresh the map view
        
      } else {
        throw new Error(result.error || 'Failed to join hunt')
      }

    } catch (error: any) {
      console.error('Join hunt error:', error)
      
      let errorMessage = 'Failed to join hunt. Please check the code and try again.'
      
      if (error.message) {
        if (error.message.includes('Hunt not found')) {
          errorMessage = 'Hunt code not found. Please check the code is correct.'
        } else if (error.message.includes('Hunt expired')) {
          errorMessage = 'This treasure hunt has expired.'
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'Please sign in to join hunts.'
        } else if (error.message.includes('Invalid hunt code')) {
          errorMessage = 'Invalid hunt code format. Codes should be like "HUNT-ABC123-XY45".'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: 'Failed to join hunt',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinHunt()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleClose = () => {
    setHuntCode('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            Join Treasure Hunt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Box */}
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-900 dark:text-purple-100">
                  About Treasure Hunts
                </p>
                <p className="text-purple-700 dark:text-purple-300 mt-1">
                  Enter a hunt code to join and start receiving proximity hints when you're near hidden treasure!
                </p>
              </div>
            </div>
          </div>

          {/* Hunt Code Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hunt Code
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g., HUNT-ABC123-XY45"
                value={huntCode}
                onChange={(e) => setHuntCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                data-lpignore="true"
                className="font-mono text-center tracking-wider"
              />
              <QrCode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ask the hunt creator for the hunt code or scan their QR code
            </p>
          </div>

          {/* Examples */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hunt Code Format:
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div className="font-mono bg-white dark:bg-gray-700 rounded px-2 py-1">
                HUNT-ABC123-XY45
              </div>
              <p>Codes always start with "HUNT-" followed by unique identifiers</p>
            </div>
          </div>

          {/* Warning for signed out users */}
          {!user && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You'll need to sign in to join treasure hunts
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinHunt}
              disabled={joining || !huntCode.trim() || !user}
              className="flex-1"
            >
              {joining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Join Hunt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
