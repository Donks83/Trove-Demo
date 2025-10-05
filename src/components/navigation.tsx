'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, Moon, Sun, Menu, X, Crown, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'
import { HuntDashboardModal } from '@/components/hunts/hunt-dashboard-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showHuntDashboard, setShowHuntDashboard] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Email Verification Banner */}
      {user && firebaseUser && !firebaseUser.emailVerified && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Please verify your email to create drops.
            </span>
            <button
              onClick={() => window.location.href = '/app/profile'}
              className="underline hover:no-underline font-medium ml-2"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}
      
      <nav className={cn('bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
              >
                Trove
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
              >
                Map
              </Button>
              
              {user && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/app/drops')}
                  >
                    My Drops
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setShowHuntDashboard(true)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Treasure Hunts
                  </Button>
                  
                  {user.isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/admin')}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block">{user.displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push('/app/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/app/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => openAuthModal('signin')}>
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal('signup')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/')
                  setMobileMenuOpen(false)
                }}
              >
                Map
              </Button>
              
              {user && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/app/drops')
                      setMobileMenuOpen(false)
                    }}
                  >
                    My Drops
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      setShowHuntDashboard(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Treasure Hunts
                  </Button>
                  
                  {user.isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => {
                        router.push('/admin')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </Button>

              {user ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                    {user.displayName}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/app/profile')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/app/settings')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      openAuthModal('signin')
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      openAuthModal('signup')
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
      
      <HuntDashboardModal
        isOpen={showHuntDashboard}
        onClose={() => setShowHuntDashboard(false)}
      />
    </>
  )
}
