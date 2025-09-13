'use client'

import { useState } from 'react'
import { Crown, Users, MapPin, Calendar, Trophy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { TreasureHunt, HuntParticipant } from '@/types'
import { cn } from '@/lib/utils'

interface HuntDashboardModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data for development - in production this would come from API
const demoHunts: TreasureHunt[] = [
  {
    id: 'office-hunt-2024',
    ownerId: 'current-user',
    title: '🏢 Office Adventure Challenge',
    description: 'A fun scavenger hunt around the office! Find hidden clues and solve puzzles.',
    difficulty: 'intermediate',
    status: 'active',
    maxParticipants: 10,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) as any,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as any,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) as any,
    updatedAt: new Date() as any,
    stats: {
      totalParticipants: 5,
      completedParticipants: 1,
      totalDrops: 2
    }
  },
  {
    id: 'london-exploration',
    ownerId: 'current-user',
    title: '🌆 London Historical Tour',
    description: 'Explore London\'s rich history through an interactive treasure hunt.',
    difficulty: 'beginner',
    status: 'draft',
    maxParticipants: 20,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) as any,
    updatedAt: new Date() as any,
    stats: {
      totalParticipants: 0,
      completedParticipants: 0,
      totalDrops: 0
    }
  }
]

const demoParticipants: HuntParticipant[] = [
  {
    id: 'participant-1',
    huntId: 'office-hunt-2024',
    userId: 'user-3',
    email: 'alice@company.com',
    displayName: 'Alice Johnson',
    status: 'joined',
    joinedAt: new Date(Date.now() - 20 * 60 * 60 * 1000) as any,
    progress: {
      dropsFound: 2,
      totalDrops: 2,
      lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000) as any
    }
  },
  {
    id: 'participant-2',
    huntId: 'office-hunt-2024',
    userId: 'user-4',
    email: 'bob@company.com',
    displayName: 'Bob Smith',
    status: 'joined',
    joinedAt: new Date(Date.now() - 18 * 60 * 60 * 1000) as any,
    progress: {
      dropsFound: 1,
      totalDrops: 2,
      lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000) as any
    }
  }
]

function HuntCard({ hunt }: { hunt: TreasureHunt }) {
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null)
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
    expert: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    master: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{hunt.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{hunt.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[hunt.status])}>
            {hunt.status}
          </div>
          <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', difficultyColors[hunt.difficulty])}>
            {hunt.difficulty}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{hunt.stats.totalParticipants}</div>
          <div className="text-xs text-gray-500">Participants</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{hunt.stats.completedParticipants}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{hunt.stats.totalDrops}</div>
          <div className="text-xs text-gray-500">Locations</div>
        </div>
      </div>
      
      {hunt.startDate && hunt.endDate && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {hunt.startDate?.toDate().toLocaleDateString()} - {hunt.endDate?.toDate().toLocaleDateString()}
          </span>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setSelectedHunt(hunt)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Manage Hunt
        </Button>
      </div>
      
      {/* Hunt Details Modal */}
      {selectedHunt && (
        <Dialog open={!!selectedHunt} onOpenChange={() => setSelectedHunt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                {selectedHunt.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedHunt.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Hunt Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[selectedHunt.status])}>
                        {selectedHunt.status}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', difficultyColors[selectedHunt.difficulty])}>
                        {selectedHunt.difficulty}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>{selectedHunt.stats.totalParticipants}/{selectedHunt.maxParticipants || '∞'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Locations:</span>
                      <span>{selectedHunt.stats.totalDrops}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Participants</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {demoParticipants
                      .filter(p => p.huntId === selectedHunt.id)
                      .map(participant => (
                        <div key={participant.id} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{participant.displayName}</div>
                            <div className="text-gray-500">{participant.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-purple-600 font-medium">
                              {participant.progress.dropsFound}/{participant.progress.totalDrops}
                            </div>
                            <div className="text-gray-500">
                              {participant.status === 'joined' ? 'Active' : 'Invited'}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export function HuntDashboardModal({ isOpen, onClose }: HuntDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-purple-600" />
            Treasure Hunt Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('created')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'created'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              My Hunts ({demoHunts.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={cn(
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'joined'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Joined Hunts (1)
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'created' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Created Hunts</h3>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Create New Hunt
                </Button>
              </div>
              
              <div className="grid gap-4">
                {demoHunts.map(hunt => (
                  <HuntCard key={hunt.id} hunt={hunt} />
                ))}
              </div>
              
              {demoHunts.length === 0 && (
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No treasure hunts created yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first treasure hunt to start the adventure!
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Create Your First Hunt
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'joined' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hunts You've Joined</h3>
              
              {/* Demo joined hunt */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">🏢 Office Adventure Challenge</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by Team Building Committee</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Active
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">2/2</div>
                    <div className="text-xs text-gray-500">Locations Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">100%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">#1</div>
                    <div className="text-xs text-gray-500">Ranking</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Trophy className="w-4 h-4 mr-2" />
                    Continue Hunt
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No other active hunts. Wait for more invitations!
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
