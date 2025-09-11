import Link from 'next/link'
import { MapPin, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Drop Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This location seems to be uncharted territory. The drop you're looking for doesn't exist or may have expired.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full flex items-center justify-center gap-2">
            <Link href="/">
              <MapPin className="w-4 h-4" />
              Explore the Map
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full flex items-center justify-center gap-2">
            <Link href="/app/drops">
              <Search className="w-4 h-4" />
              View My Drops
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lost? Try searching for public drops on the map or create your own.
          </p>
        </div>
      </div>
    </div>
  )
}
