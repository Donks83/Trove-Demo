'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapView } from '@/components/map-view'
import { UnlockDropModal } from '@/components/drops/unlock-drop-modal'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'
import type { Drop } from '@/types'

export default function DropPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const dropId = params.dropId as string

  const [drop, setDrop] = useState<Drop | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUnlockModal, setShowUnlockModal] = useState(false)

  useEffect(() => {
    const fetchDrop = async () => {
      try {
        const response = await fetch(`/api/drops/${dropId}`)
        
        if (!response.ok) {
          throw new Error('Drop not found')
        }

        const data = await response.json()
        setDrop(data.drop)
        
        // Auto-open unlock modal after a brief delay
        setTimeout(() => {
          setShowUnlockModal(true)
        }, 500)
        
      } catch (error) {
        console.error('Error fetching drop:', error)
        toast({
          title: 'Drop not found',
          description: 'This drop may have been deleted or the link is invalid.',
          variant: 'destructive',
        })
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/app')
        }, 2000)
      } finally {
        setLoading(false)
      }
    }

    if (dropId) {
      fetchDrop()
    }
  }, [dropId, router, toast])

  useEffect(() => {
    // Navigate map to drop location when drop loads
    if (drop?.coords) {
      const event = new CustomEvent('navigateToLocation', {
        detail: {
          lat: drop.coords.lat,
          lng: drop.coords.lng,
          zoom: 16
        }
      })
      window.dispatchEvent(event)
    }
  }, [drop])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading drop...</p>
        </div>
      </div>
    )
  }

  if (!drop) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Drop not found</p>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      <MapView className="w-full h-full" />
      
      <UnlockDropModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false)
          router.push('/app')
        }}
        drop={drop}
        dropId={dropId}
        prefilledLocation={drop.coords ? {
          lat: drop.coords.lat,
          lng: drop.coords.lng
        } : undefined}
      />
      
      {/* Info banner at top */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] pointer-events-none">
        <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg pointer-events-auto">
          <p className="font-medium">📍 {drop.title}</p>
          <p className="text-sm text-blue-100">
            {drop.dropType === 'hunt' ? '🏴‍☠️ Treasure Hunt Drop' : 
             drop.dropType === 'public' ? '🌍 Public Drop' : 
             '🔒 Private Drop'}
          </p>
        </div>
      </div>
    </div>
  )
}
