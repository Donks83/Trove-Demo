'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Eye, Download, Edit, Trash2, Clock, Globe, Lock, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import { formatDistance } from '@/lib/geo'
import { TIER_DISPLAY_NAMES, TIER_COLORS } from '@/lib/tiers'
import type { Drop } from '@/types'
import { cn } from '@/lib/utils'
import { EditDropModal } from '@/components/edit-drop-modal'

// Helper function to safely convert dates from API responses
function toDateObject(dateValue: any): Date {
  if (!dateValue) return new Date()
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue
  }
  
  // If it's a Firestore Timestamp with toDate method
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate()
  }
  
  // If it's a string or number, convert it
  return new Date(dateValue)
}

export default function DropsPage() {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<'all' | 'public' | 'private'>('all')
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null)

  const fetchUserDrops = useCallback(async () => {
    if (!user || !firebaseUser) return

    setLoading(true)
    try {
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch('/api/user/drops', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User drops response:', data)
        
        // Convert ISO date strings back to Date objects
        const dropsWithDates = (data.drops || []).map((drop: any) => ({
          ...drop,
          createdAt: new Date(drop.createdAt),
          updatedAt: new Date(drop.updatedAt),
          expiresAt: drop.expiresAt ? new Date(drop.expiresAt) : undefined,
        }))
        
        console.log(`✅ Loaded ${dropsWithDates.length} user drops`)
        setDrops(dropsWithDates)
      } else {
        console.error('Failed to fetch drops, status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch drops')
      }
    } catch (error) {
      console.error('Error fetching drops:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your drops',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user, firebaseUser, toast])

  useEffect(() => {
    if (user) {
      fetchUserDrops()
    }
  }, [user, fetchUserDrops])

  const handleDeleteDrop = async (dropId: string) => {
    if (!user || !firebaseUser || !confirm('Are you sure you want to delete this drop? This action cannot be undone.')) {
      return
    }

    try {
      const token = await firebaseUser.getIdToken()
      if (!token) throw new Error('No auth token')

      const response = await fetch(`/api/drops/${dropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete drop')
      }

      setDrops(drops.filter(drop => drop.id !== dropId))
      toast({
        title: 'Drop deleted',
        description: 'Your drop has been successfully deleted.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete drop',
        variant: 'destructive',
      })
    }
  }

  const filteredDrops = drops.filter(drop => {
    const matchesSearch = drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drop.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesScope = filterScope === 'all' || drop.scope === filterScope
    return matchesSearch && matchesScope
  })

  const stats = {
    total: drops.length,
    public: drops.filter(d => d.scope === 'public').length,
    private: drops.filter(d => d.scope === 'private').length,
    totalViews: drops.reduce((sum, d) => sum + (d.stats?.views || 0), 0),
    totalUnlocks: drops.reduce((sum, d) => sum + (d.stats?.unlocks || 0), 0),
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Drops</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your buried files and track their performance
          </p>
        </div>
        <Button onClick={() => router.push('/')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Drop
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Drops</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Public</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.public}</p>
            </div>
            <Globe className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Private</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.private}</p>
            </div>
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Unlocks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUnlocks}</p>
            </div>
            <Download className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search drops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterScope === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterScope('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filterScope === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterScope('public')}
          >
            Public ({stats.public})
          </Button>
          <Button
            variant={filterScope === 'private' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterScope('private')}
          >
            Private ({stats.private})
          </Button>
        </div>
      </div>

      {/* Drops Grid */}
      {filteredDrops.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {drops.length === 0 ? 'No drops yet' : 'No drops match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {drops.length === 0 
              ? 'Create your first drop by clicking the button above'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {drops.length === 0 && (
            <Button onClick={() => router.push('/')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Drop
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrops.map((drop) => (
            <div key={drop.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {drop.title}
                    </h3>
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      drop.tier === 'free' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                      drop.tier === 'premium' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                      drop.tier === 'paid' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    )}>
                      {drop.tier}
                    </div>
                  </div>
                  {drop.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {drop.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {drop.coords.lat.toFixed(4)}, {drop.coords.lng.toFixed(4)}
                  </span>
                  <span className="text-xs">
                    ({formatDistance(drop.geofenceRadiusM)})
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{drop.stats?.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{drop.stats?.unlocks || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {drop.scope === 'public' ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="text-xs text-gray-500 capitalize">{drop.scope}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    Created {toDateObject(drop.createdAt).toLocaleDateString()}
                  </span>
                  {drop.expiresAt && (
                    <span>
                      • Expires {toDateObject(drop.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingDrop(drop)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDrop(drop.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingDrop && firebaseUser && (
        <EditDropModal
          drop={editingDrop}
          isOpen={!!editingDrop}
          onClose={() => setEditingDrop(null)}
          onSuccess={() => {
            toast({
              title: 'Drop updated',
              description: 'Your drop has been successfully updated.',
            })
            fetchUserDrops()
          }}
          firebaseUser={firebaseUser}
          userTier={user?.tier || 'free'}
        />
      )}
    </div>
  )
}
