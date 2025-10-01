'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Share2, X, QrCode, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ShareDropSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  dropId: string
  dropTitle: string
  dropType: 'private' | 'public' | 'hunt'
}

export function ShareDropSuccessModal({ 
  isOpen, 
  onClose, 
  dropId, 
  dropTitle,
  dropType 
}: ShareDropSuccessModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [canShare, setCanShare] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareLink = `${baseUrl}/drop/${dropId}`

  // Check if Web Share API is available (client-side only)
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  const copyToClipboard = async (text: string, type: 'link' | 'id') => {
    try {
      await navigator.clipboard.writeText(text)
      
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
      }
      
      toast.success('Copied!', {
        description: `${type === 'link' ? 'Link' : 'Drop ID'} copied to clipboard`,
      })
    } catch (error) {
      toast.error('Copy failed', {
        description: 'Please copy manually',
      })
    }
  }

  const shareViaWebShare = async () => {
    if (typeof navigator === 'undefined' || !('share' in navigator)) {
      toast.error('Sharing not supported', {
        description: 'Your browser doesn\'t support Web Share API',
      })
      return
    }

    try {
      await navigator.share({
        title: `${dropTitle} - Trove Drop`,
        text: `Check out this ${dropType} drop on Trove: ${dropTitle}`,
        url: shareLink,
      })
      toast.success('Shared successfully!')
    } catch (error) {
      // User cancelled or error occurred
      console.error('Share failed:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-6 h-6 text-green-600" />
            Drop Created Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success message */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              "{dropTitle}" is ready!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this link to let others discover your drop
            </p>
          </div>

          {/* Shareable Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-sm truncate">
                {shareLink}
              </div>
              <Button
                onClick={() => copyToClipboard(shareLink, 'link')}
                size="sm"
                variant="outline"
                className="flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              This link pre-fills the location and opens the unlock modal directly
            </p>
          </div>

          {/* Drop ID (for advanced users) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop ID
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-xs truncate">
                {dropId}
              </div>
              <Button
                onClick={() => copyToClipboard(dropId, 'id')}
                size="sm"
                variant="outline"
                className="flex-shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            {canShare && (
              <Button
                onClick={shareViaWebShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
            <Button
              onClick={() => window.open(shareLink, '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Link
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              📱 How to share:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Send the link via text, email, or messaging apps</li>
              <li>• Recipients click the link to view the drop location</li>
              <li>• They'll need the secret phrase you set to unlock files</li>
              {dropType === 'private' && (
                <li>• <strong>Private drop:</strong> Not visible on the public map</li>
              )}
              {dropType === 'public' && (
                <li>• <strong>Public drop:</strong> Also discoverable on the map</li>
              )}
            </ul>
          </div>

          {/* Close button */}
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
