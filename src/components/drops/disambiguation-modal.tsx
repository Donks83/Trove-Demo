'use client'

import { useState } from 'react'
import { Check, FileText, Calendar, MapPin, Users, Crown, Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatDistance } from '@/lib/geo'

interface DropOption {
  id: string
  title: string
  description?: string
  dropType: 'private' | 'public' | 'hunt'
  fileCount: number
  createdAt: string
  distance?: number
  ownerName: string
  stats: {
    views: number
    unlocks: number
  }
}

interface DisambiguationModalProps {
  isOpen: boolean
  onClose: () => void
  dropOptions: DropOption[]
  onSelectDrop: (dropId: string) => void
  loading?: boolean
}

export function DisambiguationModal({ 
  isOpen, 
  onClose, 
  dropOptions, 
  onSelectDrop,
  loading = false
}: DisambiguationModalProps) {
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null)

  const handleSelect = (dropId: string) => {
    setSelectedDropId(dropId)
  }

  const handleConfirm = () => {
    if (selectedDropId) {
      onSelectDrop(selectedDropId)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-blue-600" />
            Multiple Drops Found
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Found {dropOptions.length} drops with this passphrase. Select which one to unlock:
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {dropOptions.map((drop) => (
            <button
              key={drop.id}
              onClick={() => handleSelect(drop.id)}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                selectedDropId === drop.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                'relative'
              )}
            >
              {/* Selection indicator */}
              {selectedDropId === drop.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Drop type badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium flex items-center gap-1',
                  drop.dropType === 'hunt' && 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
                  drop.dropType === 'public' && 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                  drop.dropType === 'private' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                )}>
                  {drop.dropType === 'hunt' && <><Crown className="w-3 h-3" /> Treasure Hunt</>}
                  {drop.dropType === 'public' && <><Users className="w-3 h-3" /> Public</>}
                  {drop.dropType === 'private' && <><Lock className="w-3 h-3" /> Private</>}
                </div>
                
                {drop.distance !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatDistance(drop.distance)} away
                  </span>
                )}
              </div>

              {/* Title and description */}
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                {drop.title}
              </h3>
              {drop.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {drop.description}
                </p>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{drop.fileCount} {drop.fileCount === 1 ? 'file' : 'files'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(drop.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>By {drop.ownerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{drop.stats.unlocks} unlocks</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> In popular areas, use more unique passphrases to avoid collisions. 
            Personal phrases that only you and your recipients know work best!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDropId || loading}
            className="flex-1"
          >
            {loading ? 'Unlocking...' : 'Unlock Selected Drop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
