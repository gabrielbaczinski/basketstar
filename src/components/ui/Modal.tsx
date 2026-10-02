import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
}

const sizeMap: Record<Required<ModalProps>['size'], string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px]" onClick={onClose} />
      <div
        className={`relative w-full ${sizeMap[size]} bg-ios-bg dark:bg-ios-dbg-elev sm:rounded-ios-xl rounded-t-ios-xl shadow-ios-5 max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-in`}
      >
        {/* Grabber handle for mobile sheet */}
        <div className="sm:hidden pt-2 pb-1 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-ios-label-4 dark:bg-ios-dlabel-4" />
        </div>

        {title != null && (
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <h3 className="text-title3 text-ios-label dark:text-ios-dlabel">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full ios-fill-1 text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-5 pb-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div
            className="px-5 py-3 hairline-t bg-ios-bg dark:bg-ios-dbg-elev"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
