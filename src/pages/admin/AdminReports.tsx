import { useMemo } from 'react'
import { FileDown, FileSpreadsheet, TrendingUp, Users, BarChart2, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area } from 'recharts'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { modalidadeAccent } from '../../components/ui/Badge'
import type { ModalidadeType } from '../../types'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  fontSize: 12,
  padding: '10px 14px',
  backgroundColor: 'white',
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
    <div className="page-container pt-4 md:pt-5 pb-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Relatórios</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Análises e estatísticas da academia
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPdf} className="ios-btn-gray">
            <FileDown size={13} /> PDF
          </button>
          <button onClick={exportExcel} className="ios-btn-gray">
            <FileSpreadsheet size={13} /> Excel
          </button>
        </div>
      </div>

      {/* KPI strip — compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: 'Total aulas', value: String(data.aulas.length), icon: <BarChart2 size={14} />, color: '#5E6AD2' },
          { label: 'Inscrições', value: String(totalInscritos), icon: <Users size={14} />, color: '#34C759' },
          { label: 'Ocupação', value: `${mediaOcupacao}%`, icon: <TrendingUp size={14} />, color: '#FF9500' },
          { label: 'Pico', value: '19h', icon: <Clock size={14} />, color: '#AF52DE' },
        ].map(k => (
          <div key={k.label} className="ios-card p-3 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-ios flex items-center justify-center shrink-0 text-white"
              style={{
                background: `linear-gradient(135deg, ${k.color} 0%, ${k.color}CC 100%)`,
                boxShadow: `0 3px 10px ${k.color}44, inset 0 0 0 0.5px rgba(255,255,255,0.22)`,
              }}
            >
              {k.icon}
            </div>
            <div className="min-w-0">
              <p className="text-footnote font-bold text-ios-label dark:text-ios-dlabel tabular-nums leading-none">
                {k.value}
              </p>
              <p className="text-caption2 font-medium text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5 truncate">
                {k.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3-chart grid — 2 side-by-side + 1 full width */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="ios-card p-4">
          <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-3">Ocupação por aula (%)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={occByClass}>
                <CartesianGrid strokeDasharray="0" stroke="rgba(60,60,67,0.1)" vertical={false} />
                <XAxis dataKey="aula" tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(94,106,210,0.06)' }} />
                <Bar dataKey="ocupacao" fill="#5E6AD2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ios-card p-4">
          <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-3">Modalidades populares</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={modShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={42} paddingAngle={4}>
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

      {/* Peak hours — full width */}
      <div className="ios-card p-4">
        <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-3">Horários de pico</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={peakHours}>
              <defs>
                <linearGradient id="peakArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="rgba(60,60,67,0.1)" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="alunos" stroke="#5E6AD2" strokeWidth={3} fill="url(#peakArea)" dot={{ r: 4, fill: '#5E6AD2', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
