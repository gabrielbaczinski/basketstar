interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  ring?: boolean
}

const sizeMap = {
  xs:  'w-6 h-6 text-[10px]',
  sm:  'w-8 h-8 text-[11px]',
  md:  'w-10 h-10 text-[13px]',
  lg:  'w-12 h-12 text-footnote',
  xl:  'w-16 h-16 text-callout',
  '2xl': 'w-20 h-20 text-title3',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Richer gradient palette for avatars — iOS-style vibrant pairs
const GRADIENTS: [string, string][] = [
  ['#5E6AD2', '#818CF8'], // indigo
  ['#007AFF', '#5AC8FA'], // blue
  ['#AF52DE', '#DA70FF'], // purple
  ['#FF2D55', '#FF6482'], // pink
  ['#FF9500', '#FFB340'], // orange
  ['#34C759', '#58D068'], // green
  ['#00C7BE', '#30D1C8'], // mint
  ['#30B0C7', '#64D2FF'], // teal
  ['#A2845E', '#B99976'], // brown
  ['#5E5CE6', '#7D7BF0'], // sys indigo
]

function hashColor(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 131 + name.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

export default function Avatar({ name, size = 'md', className = '', ring = false }: AvatarProps) {
  const [from, to] = hashColor(name)
  const ringCls = ring ? 'ring-2 ring-white dark:ring-ios-dbg-elev' : ''
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ${sizeMap[size]} ${ringCls} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      {initials(name)}
    </div>
  )
}
