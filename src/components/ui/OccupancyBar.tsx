interface OccupancyBarProps {
  ocupadas: number
  totais: number
  showLabel?: boolean
}

export default function OccupancyBar({ ocupadas, totais, showLabel = true }: OccupancyBarProps) {
  const pct = totais > 0 ? Math.min(100, Math.round((ocupadas / totais) * 100)) : 0
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
  const text = pct >= 100 ? 'Lotada' : `${ocupadas}/${totais} vagas`
  const textColor = pct >= 100 ? 'text-red-600 dark:text-red-400' : pct >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className={`font-medium ${textColor}`}>{text}</span>
          <span className="text-gray-400 dark:text-gray-500">{pct}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-[#1F1F23] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
