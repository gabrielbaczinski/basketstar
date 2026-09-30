import { useMemo } from 'react'
import { Users, CalendarDays, TrendingUp, XCircle, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useApp } from '../../context/AppContext'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

interface MetricProps {
  label: string
  value: string
  icon: React.ReactNode
  accent?: string
  delta?: { value: string; positive?: boolean }
}

function Metric({ label, value, icon, accent, delta }: MetricProps) {
  const accentStyle = accent ? { boxShadow: `inset 0 -2px 0 ${accent}` } : undefined
  return (
    <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5 relative" style={accentStyle}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{value}</p>
      {delta && (
        <p className={`text-xs mt-1 font-medium ${delta.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {delta.value}
        </p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { data } = useApp()

  const stats = useMemo(() => {
    const totalAlunos = data.usuarios.filter(u => u.role === 'aluno').length
    const aulasHoje = data.aulas.length
    const ocupacaoPcts = data.aulas.map(a => getMediaOcupacaoPct(a))
    const ocupacao = ocupacaoPcts.length > 0
      ? Math.round((ocupacaoPcts.reduce((s, v) => s + v, 0) / ocupacaoPcts.length) * 100)
      : 0
    const cancelamentos = 6
    return { totalAlunos, aulasHoje, ocupacao, cancelamentos }
  }, [data])

  const barData = useMemo(() => {
    const byMod: Record<string, { modalidade: string; ocupadas: number; total: number }> = {}
    data.aulas.forEach(a => {
      const key = a.modalidade
      if (!byMod[key]) byMod[key] = { modalidade: key, ocupadas: 0, total: 0 }
      byMod[key].ocupadas += getMaxOcupados(a)
      byMod[key].total += a.vagasTotais
    })
    return Object.values(byMod)
  }, [data.aulas])

  const lineData = [
    { mes: 'Mai', alunos: 82 },
    { mes: 'Jun', alunos: 91 },
    { mes: 'Jul', alunos: 104 },
    { mes: 'Ago', alunos: 118 },
    { mes: 'Set', alunos: 127 }
  ]

  const insights = [
    'A turma de Pilates das 08:00 está sempre lotada. Considere abrir uma segunda turma no horário.',
    'Muay Thai teve crescimento de 18% nos agendamentos no último mês.',
    'A ocupação média das aulas de Spinning é 83%, ideal para novos alunos.'
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visão geral da academia</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Alunos"
          value={String(stats.totalAlunos)}
          icon={<Users size={14} />}
          accent="#5E6AD2"
          delta={{ value: '+3 esta semana', positive: true }}
        />
        <Metric
          label="Aulas hoje"
          value={String(stats.aulasHoje)}
          icon={<CalendarDays size={14} />}
          delta={{ value: 'agendadas no dia' }}
        />
        <Metric
          label="Ocupação"
          value={`${stats.ocupacao}%`}
          icon={<TrendingUp size={14} />}
          delta={{ value: '+5% vs semana passada', positive: true }}
        />
        <Metric
          label="Cancelamentos"
          value={String(stats.cancelamentos)}
          icon={<XCircle size={14} />}
          delta={{ value: 'últimas 24h' }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ocupação por modalidade</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="modalidade" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }} cursor={{ fill: 'rgba(94, 106, 210, 0.06)' }} />
                <Bar dataKey="total" fill="#EEF0FD" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="ocupadas" fill="#5E6AD2" radius={[4, 4, 0, 0]} name="Ocupadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Crescimento de alunos</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Line type="monotone" dataKey="alunos" stroke="#5E6AD2" strokeWidth={2} dot={{ r: 3, fill: '#5E6AD2' }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI insights */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-[#5E6AD2]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Insights da IA</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {insights.map((i, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#5E6AD2] mt-2 shrink-0 w-1 h-1 rounded-full bg-[#5E6AD2]" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
