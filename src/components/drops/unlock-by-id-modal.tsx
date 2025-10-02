'use client'

import { useState } from 'react'
import { Lock, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

interface UnlockByIdModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: any) => void
}

export function UnlockByIdModal({ isOpen, onClose, onSuccess }: UnlockByIdModalProps) {
  const { user, firebaseUser } = useAuth()
  const [dropId, setDropId] = useState('')
  const [secret, setSecret] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  const handleUnlock = async () => {
    if (!dropId.trim()) {
      toast.error('Drop ID required', {
        description: 'Please enter the Drop ID you want to unlock',
      })
      return
    }

    if (!secret.trim()) {
      toast.error('Secret required', {
        description: 'Please enter the secret phrase',
      })
      return
    }

    if (!user || !firebaseUser) {
      toast.error('Sign in required', {
        description: 'Please sign in to unlock drops',
      })
      return
    }

    setUnlocking(true)
    try {
      const token = await firebaseUser.getIdToken()

      const response = await fetch(`/api/drops/${dropId.trim()}/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          secret: secret.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unlock drop')
      }

      if (result.success) {
        toast.success('Drop unlocked!', {
          description: 'Your files are ready for download',
        })
        onSuccess(result)
        setDropId('')
        setSecret('')
        onClose()
      }
    } catch (error: any) {
      console.error('Unlock error:', error)
      toast.error('Failed to unlock', {
        description: error.message || 'Please check your Drop ID and secret phrase',
      })
    } finally {
      setUnlocking(false)
    }
  }

  const handleClose = () => {
    setDropId('')
    setSecret('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-6 h-6" />
            Unlock by Drop ID
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter the Drop ID and secret phrase to unlock files directly
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">What's a Drop ID?</p>
                <p>Drop IDs are unique identifiers (like "abc-123-xyz") shown when someone creates a drop. Ask the creator to share both the Drop ID and secret phrase with you.</p>
              </div>
            </div>
          </div>

          {/* Drop ID input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop ID *
            </label>
            <Input
              type="text"
              placeholder="e.g., abc-123-xyz"
              value={dropId}
              onChange={(e) => setDropId(e.target.value)}
              autoComplete="off"
              data-lpignore="true"
            />
            <p className="text-xs text-gray-500">
              The unique identifier for the drop
            </p>
          </div>

          {/* Secret phrase input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secret Phrase *
            </label>
            <Input
              type="password"
              placeholder="Enter secret phrase"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="off"
              data-lpignore="true"
            />
            <p className="text-xs text-gray-500">
              The secret phrase provided by the creator
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={unlocking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!dropId.trim() || !secret.trim() || unlocking}
              className="flex-1"
            >
              {unlocking ? 'Unlocking...' : 'Unlock Drop'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
