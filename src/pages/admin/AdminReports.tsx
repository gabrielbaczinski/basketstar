import { useMemo } from 'react'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area } from 'recharts'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { modalidadeAccent } from '../../components/ui/Badge'
import type { ModalidadeType } from '../../types'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

export default function AdminReports() {
  const { data } = useApp()
  const { showToast } = useToast()

  const occByClass = useMemo(() => data.aulas.map(a => ({
    aula: `${a.modalidade} ${a.horario}`,
    ocupacao: Math.round(getMediaOcupacaoPct(a) * 100)
  })), [data.aulas])

  const modShare = useMemo(() => {
    const byMod: Record<string, number> = {}
    data.aulas.forEach(a => { byMod[a.modalidade] = (byMod[a.modalidade] || 0) + getMaxOcupados(a) })
    return Object.entries(byMod).map(([name, value]) => ({ name, value }))
  }, [data.aulas])

  const peakHours = [
    { hora: '06h', alunos: 12 },
    { hora: '07h', alunos: 28 },
    { hora: '08h', alunos: 42 },
    { hora: '09h', alunos: 18 },
    { hora: '10h', alunos: 22 },
    { hora: '17h', alunos: 30 },
    { hora: '18h', alunos: 45 },
    { hora: '19h', alunos: 51 },
    { hora: '20h', alunos: 33 }
  ]

  const exportPdf = () => showToast('Relatório PDF gerado (simulação).', 'success')
  const exportExcel = () => showToast('Planilha Excel gerada (simulação).', 'success')

  const tooltipStyle = { borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Análises e estatísticas da academia</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-1.5 bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FileDown size={13} /> PDF
          </button>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FileSpreadsheet size={13} /> Excel
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Ocupação por aula (%)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={occByClass}>
                <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="aula" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(94, 106, 210, 0.06)' }} />
                <Bar dataKey="ocupacao" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Modalidades mais populares</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={modShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {modShare.map((entry, i) => (
                    <Cell key={i} fill={modalidadeAccent(entry.name as ModalidadeType) || '#5E6AD2'} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Horários de pico</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={peakHours}>
              <defs>
                <linearGradient id="peakArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="alunos" stroke="#5E6AD2" strokeWidth={2} fill="url(#peakArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
