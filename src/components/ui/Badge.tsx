import React from 'react'
import type { ModalidadeType } from '../../types'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'red'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variantMap: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-600 dark:bg-[#1F1F23] dark:text-gray-400',
  success: 'bg-gray-100 text-emerald-700 dark:bg-[#1F1F23] dark:text-emerald-500',
  warning: 'bg-gray-100 text-amber-700 dark:bg-[#1F1F23] dark:text-amber-500',
  danger:  'bg-gray-100 text-red-600 dark:bg-[#1F1F23] dark:text-red-500',
  info:    'bg-gray-100 text-[#5E6AD2] dark:bg-[#1F1F23] dark:text-[#8B95E5]',
  purple:  'bg-gray-100 text-violet-700 dark:bg-[#1F1F23] dark:text-violet-400',
  orange:  'bg-gray-100 text-orange-700 dark:bg-[#1F1F23] dark:text-orange-400',
  red:     'bg-gray-100 text-red-600 dark:bg-[#1F1F23] dark:text-red-500',
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
    case 'Pilates': return '#7C3AED'
    case 'Muay Thai': return '#DC2626'
    case 'Spinning': return '#D97706'
  }
}
