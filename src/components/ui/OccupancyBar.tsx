interface OccupancyBarProps {
  ocupadas: number
  totais: number
  showLabel?: boolean
  compact?: boolean
}

export default function OccupancyBar({ ocupadas, totais, showLabel = true, compact = false }: OccupancyBarProps) {
  const pct = totais > 0 ? Math.min(100, Math.round((ocupadas / totais) * 100)) : 0
  const color = pct >= 100 ? '#FF3B30' : pct >= 80 ? '#FF9500' : '#34C759'
  const text = pct >= 100 ? 'Lotada' : `${ocupadas}/${totais} vagas`
  const trackH = compact ? 'h-1' : 'h-1.5'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-caption1 mb-1.5">
          <span className="font-semibold" style={{ color }}>{text}</span>
          <span className="text-ios-label-3 dark:text-ios-dlabel-3 tabular-nums">{pct}%</span>
        </div>
      )}
      <div className={`w-full ${trackH} ios-fill-2 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
