import Link from 'next/link'
import { MapPin, Shield, Smartphone, Globe, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-16 px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Trove
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload. Drop. Unlock. Give files a place, not just a path.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Trove revolutionizes file sharing by anchoring digital content to real-world locations. 
            Instead of forgettable links, we create memorable experiences where files are tied to 
            places that matter. Whether it's a family photo at your favorite vacation spot or 
            confidential documents secured to your office location, Trove makes file sharing 
            intuitive, secure, and unforgettable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Location-Based
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Files are anchored to specific coordinates, creating a meaningful connection between content and place.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Secure Access
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Protected by secret phrases and geofencing, with optional physical presence verification.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Mobile Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Progressive web app that works seamlessly across desktop and mobile devices.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Global Reach
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create drops anywhere in the world and share them with anyone, anywhere.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Team Friendly
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Business features include team management, analytics, and custom branding.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Built with modern web technologies for optimal performance and reliability.
            </p>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Personal Use
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Memory preservation at meaningful locations</li>
                <li>• Family photo sharing tied to vacation spots</li>
                <li>• Scavenger hunts and treasure hunts</li>
                <li>• Time capsules for future discovery</li>
                <li>• Event documentation and sharing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Business Use
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Construction site documentation</li>
                <li>• Field service file delivery</li>
                <li>• Real estate property information</li>
                <li>• Event and conference materials</li>
                <li>• Secure client file exchange</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Trove is built on a foundation of cutting-edge web technologies to ensure 
            security, performance, and reliability.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900 dark:text-white">Next.js 14</div>
              <div className="text-gray-500">Frontend</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900 dark:text-white">Firebase</div>
              <div className="text-gray-500">Backend</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900 dark:text-white">TypeScript</div>
              <div className="text-gray-500">Language</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="font-medium text-gray-900 dark:text-white">Mapbox</div>
              <div className="text-gray-500">Maps</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Join thousands of users who are already using Trove to share files in a whole new way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                Explore the Map
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/app/drops">
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
