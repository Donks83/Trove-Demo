'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '@/lib/firebase'
import { signUpSchema, signInSchema, resetPasswordSchema } from '@/lib/validations'
import type { SignUpInput, SignInInput, ResetPasswordInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toaster'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  })

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSignIn = async (data: SignInInput) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      })
      onClose()
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpInput) => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      
      // Send email verification
      try {
        await sendEmailVerification(userCredential.user)
        toast({
          title: 'Welcome to Trove!',
          description: 'Please check your email to verify your account. You\'ll need to verify before creating drops.',
        })
      } catch (verifyError) {
        console.error('Error sending verification email:', verifyError)
        toast({
          title: 'Account created',
          description: 'Your account was created, but we couldn\'t send a verification email. You can resend it from your profile.',
        })
      }
      
      onClose()
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (data: ResetPasswordInput) => {
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, data.email)
      toast({
        title: 'Reset email sent',
        description: 'Check your email for password reset instructions.',
      })
      setMode('signin')
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderSignInForm = () => (
    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="signin-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="signin-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="pl-10"
            {...signInForm.register('email')}
          />
        </div>
        {signInForm.formState.errors.email && (
          <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="signin-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pl-10 pr-10"
            {...signInForm.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {signInForm.formState.errors.password && (
          <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => setMode('reset')}
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setMode('signup')}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </form>
  )

  const renderSignUpForm = () => (
    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="signup-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="signup-name"
            type="text"
            placeholder="Enter your name"
            autoComplete="name"
            className="pl-10"
            {...signUpForm.register('displayName')}
          />
        </div>
        {signUpForm.formState.errors.displayName && (
          <p className="text-sm text-red-600">{signUpForm.formState.errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="pl-10"
            {...signUpForm.register('email')}
          />
        </div>
        {signUpForm.formState.errors.email && (
          <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            autoComplete="new-password"
            className="pl-10 pr-10"
            {...signUpForm.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {signUpForm.formState.errors.password && (
          <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </form>
  )

  const renderResetForm = () => (
    <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="pl-10"
            {...resetForm.register('email')}
          />
        </div>
        {resetForm.formState.errors.email && (
          <p className="text-sm text-red-600">{resetForm.formState.errors.email.message}</p>
        )}
        <p className="text-sm text-gray-500">
          We'll send you a link to reset your password
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className="text-sm text-primary hover:underline"
        >
          Back to sign in
        </button>
      </div>
    </form>
  )

  const titles = {
    signin: 'Welcome back',
    signup: 'Create your account',
    reset: 'Reset your password',
  }

  const descriptions = {
    signin: 'Sign in to your Trove account',
    signup: 'Start sharing files with location',
    reset: 'Enter your email to reset your password',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {titles[mode]}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
            {descriptions[mode]}
          </DialogDescription>
        </DialogHeader>

        <div className="px-1">
          {mode === 'signin' && renderSignInForm()}
          {mode === 'signup' && renderSignUpForm()}
          {mode === 'reset' && renderResetForm()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
