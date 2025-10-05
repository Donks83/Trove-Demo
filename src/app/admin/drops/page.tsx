'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Shield, Package, Search, Trash2, Eye, MapPin, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import Link from 'next/link'

interface Drop {
  id: string
  title: string
  ownerId: string
  ownerEmail?: string
  dropType: 'private' | 'public' | 'hunt'
  scope: 'private' | 'public'
  coords: { lat: number; lng: number }
  geofenceRadiusM: number
  stats: { views: number; unlocks: number }
  createdAt: any
  files?: any[]
}

export default function AdminDropsPage() {
  const { user, firebaseUser } = useAuth()
  const router = useRouter()
  const [drops, setDrops] = useState<Drop[]>([])
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingDrop, setDeletingDrop] = useState(false)

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/')
      return
    }
    loadDrops()
  }, [user, router])

  useEffect(() => {
    // Filter drops based on search query
    if (!searchQuery) {
      setFilteredDrops(drops)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredDrops(
        drops.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.ownerEmail?.toLowerCase().includes(query) ||
            d.id.includes(query)
        )
      )
    }
  }, [searchQuery, drops])

  const loadDrops = useCallback(async () => {
    try {
      setLoading(true)
      const token = await firebaseUser?.getIdToken()
      
      const response = await fetch('/api/admin/drops', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load drops')
      }

      const data = await response.json()
      setDrops(data.drops || [])
      setFilteredDrops(data.drops || [])
    } catch (error) {
      console.error('Error loading drops:', error)
      toast.error('Failed to load drops')
    } finally {
      setLoading(false)
    }
  }, [firebaseUser])

  const deleteDrop = async () => {
    if (!selectedDrop) return

    try {
      setDeletingDrop(true)
      const token = await firebaseUser?.getIdToken()
      
      const response = await fetch(`/api/admin/drops/${selectedDrop.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete drop')
      }

      toast.success('Drop deleted successfully')
      setShowDeleteDialog(false)
      setSelectedDrop(null)
      await loadDrops()
    } catch (error) {
      console.error('Error deleting drop:', error)
      toast.error('Failed to delete drop')
    } finally {
      setDeletingDrop(false)
    }
  }

  const getDropTypeBadge = (dropType: string) => {
    switch (dropType) {
      case 'hunt':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'public':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'private':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Drops Management
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search drops by title, owner, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Drops Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading drops...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Drop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDrops.map((drop) => (
                    <tr key={drop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {drop.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {drop.files?.length || 0} files
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {drop.ownerEmail || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDropTypeBadge(
                          drop.dropType
                        )}`}>
                          {drop.dropType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{drop.stats.views} views</div>
                          <div className="text-gray-500 dark:text-gray-400">{drop.stats.unlocks} unlocks</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {drop.coords.lat.toFixed(4)}, {drop.coords.lng.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {drop.geofenceRadiusM}m radius
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/?lat=${drop.coords.lat}&lng=${drop.coords.lng}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm">
                              <MapPin className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDrop(drop)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDrops.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No drops found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Drop
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete drop <strong>{selectedDrop?.title}</strong>?
              This will also delete all associated files and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedDrop(null)
              }}
              disabled={deletingDrop}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteDrop}
              disabled={deletingDrop}
            >
              {deletingDrop ? 'Deleting...' : 'Delete Drop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
