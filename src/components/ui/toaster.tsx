'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  const container = document.getElementById('toast-root')
  if (!container) {
    const toastRoot = document.createElement('div')
    toastRoot.id = 'toast-root'
    toastRoot.className = 'fixed bottom-4 right-4 z-toast pointer-events-none space-y-2'
    document.body.appendChild(toastRoot)
    return createPortal(<ToastList toasts={toasts} onRemove={removeToast} />, toastRoot)
  }

  return createPortal(<ToastList toasts={toasts} onRemove={removeToast} />, container)
}

function ToastList({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto w-80 rounded-lg border p-4 shadow-lg animate-slide-in',
            toast.variant === 'destructive'
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn(
                'font-medium',
                toast.variant === 'destructive'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-gray-900 dark:text-gray-100'
              )}>
                {toast.title}
              </h3>
              {toast.description && (
                <p className={cn(
                  'mt-1 text-sm',
                  toast.variant === 'destructive'
                    ? 'text-red-700 dark:text-red-200'
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className={cn(
                'ml-2 rounded p-1 hover:bg-opacity-20',
                toast.variant === 'destructive'
                  ? 'text-red-700 hover:bg-red-200 dark:text-red-200 dark:hover:bg-red-800'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return {
    toast: context.addToast,
  }
}

export function Toaster() {
  return null // Provider handles rendering
}
