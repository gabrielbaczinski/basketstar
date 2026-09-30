import React from 'react'
import type { ModalidadeType } from '../../types'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'red'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variantMap: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-[#1F1F23] dark:text-gray-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  info: 'bg-[#EEF0FD] text-[#5E6AD2] dark:bg-[#5E6AD2]/15 dark:text-[#8B95E5]',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function modalidadeVariant(m: ModalidadeType): Variant {
  switch (m) {
    case 'Pilates': return 'purple'
    case 'Muay Thai': return 'red'
    case 'Spinning': return 'orange'
  }
}

export function modalidadeAccent(m: ModalidadeType): string {
  switch (m) {
    case 'Pilates': return '#8B5CF6'
    case 'Muay Thai': return '#EF4444'
    case 'Spinning': return '#F97316'
  }
}
