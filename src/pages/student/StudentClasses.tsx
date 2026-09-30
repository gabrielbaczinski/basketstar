import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Clock, User, CalendarCheck, LayoutGrid, Tag } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import { getBookingDia, getVagasDisponiveisDia, isInscritoDia, isNaFilaDia } from '../../utils/aulaUtils'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const DIAS_ABREV = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MODALIDADES: ('Todas' | ModalidadeType)[] = ['Todas', 'Pilates', 'Muay Thai', 'Spinning']
type ViewMode = 'dia' | 'semana' | 'tipo'

const MOD_COLOR: Record<ModalidadeType, { dot: string; text: string; bg: string }> = {
  'Pilates':   { dot: '#7C3AED', text: 'text-violet-700 dark:text-violet-400', bg: 'bg-gray-100 dark:bg-[#1F1F23]' },
  'Muay Thai': { dot: '#DC2626', text: 'text-red-700 dark:text-red-400',       bg: 'bg-gray-100 dark:bg-[#1F1F23]' },
  'Spinning':  { dot: '#D97706', text: 'text-amber-700 dark:text-amber-400',   bg: 'bg-gray-100 dark:bg-[#1F1F23]' },
}

function getWeekStart(offset: number): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dow = today.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const m = new Date(today)
  m.setDate(today.getDate() + diff + offset * 7)
  return m
}

function getWeekDays(weekOffset: number) {
  const monday = getWeekStart(weekOffset)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return DIAS.map((name, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return {
      name, abbrev: DIAS_ABREV[i],
      dayNum: date.getDate(),
      monthShort: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      isToday: date.getTime() === today.getTime(),
      isPast: date.getTime() < today.getTime(),
    }
  })
}

function getDefaultDay(): string {
  const map = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const name = map[new Date().getDay()]
  return name === 'Domingo' ? 'Segunda' : name
}

function sortByHorario(aulas: Aula[]) {
  return [...aulas].sort((a, b) => a.horario.localeCompare(b.horario))
}

function occupancyColor(pct: number) {
  if (pct >= 1) return 'bg-red-500'
  if (pct >= 0.75) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function ModBadge({ mod }: { mod: ModalidadeType }) {
  const c = MOD_COLOR[mod]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: c.dot }} />
      {mod}
    </span>
  )
}

function OccBar({ occupied, total }: { occupied: number; total: number }) {
  const pct = total > 0 ? occupied / total : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${occupancyColor(pct)}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500 shrink-0">{occupied}/{total}</span>
    </div>
  )
}

function ClassCard({ aula, dia, userId, profNome, onBook, onCancel, onFullClick }: {
  aula: Aula; dia: string; userId: string; profNome: string
  onBook: () => void; onCancel: () => void; onFullClick: () => void
}) {
  const booking = getBookingDia(aula, dia)
  const vagas   = getVagasDisponiveisDia(aula, dia)
  const inscrito = isInscritoDia(aula, dia, userId)
  const naFila   = isNaFilaDia(aula, dia, userId)
  const full     = vagas <= 0
  return (
    <div className={`bg-white dark:bg-[#111111] rounded-md shadow-sm flex overflow-hidden ${inscrito ? 'ring-1 ring-[#5E6AD2]/30' : ''}`}>
      <div className="w-0.5 shrink-0" style={{ backgroundColor: MOD_COLOR[aula.modalidade].dot }} />
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <ModBadge mod={aula.modalidade} />
              {inscrito && <span className="text-[11px] font-medium text-[#5E6AD2] bg-gray-100 dark:bg-[#1F1F23] px-2 py-0.5 rounded">Inscrito</span>}
              {naFila   && <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-gray-100 dark:bg-[#1F1F23] px-2 py-0.5 rounded">Na fila</span>}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1"><Clock size={11} />{aula.horario}</span>
              <span className="inline-flex items-center gap-1"><User size={11} />{profNome}</span>
            </div>
            <div className="mt-2"><OccBar occupied={booking.inscritos.length} total={aula.vagasTotais} /></div>
            {booking.filaEspera.length > 0 && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{booking.filaEspera.length} na fila de espera</p>
            )}
          </div>
          <div className="shrink-0 self-center">
            {inscrito ? (
              <button onClick={onCancel} className="text-[12px] font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] px-3 py-1.5 rounded transition-colors">Cancelar</button>
            ) : naFila ? (
              <button disabled className="text-[12px] font-medium text-gray-400 px-3 py-1.5 rounded cursor-default">Na fila</button>
            ) : full ? (
              <button onClick={onFullClick} className="text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] px-3 py-1.5 rounded transition-colors">Lotada</button>
            ) : (
              <button onClick={onBook} className="text-[12px] font-medium bg-[#5E6AD2] hover:bg-[#4B55B8] text-white px-3 py-1.5 rounded transition-colors">Agendar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentClasses() {
  const { data, currentUser, bookClassDia, cancelClassDia, joinWaitlistDia } = useApp()
  const { showToast } = useToast()
  const [view, setView] = useState<ViewMode>('dia')
  const [selectedDay, setSelectedDay] = useState(getDefaultDay)
  const [weekOffset, setWeekOffset] = useState(0)
  const [filter, setFilter] = useState<'Todas' | ModalidadeType>('Todas')
  const [fullModal, setFullModal] = useState<{ aula: Aula; dia: string } | null>(null)
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  const userId = currentUser?.id ?? ''
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset])
  const profNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? id

  const aulasFiltered = useMemo(
    () => filter === 'Todas' ? data.aulas : data.aulas.filter(a => a.modalidade === filter),
    [data.aulas, filter]
  )

  const handleBook = (aulaId: string, dia: string) => {
    const aula = data.aulas.find(a => a.id === aulaId)!
    if (getVagasDisponiveisDia(aula, dia) <= 0 && !isInscritoDia(aula, dia, userId)) {
      setFullModal({ aula, dia }); return
    }
    const res = bookClassDia(aulaId, dia)
    if (res === 'booked') showToast(`${aula.modalidade} — ${dia} ${aula.horario} agendado.`, 'success')
    else if (res === 'already_booked') showToast('Você já está inscrito neste horário.', 'info')
    else if (res === 'full') setFullModal({ aula, dia })
  }

  const handleCancel = (aulaId: string, dia: string) => {
    const aula = data.aulas.find(a => a.id === aulaId)!
    if (cancelClassDia(aulaId, dia)) showToast(`Inscrição em ${aula.modalidade} — ${dia} cancelada.`, 'warning')
  }

  const handleWaitlist = (aulaId: string, dia: string) => {
    joinWaitlistDia(aulaId, dia)
    showToast('Você entrou na fila de espera.', 'info')
  }

  const aulasNoDia  = useMemo(() => sortByHorario(aulasFiltered.filter(a => a.diasSemana.includes(selectedDay))), [aulasFiltered, selectedDay])
  const allHorarios = useMemo(() => [...new Set(aulasFiltered.map(a => a.horario))].sort(), [aulasFiltered])

  return (
    <div className="space-y-0 -mx-4 md:mx-0">
      {/* Title */}
      <div className="px-4 md:px-0 pt-4 pb-3">
        <h1 className="text-[18px] font-semibold text-gray-900 dark:text-white tracking-tight">Aulas</h1>
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Escolha o dia e agende sua presença</p>
      </div>

      {/* Notice banner */}
      {!noticeDismissed && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-gray-100 dark:bg-[#1A1A1E] text-gray-600 dark:text-gray-400 text-[12px]">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span className="flex-1">Os horários são definidos pela academia. Você escolhe em quais dias quer comparecer.</span>
          <button onClick={() => setNoticeDismissed(true)} className="shrink-0 text-[11px] underline opacity-60 hover:opacity-100">Entendi</button>
        </div>
      )}

      <div className="py-3 space-y-3">
        {/* View switcher */}
        <div className="flex items-center px-4 md:px-0 gap-1">
          {([['dia', 'Por dia', CalendarCheck], ['semana', 'Semana', LayoutGrid], ['tipo', 'Por tipo', Tag]] as const).map(([v, label, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${view === v ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23]'}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        {/* Modalidade filter */}
        <div className="flex items-center gap-1.5 px-4 md:px-0 overflow-x-auto no-scrollbar">
          {MODALIDADES.map(m => (
            <button key={m} onClick={() => setFilter(m)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${filter === m ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-white dark:bg-[#1A1A1E] text-gray-500 dark:text-gray-400 shadow-sm hover:bg-gray-50'}`}>
              {m !== 'Todas' && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MOD_COLOR[m as ModalidadeType].dot }} />}
              {m}
            </button>
          ))}
        </div>

        {/* Day strip */}
        {(view === 'dia' || view === 'semana') && (
          <div className="px-4 md:px-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <button onClick={() => setWeekOffset(o => o - 1)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"><ChevronLeft size={14} /></button>
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 px-1">
                  {weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : `Sem. +${weekOffset}`}
                  {' · '}{weekDays[0].dayNum}/{weekDays[0].monthShort}–{weekDays[4].dayNum}/{weekDays[4].monthShort}
                </span>
                <button onClick={() => setWeekOffset(o => o + 1)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"><ChevronRight size={14} /></button>
              </div>
              {weekOffset !== 0 && <button onClick={() => { setWeekOffset(0); setSelectedDay(getDefaultDay()) }} className="text-[11px] text-[#5E6AD2] hover:underline">Hoje</button>}
            </div>
            <div className="flex gap-0.5">
              {weekDays.map(d => {
                const hasClasses = aulasFiltered.some(a => a.diasSemana.includes(d.name))
                const active = view === 'dia' && selectedDay === d.name
                return (
                  <button key={d.name} onClick={() => { setSelectedDay(d.name); if (view === 'semana') setView('dia') }}
                    className={`flex-1 flex flex-col items-center py-2 rounded transition-colors ${active ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]' : d.isPast ? 'text-gray-300 dark:text-gray-600' : d.isToday ? 'text-[#5E6AD2]' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]'}`}>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{d.abbrev}</span>
                    <span className={`text-[14px] font-semibold leading-tight mt-0.5 ${d.isToday && !active ? 'text-[#5E6AD2]' : ''}`}>{d.dayNum}</span>
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${hasClasses && !active ? 'bg-current opacity-30' : 'opacity-0'}`} />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── DIA view ── */}
      {view === 'dia' && (
        <div className="space-y-2 px-4 md:px-0 pb-4">
          {aulasNoDia.length === 0 ? (
            <div className="py-14 text-center text-gray-400 dark:text-gray-500">
              <CalendarCheck size={26} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px] font-medium">Nenhuma aula em {selectedDay}</p>
              <p className="text-[12px] mt-1">Selecione outro dia ou modalidade.</p>
            </div>
          ) : aulasNoDia.map(aula => (
            <ClassCard key={aula.id} aula={aula} dia={selectedDay} userId={userId}
              profNome={profNome(aula.professorId)}
              onBook={() => handleBook(aula.id, selectedDay)}
              onCancel={() => handleCancel(aula.id, selectedDay)}
              onFullClick={() => setFullModal({ aula, dia: selectedDay })}
            />
          ))}
        </div>
      )}

      {/* ── SEMANA view ── */}
      {view === 'semana' && (
        <div className="px-4 md:px-0 pb-4 overflow-x-auto">
          <table className="min-w-full text-[11px] border-separate border-spacing-y-0">
            <thead>
              <tr>
                <th className="w-10 pr-3 py-2 text-left font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Hora</th>
                {weekDays.map(d => (
                  <th key={d.name} className={`px-1 py-2 text-center uppercase tracking-wider text-[10px] font-medium ${d.isToday ? 'text-[#5E6AD2]' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div>{d.abbrev}</div>
                    <div className={`text-[13px] font-semibold mt-0.5 ${d.isToday ? 'text-[#5E6AD2]' : 'text-gray-700 dark:text-gray-300'}`}>{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allHorarios.map(horario => (
                <tr key={horario} className="align-top">
                  <td className="pr-3 py-1.5 text-gray-400 dark:text-gray-500 font-mono tabular-nums text-[11px] whitespace-nowrap">{horario}</td>
                  {weekDays.map(d => {
                    const aulasDia = aulasFiltered.filter(a => a.horario === horario && a.diasSemana.includes(d.name))
                    return (
                      <td key={d.name} className="px-0.5 py-1 min-w-[60px]">
                        {aulasDia.map(aula => {
                          const vagas    = getVagasDisponiveisDia(aula, d.name)
                          const inscrito = isInscritoDia(aula, d.name, userId)
                          const naFila   = isNaFilaDia(aula, d.name, userId)
                          const full     = vagas <= 0
                          const c = MOD_COLOR[aula.modalidade]
                          return (
                            <button key={aula.id}
                              onClick={() => inscrito ? handleCancel(aula.id, d.name) : handleBook(aula.id, d.name)}
                              disabled={d.isPast}
                              title={`${aula.modalidade} ${aula.horario} — ${d.name}`}
                              className={`w-full text-left rounded p-1.5 mb-0.5 leading-none transition-colors ${inscrito ? `bg-gray-100 dark:bg-[#1F1F23] ${c.text} ring-1 ring-current/30` : naFila ? 'bg-gray-100 dark:bg-[#1F1F23] text-amber-700 dark:text-amber-400' : full ? 'bg-gray-100 dark:bg-[#1F1F23] text-red-500 dark:text-red-400' : `bg-gray-100 dark:bg-[#1F1F23] ${c.text}`} ${d.isPast ? 'opacity-30 cursor-default' : ''}`}>
                              <div className="font-semibold text-[10px]">{aula.modalidade === 'Muay Thai' ? 'Muay' : aula.modalidade}</div>
                              <div className="opacity-60 text-[10px] mt-0.5">{vagas > 0 ? `${vagas}v` : 'lot.'}</div>
                            </button>
                          )
                        })}
                        {aulasDia.length === 0 && <div className="text-gray-200 dark:text-gray-800 text-center text-[10px] py-1">·</div>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TIPO view ── */}
      {view === 'tipo' && (
        <div className="space-y-6 px-4 md:px-0 pb-4">
          {(['Pilates', 'Muay Thai', 'Spinning'] as ModalidadeType[])
            .filter(mod => filter === 'Todas' || filter === mod)
            .map(mod => {
              const aulas = sortByHorario(data.aulas.filter(a => a.modalidade === mod))
              if (aulas.length === 0) return null
              const c = MOD_COLOR[mod]
              return (
                <section key={mod}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
                    <h2 className={`text-[13px] font-semibold ${c.text}`}>{mod}</h2>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{aulas.length} turma{aulas.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {aulas.map(aula => (
                      <div key={aula.id} className="bg-white dark:bg-[#111111] rounded-md shadow-sm px-4 py-3">
                        <div className="flex items-center gap-3 text-[12px] text-gray-500 dark:text-gray-400 mb-3">
                          <span className="inline-flex items-center gap-1"><Clock size={11} /><span className="font-semibold text-gray-900 dark:text-white">{aula.horario}</span></span>
                          <span className="inline-flex items-center gap-1"><User size={11} />{profNome(aula.professorId)}</span>
                          <span>{aula.vagasTotais} vagas/dia</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {aula.diasSemana.map(dia => {
                            const vagas    = getVagasDisponiveisDia(aula, dia)
                            const inscrito = isInscritoDia(aula, dia, userId)
                            const naFila   = isNaFilaDia(aula, dia, userId)
                            const full     = vagas <= 0
                            return (
                              <button key={dia}
                                onClick={() => inscrito ? handleCancel(aula.id, dia) : handleBook(aula.id, dia)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${inscrito ? 'bg-[#5E6AD2] text-white' : naFila ? 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-amber-700 dark:text-amber-500' : full ? 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-red-500 dark:text-red-400' : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300 hover:bg-[#E4E4E7]'}`}>
                                {dia.slice(0, 3)}
                                <span className="opacity-60 text-[10px]">{inscrito ? ' ×' : naFila ? ' fila' : full ? ' lot.' : ` ${vagas}v`}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
        </div>
      )}

      {/* Full class modal */}
      {fullModal && (
        <Modal open={!!fullModal} title="Aula lotada" onClose={() => setFullModal(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 bg-gray-100 dark:bg-[#1A1A1E] rounded">
              <Info size={13} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-gray-700 dark:text-gray-300">
                {fullModal.aula.modalidade} às {fullModal.aula.horario} — {fullModal.dia} está lotada.
                {getBookingDia(fullModal.aula, fullModal.dia).filaEspera.length > 0 &&
                  ` ${getBookingDia(fullModal.aula, fullModal.dia).filaEspera.length} na fila.`}
              </p>
            </div>
            {!isNaFilaDia(fullModal.aula, fullModal.dia, userId) && (
              <button onClick={() => { handleWaitlist(fullModal.aula.id, fullModal.dia); setFullModal(null) }}
                className="w-full text-[13px] font-medium bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-800 dark:text-gray-200 py-2 rounded transition-colors">
                Entrar na fila de espera
              </button>
            )}
            {(() => {
              const alts = data.aulas.filter(a =>
                a.id !== fullModal.aula.id &&
                a.diasSemana.includes(fullModal.dia) &&
                (a.modalidade === fullModal.aula.modalidade || a.professorId === fullModal.aula.professorId) &&
                getVagasDisponiveisDia(a, fullModal.dia) > 0
              )
              if (alts.length === 0) return null
              return (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Alternativos disponíveis</p>
                  <div className="space-y-2">
                    {alts.map(alt => (
                      <div key={alt.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1A1E] rounded shadow-sm">
                        <div>
                          <ModBadge mod={alt.modalidade} />
                          <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />{alt.horario} · {getVagasDisponiveisDia(alt, fullModal.dia)} vagas
                          </p>
                        </div>
                        <button onClick={() => { handleBook(alt.id, fullModal.dia); setFullModal(null) }}
                          className="text-[12px] font-medium bg-[#5E6AD2] hover:bg-[#4B55B8] text-white px-3 py-1.5 rounded transition-colors">
                          Agendar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </Modal>
      )}
    </div>
  )
}
