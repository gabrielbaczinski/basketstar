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
    <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[30px] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{value}</p>
        {delta && (
          <p className={`text-[11px] font-medium mt-2 inline-flex items-center gap-1 ${delta.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {delta.positive && <ArrowUpRight size={11} />}
            {delta.text}
          </p>
        )}
      </div>
    </div>
  )
}

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  fontSize: 12,
  padding: '8px 12px',
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
      byMod[a.modalidade].total += a.vagasTotais
    })
    return Object.values(byMod)
  }, [data.aulas])

  const lineData = [
    { mes: 'Mai', alunos: 82 },
    { mes: 'Jun', alunos: 91 },
    { mes: 'Jul', alunos: 104 },
    { mes: 'Ago', alunos: 118 },
    { mes: 'Set', alunos: 127 },
  ]

  const insights = [
    { idx: 1, text: 'Pilates 08:00 está sempre lotada. Considere abrir uma segunda turma nesse horário.' },
    { idx: 2, text: 'Muay Thai teve crescimento de 18% nos agendamentos no último mês.' },
    { idx: 3, text: 'Spinning tem ocupação média de 83%, ideal para captar novos alunos.' },
  ]

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Visão geral da academia</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Alunos" value={String(stats.totalAlunos)} icon={<Users size={15} />} color="#5E6AD2" delta={{ text: '+3 esta semana', positive: true }} />
        <MetricCard label="Aulas ativas" value={String(stats.aulasAtivas)} icon={<CalendarDays size={15} />} color="#0284C7" delta={{ text: 'turmas cadastradas' }} />
        <MetricCard label="Ocupação" value={`${stats.ocupacao}%`} icon={<TrendingUp size={15} />} color="#059669" delta={{ text: '+5% vs semana anterior', positive: true }} />
        <MetricCard label="Cancelamentos" value={String(stats.cancelamentos)} icon={<XCircle size={15} />} color="#DC2626" delta={{ text: 'últimas 24 horas' }} />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-4">Ocupação por modalidade</h3>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="modalidade" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(94,106,210,0.05)' }} />
                <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="ocupadas" fill="#5E6AD2" radius={[4, 4, 0, 0]} name="Ocupadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-4">Crescimento de alunos</h3>
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[70, 140]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="alunos" stroke="#5E6AD2" strokeWidth={2.5} dot={{ r: 3, fill: '#5E6AD2', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <Sparkles size={13} className="text-[#5E6AD2]" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Insights da IA</h3>
        </div>
        <div className="space-y-3">
          {insights.map(({ idx, text }) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9F9FB] dark:bg-[#0D0D0F]">
              <span className="w-5 h-5 rounded-md bg-[#EEF0FD] dark:bg-[#1F2545] text-[#5E6AD2] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx}</span>
              <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
