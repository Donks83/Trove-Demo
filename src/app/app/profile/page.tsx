'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Camera, Mail, Crown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/components/ui/toaster'

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')

  if (!user) {
    router.push('/')
    return null
  }

  const handleSave = async () => {
    try {
      await updateUserProfile({ displayName })
      setEditing(false)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getTierIcon = () => {
    switch (user.tier) {
      case 'premium':
        return <Crown className="w-5 h-5 text-purple-500" />
      case 'business':
        return <Users className="w-5 h-5 text-blue-500" />
      default:
        return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierName = () => {
    switch (user.tier) {
      case 'premium':
        return 'Premium'
      case 'business':
        return 'Business'
      default:
        return 'Free Explorer'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {editing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0"
                    placeholder="Your display name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.displayName || 'Anonymous User'}
                  </h2>
                )}
                
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  {getTierIcon()}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getTierName()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>

              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditing(false)
                        setDisplayName(user.displayName || '')
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)} size="sm">
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">0</div>
            <div className="text-gray-600 dark:text-gray-400">Drops Created</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">0</div>
            <div className="text-gray-600 dark:text-gray-400">Drops Unlocked</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.createdAt ? new Date(user.createdAt.seconds * 1000).getFullYear() : new Date().getFullYear()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Member Since</div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {user.uid}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Created
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.createdAt 
                  ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                  : 'Unknown'
                }
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Updated
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user.updatedAt 
                  ? new Date(user.updatedAt.seconds * 1000).toLocaleDateString()
                  : 'Unknown'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
