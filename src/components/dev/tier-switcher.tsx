'use client'

import { useState, useEffect } from 'react'
import { Crown, CreditCard, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'
import type { UserTier } from '@/types'

/**
 * DEV ONLY: Quick tier switcher for testing
 * Remove this component in production or gate behind admin check
 */
export function DevTierSwitcher() {
  const { user, updateUserProfile } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  // Check if should show on client-side only (prevents hydration mismatch)
  useEffect(() => {
    setShouldShow(process.env.NODE_ENV === 'development')
  }, [])

  if (!shouldShow || !user) {
    return null
  }

  const handleTierChange = async (newTier: UserTier) => {
    setUpdating(true)
    try {
      await updateUserProfile({ tier: newTier })
      // Force page reload to update UI
      window.location.reload()
    } catch (error) {
      console.error('Failed to update tier:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-amber-100 dark:bg-amber-900 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4 shadow-xl max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-bold text-amber-900 dark:text-amber-100">
          🛠️ DEV: Tier Switcher
        </h3>
      </div>
      
      <div className="text-xs text-amber-700 dark:text-amber-300 mb-3">
        Current tier: <strong className="uppercase">{user.tier}</strong>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleTierChange('free')}
          disabled={updating || user.tier === 'free'}
          className={cn(
            'w-full p-3 rounded-lg border-2 transition-all text-left',
            user.tier === 'free'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 hover:border-green-400 bg-white dark:bg-gray-800'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🆓</span>
              <div>
                <div className="font-medium text-sm">Free Explorer</div>
                <div className="text-xs text-gray-500">300-500m radius</div>
              </div>
            </div>
            {user.tier === 'free' && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </button>

        <button
          onClick={() => handleTierChange('premium')}
          disabled={updating || user.tier === 'premium'}
          className={cn(
            'w-full p-3 rounded-lg border-2 transition-all text-left',
            user.tier === 'premium'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 hover:border-purple-400 bg-white dark:bg-gray-800'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Premium</div>
                <div className="text-xs text-gray-500">10-500m full range</div>
              </div>
            </div>
            {user.tier === 'premium' && <Check className="w-4 h-4 text-purple-600" />}
          </div>
        </button>

        <button
          onClick={() => handleTierChange('paid')}
          disabled={updating || user.tier === 'paid'}
          className={cn(
            'w-full p-3 rounded-lg border-2 transition-all text-left',
            user.tier === 'paid'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-blue-400 bg-white dark:bg-gray-800'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Paid Tier</div>
                <div className="text-xs text-gray-500">100-500m precision</div>
              </div>
            </div>
            {user.tier === 'paid' && <Check className="w-4 h-4 text-blue-600" />}
          </div>
        </button>
      </div>

      <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
        ⚠️ Dev only - Will reload page after change
      </div>
    </div>
  )
}
