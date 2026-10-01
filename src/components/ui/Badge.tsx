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

/* ─────────────────── Modalidade color system ─────────────────── */
/* Free-text modalidade names → deterministic palette.           */

interface Swatch {
  accent: string
  from: string
  to: string
  variant: Variant
}

const PALETTE: Swatch[] = [
  { accent: '#AF52DE', from: '#AF52DE', to: '#DA70FF', variant: 'purple' }, // 0 — Pilates (canonical)
  { accent: '#FF3B30', from: '#FF3B30', to: '#FF6482', variant: 'red' },    // 1 — Muay Thai (canonical)
  { accent: '#FF9500', from: '#FF9500', to: '#FFB340', variant: 'orange' }, // 2 — Spinning  (canonical)
  { accent: '#007AFF', from: '#007AFF', to: '#5AC8FA', variant: 'info' },   // 3 — blue
  { accent: '#34C759', from: '#34C759', to: '#58D068', variant: 'success' },// 4 — green
  { accent: '#00C7BE', from: '#00C7BE', to: '#30D1C8', variant: 'tint' },   // 5 — mint
  { accent: '#5E6AD2', from: '#5E6AD2', to: '#818CF8', variant: 'tint' },   // 6 — indigo
  { accent: '#FF2D55', from: '#FF2D55', to: '#FF6482', variant: 'danger' },// 7 — pink
  { accent: '#30B0C7', from: '#30B0C7', to: '#64D2FF', variant: 'info' },   // 8 — teal
  { accent: '#A2845E', from: '#A2845E', to: '#B99976', variant: 'default' },// 9 — brown
]

const CANONICAL: Record<string, number> = {
  'Pilates': 0,
  'Muay Thai': 1,
  'Spinning': 2,
}

function swatchFor(name: ModalidadeType): Swatch {
  const trimmed = (name || '').trim()
  const canon = CANONICAL[trimmed]
  if (canon !== undefined) return PALETTE[canon]
  let h = 0
  const key = trimmed.toLowerCase()
  for (let i = 0; i < key.length; i++) h = (h * 131 + key.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function modalidadeAccent(m: ModalidadeType): string {
  return swatchFor(m).accent
}

export function modalidadeGradient(m: ModalidadeType): string {
  const s = swatchFor(m)
  return `linear-gradient(135deg, ${s.from} 0%, ${s.to} 100%)`
}

export function modalidadeVariant(m: ModalidadeType): Variant {
  return swatchFor(m).variant
}
