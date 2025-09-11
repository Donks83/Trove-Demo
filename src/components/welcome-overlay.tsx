'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Upload, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WELCOME_MESSAGES = [
  'Upload. Drop. Unlock. Give files a place, not just a path.',
  'Pin a file to a place. Unlock it with a phrase.',
  'Drop it on the map. Only the right place + phrase gets in.',
  'Memory meets security. Location-based file sharing.',
]

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    // Show overlay on first visit
    const hasSeenWelcome = localStorage.getItem('trove-welcome-seen')
    if (!hasSeenWelcome) {
      setIsVisible(true)
    }

    // Rotate messages
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % WELCOME_MESSAGES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('trove-welcome-seen', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Trove
          </h1>

          <div className="h-16 flex items-center justify-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 transition-opacity duration-500">
              {WELCOME_MESSAGES[currentMessage]}
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Upload</p>
                <p className="text-gray-500 dark:text-gray-400">Drop files anywhere</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Drop</p>
                <p className="text-gray-500 dark:text-gray-400">Pin to a location</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">Unlock</p>
                <p className="text-gray-500 dark:text-gray-400">Find with phrase</p>
              </div>
            </div>

            <Button onClick={handleDismiss} className="w-full" size="lg">
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
