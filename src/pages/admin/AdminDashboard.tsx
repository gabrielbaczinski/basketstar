import { useMemo } from 'react'
import { Users, CalendarDays, TrendingUp, XCircle, Sparkles, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useApp } from '../../context/AppContext'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

interface MetricProps {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  delta?: { text: string; positive?: boolean }
}

function MetricCard({ label, value, icon, color, delta }: MetricProps) {
  return (
    <div className="ios-card p-3.5 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-ios flex items-center justify-center shrink-0 text-white"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: `0 4px 12px ${color}44, inset 0 0 0 0.5px rgba(255,255,255,0.22)`,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
          {label}
        </p>
        <p className="text-title3 font-bold text-ios-label dark:text-ios-dlabel tabular-nums leading-none mt-0.5">
          {value}
        </p>
        {delta && (
          <p
            className={`text-caption2 font-semibold mt-1 inline-flex items-center gap-0.5 truncate ${
              delta.positive ? 'text-sys-green' : 'text-ios-label-3 dark:text-ios-dlabel-3'
            }`}
          >
            {delta.positive && <ArrowUpRight size={10} strokeWidth={2.6} />}
            <span className="truncate">{delta.text}</span>
          </p>
        )}
      </div>
    </div>
  )
}

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  fontSize: 12,
  padding: '10px 14px',
  backgroundColor: 'white',
}

export default function AdminDashboard() {
  const { data } = useApp()

  const stats = useMemo(() => {
    const totalAlunos = data.usuarios.filter(u => u.role === 'aluno').length
    const aulasAtivas = data.aulas.length
    const ocupacaoPcts = data.aulas.map(a => getMediaOcupacaoPct(a))
    const ocupacao = ocupacaoPcts.length > 0
      ? Math.round((ocupacaoPcts.reduce((s, v) => s + v, 0) / ocupacaoPcts.length) * 100)
      : 0
    const cancelamentos = 6
    return { totalAlunos, aulasAtivas, ocupacao, cancelamentos }
  }, [data])

  const barData = useMemo(() => {
    const byMod: Record<string, { modalidade: string; ocupadas: number; total: number }> = {}
    data.aulas.forEach(a => {
      if (!byMod[a.modalidade]) byMod[a.modalidade] = { modalidade: a.modalidade, ocupadas: 0, total: 0 }
      byMod[a.modalidade].ocupadas += getMaxOcupados(a)
      byMod[a.modalidade].total += Number(a.vagasTotais) || 0
    })
    return Object.values(byMod)
  }, [data.aulas])

  const lineData = [
    { mes: 'Mai', alunos: 82 }, { mes: 'Jun', alunos: 91 }, { mes: 'Jul', alunos: 104 },
    { mes: 'Ago', alunos: 118 }, { mes: 'Set', alunos: 127 },
  ]

  const insights = [
    { idx: 1, text: 'Pilates 08:00 está sempre lotada. Considere abrir uma segunda turma nesse horário.' },
    { idx: 2, text: 'Muay Thai teve crescimento de 18% nos agendamentos no último mês.' },
    { idx: 3, text: 'Spinning tem ocupação média de 83%, ideal para captar novos alunos.' },
  ]

  return (
    <div className="page-container pt-4 md:pt-5 pb-6 space-y-4">
      <div>
        <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Dashboard</h1>
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">Visão geral da academia</p>
      </div>

      {/* Metrics — compact horizontal cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <MetricCard label="Alunos" value={String(stats.totalAlunos)} icon={<Users size={16} />} color="#5E6AD2" delta={{ text: '+3 esta semana', positive: true }} />
        <MetricCard label="Aulas ativas" value={String(stats.aulasAtivas)} icon={<CalendarDays size={16} />} color="#007AFF" delta={{ text: 'turmas' }} />
        <MetricCard label="Ocupação" value={`${stats.ocupacao}%`} icon={<TrendingUp size={16} />} color="#34C759" delta={{ text: '+5% vs sem. ant.', positive: true }} />
        <MetricCard label="Cancelamentos" value={String(stats.cancelamentos)} icon={<XCircle size={16} />} color="#FF3B30" delta={{ text: 'últimas 24h' }} />
      </div>

      {/* 2-column layout: charts (span 2) + insights (sidebar) */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        {/* Charts stack */}
        <div className="space-y-3">
          <div className="ios-card p-4">
            <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-3">Ocupação por modalidade</h3>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(60,60,67,0.1)" vertical={false} />
                  <XAxis dataKey="modalidade" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(94,106,210,0.06)' }} />
                  <Bar dataKey="total" fill="rgba(142,142,147,0.3)" radius={[6, 6, 0, 0]} name="Total" />
                  <Bar dataKey="ocupadas" fill="#5E6AD2" radius={[6, 6, 0, 0]} name="Ocupadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ios-card p-4">
            <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-3">Crescimento de alunos</h3>
            <div className="h-52">
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(60,60,67,0.1)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} domain={[70, 140]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="alunos"
                    stroke="#5E6AD2"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#5E6AD2', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights sidebar */}
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-ios flex items-center justify-center text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #AF52DE 0%, #5E6AD2 100%)',
                boxShadow: '0 3px 10px rgba(175,82,222,0.3)',
              }}
            >
              <Sparkles size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-tight">Insights da IA</h3>
              <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2">Recomendações</p>
            </div>
          </div>
          <div className="space-y-2">
            {insights.map(({ idx, text }) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-ios ios-fill-3"
              >
                <span className="w-5 h-5 rounded-full bg-tint-500/14 text-tint-600 dark:text-tint-300 text-caption2 font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx}
                </span>
                <p className="text-caption1 text-ios-label dark:text-ios-dlabel leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
