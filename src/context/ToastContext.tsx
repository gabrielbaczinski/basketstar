import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'info' | 'warning' | 'error'
interface Toast { id: string; type: ToastType; message: string }

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  const iconFor = (t: ToastType) => {
    switch (t) {
      case 'success': return <CheckCircle2 size={16} className="text-sys-green shrink-0" />
      case 'warning': return <AlertTriangle size={16} className="text-sys-orange shrink-0" />
      case 'error': return <XCircle size={16} className="text-sys-red shrink-0" />
      default: return <Info size={16} className="text-tint-500 shrink-0" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-start gap-2.5 ios-glass-heavy rounded-ios-md px-3.5 py-3 min-w-[280px] animate-fade-up"
            style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06)' }}
          >
            <div className="mt-0.5">{iconFor(t.type)}</div>
            <p className="text-footnote text-ios-label dark:text-ios-dlabel flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-ios-label-3 dark:text-ios-dlabel-3 hover:text-ios-label dark:hover:text-ios-dlabel mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
