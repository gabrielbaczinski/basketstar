interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg'
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorFor(name: string): string {
  const colors = [
    'bg-slate-600', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600',
    'bg-teal-600', 'bg-emerald-600', 'bg-sky-600', 'bg-cyan-600',
    'bg-zinc-500', 'bg-slate-500'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return colors[sum % colors.length]
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  return (
    <div className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${colorFor(name)} ${sizeMap[size]} ${className}`}>
      {initials(name)}
    </div>
  )
}
