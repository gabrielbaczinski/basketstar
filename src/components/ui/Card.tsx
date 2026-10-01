import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  interactive?: boolean
  flat?: boolean
}

export default function Card({ padding = 'md', interactive = false, flat = false, className = '', children, ...rest }: CardProps) {
  const pad = padding === 'none' ? '' : padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-6' : 'p-5'
  const base = flat ? 'ios-card-flat' : 'ios-card'
  const inter = interactive ? 'transition-shadow duration-200 hover:shadow-ios-3 active:scale-[0.995]' : ''
  return (
    <div className={`${base} ${pad} ${inter} ${className}`} {...rest}>
      {children}
    </div>
  )
}
