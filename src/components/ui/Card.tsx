import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}

export default function Card({ padding = 'md', hover = false, className = '', children, ...rest }: CardProps) {
  const pad = padding === 'none' ? '' : padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-6' : 'p-5'
  const hoverCls = hover ? 'transition-shadow hover:shadow-md' : ''
  return (
    <div
      className={`bg-white dark:bg-[#111111] rounded-xl shadow-sm ${pad} ${hoverCls} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
