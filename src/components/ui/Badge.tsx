import React from 'react'
import type { ModalidadeType } from '../../types'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'red' | 'tint'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
  dot?: boolean
}

const variantMap: Record<Variant, string> = {
  default: 'bg-ios-fill-1 text-ios-label-2 dark:bg-white/10 dark:text-ios-dlabel-2',
  success: 'bg-sys-green/12 text-sys-green dark:bg-sys-green/16 dark:text-[#30D158]',
  warning: 'bg-sys-orange/12 text-sys-orange dark:bg-sys-orange/16 dark:text-[#FF9F0A]',
  danger:  'bg-sys-red/12 text-sys-red dark:bg-sys-red/16 dark:text-[#FF453A]',
  info:    'bg-tint-500/12 text-tint-700 dark:bg-tint-500/18 dark:text-tint-300',
  purple:  'bg-sys-purple/12 text-sys-purple dark:bg-sys-purple/16 dark:text-[#BF5AF2]',
  orange:  'bg-sys-orange/12 text-sys-orange dark:bg-sys-orange/16 dark:text-[#FF9F0A]',
  red:     'bg-sys-red/12 text-sys-red dark:bg-sys-red/16 dark:text-[#FF453A]',
  tint:    'bg-tint-500/12 text-tint-700 dark:bg-tint-500/18 dark:text-tint-300',
}

const dotColor: Record<Variant, string> = {
  default: 'bg-ios-label-3',
  success: 'bg-sys-green',
  warning: 'bg-sys-orange',
  danger:  'bg-sys-red',
  info:    'bg-tint-500',
  purple:  'bg-sys-purple',
  orange:  'bg-sys-orange',
  red:     'bg-sys-red',
  tint:    'bg-tint-500',
}

export default function Badge({ children, variant = 'default', className = '', dot = false }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption2 font-semibold ${variantMap[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[variant]}`} />}
      {children}
    </span>
  )
}

/* ─── Modalidade helpers — single brand color, no rainbow ─── */

// Returns 'var(--brand)' so the CSS variable drives the color globally.
export function modalidadeAccent(_m: ModalidadeType): string {
  return 'var(--brand)'
}

// Returns flat brand color (no gradient).
export function modalidadeGradient(_m: ModalidadeType): string {
  return 'var(--brand)'
}

// All modality badges use the neutral 'default' style — no rainbow.
export function modalidadeVariant(_m: ModalidadeType): Variant {
  return 'default'
}
