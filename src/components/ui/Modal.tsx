import React, { useEffect } from 'react'
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
  xl: 'max-w-4xl'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} bg-white dark:bg-[#111111] rounded-xl shadow-2xl max-h-[90vh] flex flex-col`}>
        {title != null && (
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23]">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 pb-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3 bg-gray-50 dark:bg-[#0D0D0D] rounded-b-xl">{footer}</div>}
      </div>
    </div>
  )
}
