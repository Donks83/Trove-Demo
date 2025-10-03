# Email Verification Implementation Guide

## Overview

Firebase Authentication provides built-in email verification. We need to:
1. Send verification email after signup
2. Check `user.emailVerified` before allowing certain actions
3. Add UI to prompt unverified users
4. Optionally block drop creation until verified

## Step 1: Send Verification Email on Signup

Update your signup/auth code to send verification email automatically:

### File: `src/components/auth-provider.tsx` (or wherever signup happens)

```typescript
import { sendEmailVerification } from 'firebase/auth'

// After successful signup:
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // ✅ Send verification email immediately
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + '/verify-email-success', // Redirect URL after verification
      handleCodeInApp: false, // Opens in email client
    })
    
    toast.success('Account created!', {
      description: 'Please check your email to verify your account.',
    })
    
    return userCredential.user
  } catch (error) {
    // Handle error
    throw error
  }
}
```

## Step 2: Check Email Verification Status

### Option A: Soft Prompt (Recommended for Launch)

Show a banner to unverified users but don't block them:

```typescript
// src/components/email-verification-banner.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { sendEmailVerification } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { X, Mail, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function EmailVerificationBanner() {
  const { firebaseUser } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  // Don't show if user is verified or banner is dismissed
  if (!firebaseUser || firebaseUser.emailVerified || dismissed) {
    return null
  }

  const resendVerification = async () => {
    if (!firebaseUser) return
    
    setSending(true)
    try {
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin + '/verify-email-success',
      })
      
      toast.success('Verification email sent!', {
        description: 'Check your inbox and spam folder.',
      })
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests', {
          description: 'Please wait a few minutes before requesting another email.',
        })
      } else {
        toast.error('Failed to send email', {
          description: error.message,
        })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Please verify your email address
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Check your inbox for a verification link. Didn't receive it?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resendVerification}
              disabled={sending}
              className="border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              <Mail className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Resend Email'}
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

Then add it to your main layout:

```typescript
// src/app/layout.tsx or src/components/map-view.tsx
import { EmailVerificationBanner } from '@/components/email-verification-banner'

// Add above your main content:
<EmailVerificationBanner />
```

### Option B: Hard Block (Stricter)

Block drop creation until email is verified:

```typescript
// src/components/drops/create-drop-modal.tsx
// At the top of onSubmit function:

const onSubmit = async (data: CreateDropInput) => {
  // ✅ Block unverified users
  if (firebaseUser && !firebaseUser.emailVerified) {
    sonnerToast.error('Email verification required', {
      description: 'Please verify your email before creating drops.',
      action: {
        label: 'Resend Email',
        onClick: async () => {
          await sendEmailVerification(firebaseUser)
          sonnerToast.success('Verification email sent!')
        },
      },
    })
    return
  }

  // Rest of the function...
}
```

## Step 3: Refresh User to Check Verification

Users need to refresh their token after verifying:

```typescript
// src/components/auth-provider.tsx

import { onAuthStateChanged, reload } from 'firebase/auth'

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Reload user to get latest emailVerified status
      await reload(firebaseUser)
      
      setFirebaseUser(firebaseUser)
      
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) {
        setUser(userDoc.data() as User)
      }
    } else {
      setFirebaseUser(null)
      setUser(null)
    }
    setLoading(false)
  })

  return unsubscribe
}, [])
```

## Step 4: Create Success Page (Optional)

### File: `src/app/verify-email-success/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { reload } from 'firebase/auth'
import { Check } from 'lucide-react'

export default function VerifyEmailSuccessPage() {
  const { firebaseUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const refreshAndRedirect = async () => {
      if (firebaseUser) {
        // Reload user to get latest verification status
        await reload(firebaseUser)
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    refreshAndRedirect()
  }, [firebaseUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Email Verified!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your email has been successfully verified. You can now access all features.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting you to the app...
        </p>
      </div>
    </div>
  )
}
```

## Step 5: Add to Firebase Console (Required!)

1. Go to Firebase Console → Authentication → Templates
2. Enable "Email verification" template
3. Customize the email template (optional)
4. Make sure your authorized domains include your production domain

## Implementation Checklist

- [ ] Add `sendEmailVerification()` to signup flow
- [ ] Create `EmailVerificationBanner` component
- [ ] Add banner to main layout
- [ ] Add `reload()` to auth state listener
- [ ] (Optional) Create `/verify-email-success` page
- [ ] (Optional) Block drop creation for unverified users
- [ ] Enable email verification in Firebase Console
- [ ] Test with a real email account

## Recommended Approach

**For initial launch:**
1. ✅ Send verification email on signup
2. ✅ Show banner to unverified users
3. ✅ Allow them to use the app (soft prompt)
4. ❌ Don't block features yet

**After gathering feedback:**
1. Consider blocking drop creation for unverified users
2. Add more verification prompts before key actions
3. Potentially add email verification requirement for premium features

## Testing

```bash
# 1. Create a new account
# 2. Check your email for verification link
# 3. Click the link
# 4. Return to app and refresh
# 5. Banner should disappear
# 6. emailVerified should be true
```

## Security Notes

- **Rate Limiting**: Firebase automatically rate-limits verification email sends (1 per hour per account)
- **Don't trust client-side checks alone**: Always verify `emailVerified` on the backend for critical operations
- **Consider blocking:** Free tier users from creating drops until verified (reduces spam)

## Backend Verification (Important!)

Add this check to your drop creation API:

```typescript
// src/app/api/drops/route.ts

export async function POST(request: NextRequest) {
  const user = await verifyAuthToken(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ Check email verification on backend
  if (!user.email_verified) {
    return NextResponse.json({ 
      error: 'Email verification required',
      message: 'Please verify your email before creating drops.'
    }, { status: 403 })
  }

  // Rest of the handler...
}
```

The `verifyAuthToken` function should return the decoded token which includes `email_verified` field.

---

**Start with the soft banner approach, then add stricter checks based on spam/abuse patterns!**
