'use client'

import { useState } from 'react'
import { AlertTriangle, Flag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  dropId: string
  dropTitle: string
}

const REPORT_CATEGORIES = [
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Sexual, violent, or disturbing material',
    icon: '🔞',
  },
  {
    value: 'harassment',
    label: 'Harassment or Hate Speech',
    description: 'Bullying, threats, or discriminatory content',
    icon: '⚠️',
  },
  {
    value: 'spam',
    label: 'Spam or Misleading',
    description: 'Unwanted advertising or deceptive content',
    icon: '📧',
  },
  {
    value: 'illegal',
    label: 'Illegal Content',
    description: 'Content that violates laws',
    icon: '🚫',
  },
  {
    value: 'copyright',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    icon: '©️',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that violates our policies',
    icon: '❓',
  },
] as const

export function ReportModal({ isOpen, onClose, dropId, dropTitle }: ReportModalProps) {
  const { user, firebaseUser } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedCategory || !reason.trim()) {
      toast.error('Please select a category and provide a reason')
      return
    }

    if (!user || !firebaseUser) {
      toast.error('You must be signed in to submit a report')
      return
    }

    setSubmitting(true)
    try {
      const token = await firebaseUser.getIdToken()

      const response = await fetch(`/api/drops/${dropId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          reason: reason.trim(),
          details: details.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report')
      }

      toast.success('Report submitted', {
        description: 'Thank you for helping keep Trove safe. We\'ll review this report shortly.',
      })

      // Reset and close
      setSelectedCategory('')
      setReason('')
      setDetails('')
      onClose()

    } catch (error: any) {
      console.error('Report error:', error)
      toast.error('Failed to submit report', {
        description: error.message || 'Please try again later',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedCategory('')
    setReason('')
    setDetails('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flag className="w-6 h-6 text-red-600" />
            Report Content
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Report "{dropTitle}" for violating our community guidelines
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Category selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              What's wrong with this content? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    selectedCategory === category.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Please explain why you're reporting this *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what you found inappropriate or concerning..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Required</span>
              <span>{reason.length}/500</span>
            </div>
          </div>

          {/* Additional details (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any other information that might help us review this report..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="text-right text-xs text-gray-500">
              {details.length}/1000
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• False reports may result in account suspension</li>
                  <li>• Reports are reviewed by our moderation team</li>
                  <li>• You'll receive an email confirmation</li>
                  <li>• Reporter identity is kept confidential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCategory || !reason.trim() || submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
