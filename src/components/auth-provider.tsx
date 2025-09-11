'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User, UserTier } from '@/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed - Firebase user:', firebaseUser ? 'Present' : 'Null')
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Get or create user document
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            setUser(userDoc.data() as User)
          } else {
            // Create new user document
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 
                          firebaseUser.email?.split('@')[0] || 
                          `Explorer${firebaseUser.uid.slice(-4)}`,
              ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
              tier: 'free' as UserTier,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
            setUser(newUser)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!firebaseUser || !user) return

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: Timestamp.now(),
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true })
    setUser(updatedUser)
  }

  const value = {
    user,
    firebaseUser,
    loading,
    signOut,
    updateUserProfile,
  }

  // Debug logging
  useEffect(() => {
    console.log('Auth context updated:', {
      hasUser: !!user,
      hasFirebaseUser: !!firebaseUser,
      loading,
      userUid: user?.uid,
      firebaseUserUid: firebaseUser?.uid
    })
  }, [user, firebaseUser, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
