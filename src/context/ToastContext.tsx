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
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
      case 'warning': return <AlertTriangle size={16} className="text-amber-500 shrink-0" />
      case 'error': return <XCircle size={16} className="text-red-500 shrink-0" />
      default: return <Info size={16} className="text-[#5E6AD2] shrink-0" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} className="flex items-start gap-2.5 bg-white dark:bg-[#111111] rounded-xl shadow-lg px-3.5 py-3 min-w-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="mt-0.5">{iconFor(t.type)}</div>
            <p className="text-sm text-gray-900 dark:text-gray-100 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-0.5">
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
