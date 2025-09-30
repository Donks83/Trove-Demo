'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from 'next-themes'

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          title: 'text-gray-900 dark:text-gray-100',
          description: 'text-gray-600 dark:text-gray-400',
          actionButton: 'bg-blue-500 text-white',
          cancelButton: 'bg-gray-200 dark:bg-gray-700',
          error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        },
      }}
      richColors
    />
  )
}
