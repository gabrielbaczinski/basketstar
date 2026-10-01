import { useMemo } from 'react'
import { FileDown, FileSpreadsheet, TrendingUp, Users, BarChart2, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area } from 'recharts'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { modalidadeAccent } from '../../components/ui/Badge'
import type { ModalidadeType } from '../../types'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: 'none',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  fontSize: 12,
  padding: '8px 12px',
}

export default function AdminReports() {
  const { data } = useApp()
  const { showToast } = useToast()

  const occByClass = useMemo(() => data.aulas.map(a => ({
    aula: `${a.modalidade} ${a.horario}`,
    ocupacao: Math.round(getMediaOcupacaoPct(a) * 100),
  })), [data.aulas])

  const modShare = useMemo(() => {
    const byMod: Record<string, number> = {}
    data.aulas.forEach(a => { byMod[a.modalidade] = (byMod[a.modalidade] || 0) + getMaxOcupados(a) })
    return Object.entries(byMod).map(([name, value]) => ({ name, value }))
  }, [data.aulas])

  const peakHours = [
    { hora: '06h', alunos: 12 }, { hora: '07h', alunos: 28 }, { hora: '08h', alunos: 42 },
    { hora: '09h', alunos: 18 }, { hora: '10h', alunos: 22 }, { hora: '17h', alunos: 30 },
    { hora: '18h', alunos: 45 }, { hora: '19h', alunos: 51 }, { hora: '20h', alunos: 33 },
  ]

  const totalInscritos = useMemo(() => {
    let sum = 0
    data.aulas.forEach(a => {
      Object.values(a.bookingsPorDia).forEach(b => { sum += b.inscritos.length })
    })
    return sum
  }, [data.aulas])

  const mediaOcupacao = useMemo(() => {
    const pcts = data.aulas.map(a => getMediaOcupacaoPct(a))
    return pcts.length > 0 ? Math.round((pcts.reduce((s, v) => s + v, 0) / pcts.length) * 100) : 0
  }, [data.aulas])

  const exportPdf = () => showToast('Relatório PDF gerado (simulação).', 'success')
  const exportExcel = () => showToast('Planilha Excel gerada (simulação).', 'success')

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Análises e estatísticas da academia</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPdf}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-[#1A1A1E] text-gray-700 dark:text-gray-300 text-[13px] font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
            <FileDown size={13} /> PDF
          </button>
          <button onClick={exportExcel}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-[#1A1A1E] text-gray-700 dark:text-gray-300 text-[13px] font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
            <FileSpreadsheet size={13} /> Excel
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de aulas', value: String(data.aulas.length), icon: <BarChart2 size={14} />, color: '#5E6AD2' },
          { label: 'Inscrições ativas', value: String(totalInscritos), icon: <Users size={14} />, color: '#059669' },
          { label: 'Ocupação média', value: `${mediaOcupacao}%`, icon: <TrendingUp size={14} />, color: '#D97706' },
          { label: 'Horário de pico', value: '19h', icon: <Clock size={14} />, color: '#7C3AED' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${k.color}18` }}>
              <span style={{ color: k.color }}>{k.icon}</span>
            </div>
            <div>
              <p className="text-[20px] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{k.value}</p>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-4">Ocupação por aula (%)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={occByClass}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="aula" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(94,106,210,0.05)' }} />
                <Bar dataKey="ocupacao" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-4">Modalidades mais populares</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={modShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={3}>
                  {modShare.map((entry, i) => (
                    <Cell key={i} fill={modalidadeAccent(entry.name as ModalidadeType) || '#5E6AD2'} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak hours */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-4">Horários de pico</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={peakHours}>
              <defs>
                <linearGradient id="peakArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="alunos" stroke="#5E6AD2" strokeWidth={2.5} fill="url(#peakArea)" dot={{ r: 3, fill: '#5E6AD2', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
