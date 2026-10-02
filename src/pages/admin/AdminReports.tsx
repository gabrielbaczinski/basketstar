import { useMemo } from 'react'
import { FileDown, FileSpreadsheet, TrendingUp, Users, BarChart2, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { getMaxOcupados, getMediaOcupacaoPct } from '../../utils/aulaUtils'

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace('#', '')
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
}

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  fontSize: 12,
  padding: '10px 14px',
  backgroundColor: 'white',
}

export default function AdminReports() {
  const { data, brandColor } = useApp()
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

  const { peakHours, picoPeak } = useMemo(() => {
    const byHora: Record<string, number> = {}
    data.aulas.forEach(a => {
      const hora = `${a.horario.split(':')[0]}h`
      const total = Object.values(a.bookingsPorDia).reduce((sum, b) => sum + b.inscritos.length, 0)
      byHora[hora] = (byHora[hora] || 0) + total
    })
    const sorted = Object.entries(byHora)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, alunos]) => ({ hora, alunos }))
    const peak = sorted.length > 0 ? sorted.reduce((best, h) => h.alunos > best.alunos ? h : best).hora : '—'
    return { peakHours: sorted, picoPeak: peak }
  }, [data.aulas])

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

  const exportPdf = () => {
    const doc = new jsPDF()
    const dateStr = new Date().toLocaleDateString('pt-BR')
    const color = hexToRgb(brandColor.startsWith('#') ? brandColor : '#E55A2B')

    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text('FitCore — Relatório de Ocupação', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 128)
    doc.text(`Gerado em ${dateStr}`, 14, 25)

    autoTable(doc, {
      startY: 32,
      head: [['Indicador', 'Valor']],
      body: [
        ['Total de aulas', String(data.aulas.length)],
        ['Total de inscrições', String(totalInscritos)],
        ['Ocupação média', `${mediaOcupacao}%`],
        ['Horário de pico', picoPeak],
      ],
      theme: 'grid',
      headStyles: { fillColor: color },
    })

    let y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Ocupação por Aula', 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Aula', 'Ocupação (%)']],
      body: occByClass.map(r => [r.aula, `${r.ocupacao}%`]),
      theme: 'striped',
      headStyles: { fillColor: color },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text('Modalidades', 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Modalidade', 'Inscrições']],
      body: modShare.map(r => [r.name, String(r.value)]),
      theme: 'striped',
      headStyles: { fillColor: color },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text('Horários de Pico', 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Horário', 'Alunos']],
      body: peakHours.map(r => [r.hora, String(r.alunos)]),
      theme: 'striped',
      headStyles: { fillColor: color },
    })

    doc.save(`fitcore-relatorio-${dateStr.replace(/\//g, '-')}.pdf`)
    showToast('Relatório PDF gerado com sucesso.', 'success')
  }

  const exportExcel = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR')
    const wb = XLSX.utils.book_new()

    const resumo = XLSX.utils.aoa_to_sheet([
      ['FitCore — Relatório de Ocupação'],
      [`Gerado em ${dateStr}`],
      [],
      ['Indicador', 'Valor'],
      ['Total de aulas', data.aulas.length],
      ['Total de inscrições', totalInscritos],
      ['Ocupação média (%)', mediaOcupacao],
      ['Horário de pico', picoPeak],
    ])
    XLSX.utils.book_append_sheet(wb, resumo, 'Resumo')

    const ocupSheet = XLSX.utils.aoa_to_sheet([
      ['Aula', 'Ocupação (%)'],
      ...occByClass.map(r => [r.aula, r.ocupacao]),
    ])
    XLSX.utils.book_append_sheet(wb, ocupSheet, 'Ocupação')

    const modSheet = XLSX.utils.aoa_to_sheet([
      ['Modalidade', 'Inscrições'],
      ...modShare.map(r => [r.name, r.value]),
    ])
    XLSX.utils.book_append_sheet(wb, modSheet, 'Modalidades')

    const picoSheet = XLSX.utils.aoa_to_sheet([
      ['Horário', 'Alunos'],
      ...peakHours.map(r => [r.hora, r.alunos]),
    ])
    XLSX.utils.book_append_sheet(wb, picoSheet, 'Horários de Pico')

    XLSX.writeFile(wb, `fitcore-relatorio-${dateStr.replace(/\//g, '-')}.xlsx`)
    showToast('Planilha Excel gerada com sucesso.', 'success')
  }

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
          { label: 'Total aulas', value: String(data.aulas.length), icon: <BarChart2 size={14} />, color: brandColor },
          { label: 'Inscrições', value: String(totalInscritos), icon: <Users size={14} />, color: '#34C759' },
          { label: 'Ocupação', value: `${mediaOcupacao}%`, icon: <TrendingUp size={14} />, color: '#FF9500' },
          { label: 'Pico', value: picoPeak, icon: <Clock size={14} />, color: '#AF52DE' },
        ].map(k => (
          <div key={k.label} className="ios-card p-3 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-ios flex items-center justify-center shrink-0 text-white"
              style={{ background: k.color }}
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
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="ocupacao" fill={brandColor} radius={[6, 6, 0, 0]} />
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
                  {modShare.map((_entry, i) => (
                    <Cell key={i} fill={brandColor} />
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
                  <stop offset="0%" stopColor={brandColor} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="rgba(60,60,67,0.1)" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="alunos" stroke={brandColor} strokeWidth={3} fill="url(#peakArea)" dot={{ r: 4, fill: brandColor, strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
