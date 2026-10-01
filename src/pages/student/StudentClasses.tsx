import { useMemo, useRef, useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, ChevronDown, Info, Clock, User, CalendarCheck,
  LayoutGrid, Tag, SlidersHorizontal, X, Check, Users as UsersIcon, Flame,
  Hourglass,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import { getBookingDia, getVagasDisponiveisDia, isInscritoDia, isNaFilaDia } from '../../utils/aulaUtils'
import { useToast } from '../../context/ToastContext'
import { modalidadeAccent, modalidadeGradient } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const DIAS_ABREV = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
type ViewMode = 'dia' | 'semana' | 'tipo'

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
      name,
      abbrev: DIAS_ABREV[i],
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

/* ───────────────────────────── Pill dropdown ───────────────────────────── */

interface Option { value: string; label: string }

function PillSelect({
  icon, label, value, options, onChange, active,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  options: Option[]
  onChange: (v: string) => void
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = options.find(o => o.value === value)
  const display = active && selected ? selected.label : label

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full text-caption1 font-semibold transition-all active:scale-[0.97] ${
          active
            ? 'bg-tint-500 text-white shadow-tint-glow'
            : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
        }`}
      >
        {icon && <span className="opacity-80 shrink-0">{icon}</span>}
        <span className="truncate max-w-[140px]">{display}</span>
        <ChevronDown size={11} strokeWidth={2.5} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute z-30 top-full mt-1.5 min-w-[160px] max-h-[280px] overflow-y-auto bg-white dark:bg-ios-dbg-tert rounded-ios-md shadow-ios-4 py-1 animate-scale-in origin-top-left"
          style={{ left: 0 }}
        >
          {options.map(opt => {
            const isSel = opt.value === value
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-callout text-left transition-colors ${
                  isSel
                    ? 'text-tint-600 dark:text-tint-300'
                    : 'text-ios-label dark:text-ios-dlabel hover:bg-ios-fill-3 dark:hover:bg-white/5'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSel && <Check size={15} strokeWidth={2.6} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────── Class card (grid cell) ──────────────────────────────── */
/* Vertical card ~140px tall. Modality header strip + content + action.          */

function ClassCard({
  aula, dia, userId, profNome, onBook, onCancel, onFullClick,
}: {
  aula: Aula; dia: string; userId: string; profNome: string
  onBook: () => void; onCancel: () => void; onFullClick: () => void
}) {
  const booking   = getBookingDia(aula, dia)
  const totalVag  = Number(aula.vagasTotais) || 0
  const vagas     = Math.max(0, totalVag - booking.inscritos.length)
  const inscrito  = isInscritoDia(aula, dia, userId)
  const naFila    = isNaFilaDia(aula, dia, userId)
  const full      = vagas <= 0 && !inscrito
  const pct       = totalVag > 0 ? booking.inscritos.length / totalVag : 0
  const accent    = modalidadeAccent(aula.modalidade)
  const gradient  = modalidadeGradient(aula.modalidade)
  const trending  = pct >= 0.75 && pct < 1
  const filaPos   = naFila ? booking.filaEspera.indexOf(userId) + 1 : 0

  const actionBtn = inscrito ? (
    <button
      onClick={onCancel}
      className="w-full text-caption1 font-semibold text-sys-red hover:bg-sys-red/10 py-1.5 rounded-full transition-colors whitespace-nowrap"
    >
      Cancelar
    </button>
  ) : naFila ? (
    <button
      onClick={onCancel}
      className="w-full text-caption1 font-semibold text-sys-orange hover:bg-sys-orange/10 py-1.5 rounded-full transition-colors whitespace-nowrap"
    >
      Sair da fila
    </button>
  ) : full ? (
    <button onClick={onFullClick} className="w-full ios-btn-gray !py-1.5 !text-caption1 !px-3 whitespace-nowrap">
      Entrar na fila
    </button>
  ) : (
    <button onClick={onBook} className="w-full ios-btn-primary !py-1.5 !text-caption1 !px-3 whitespace-nowrap">
      Agendar
    </button>
  )

  const statusChip = inscrito ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-green/14 text-sys-green text-caption2 font-bold rounded-full leading-none shrink-0 whitespace-nowrap">
      <Check size={9} strokeWidth={3} /> Inscrito
    </span>
  ) : naFila ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-orange/18 text-sys-orange text-caption2 font-bold rounded-full leading-none shrink-0 whitespace-nowrap">
      <Hourglass size={9} strokeWidth={2.6} /> Fila {filaPos}º
    </span>
  ) : trending ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-orange/14 text-sys-orange text-caption2 font-bold rounded-full leading-none shrink-0 whitespace-nowrap">
      <Flame size={9} strokeWidth={2.6} /> Alta
    </span>
  ) : null

  const ringShadow = inscrito
    ? `0 0 0 1.5px ${accent}66, 0 1px 3px rgba(0,0,0,0.06)`
    : naFila
      ? `0 0 0 1.5px #FF950066, 0 1px 3px rgba(0,0,0,0.06)`
      : undefined

  return (
    <article
      className="group relative ios-card overflow-hidden transition-all hover:shadow-ios-3 sm:hover:-translate-y-0.5"
      style={{ boxShadow: ringShadow }}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full shrink-0" style={{ background: gradient }} />

      {/* ── MOBILE layout (horizontal row) ── */}
      <div className="sm:hidden flex items-center gap-3 p-3 min-w-0">
        {/* Time + day block */}
        <div className="shrink-0 w-[56px]">
          <p className="text-[22px] font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none tracking-tight">
            {aula.horario}
          </p>
          <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
            {dia.slice(0, 3)}
          </p>
        </div>
        {/* Middle: modality + professor + inline count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-footnote font-semibold tracking-tight truncate" style={{ color: accent }}>
              {aula.modalidade}
            </span>
            {statusChip}
          </div>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-0.5 flex items-center gap-1 truncate">
            <User size={10} className="opacity-70 shrink-0" />
            <span className="truncate">{profNome}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-[3px] flex-1 min-w-0 rounded-full ios-fill-2 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(pct * 100, 100)}%`,
                  background: pct >= 1 ? '#FF3B30' : pct >= 0.8 ? '#FF9500' : '#34C759',
                }}
              />
            </div>
            <span
              className={`text-caption2 font-semibold tabular-nums shrink-0 ${
                full ? 'text-sys-red' : vagas <= 3 ? 'text-sys-orange' : 'text-ios-label-3 dark:text-ios-dlabel-3'
              }`}
            >
              {booking.inscritos.length}/{totalVag}
            </span>
          </div>
        </div>
        {/* Action */}
        <div className="shrink-0 w-[88px]">{actionBtn}</div>
      </div>

      {/* ── DESKTOP layout (vertical card) ── */}
      <div className="hidden sm:flex sm:flex-col p-3.5 gap-2.5 min-h-[172px]">
        {/* Row 1 — modality + status */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-footnote font-semibold tracking-tight truncate min-w-0" style={{ color: accent }}>
            {aula.modalidade}
          </span>
          {statusChip}
        </div>

        {/* Row 2 — Big time */}
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-[26px] font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none tracking-tight">
            {aula.horario}
          </p>
          <span className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
            {dia.slice(0, 3)}
          </span>
        </div>

        {/* Row 3 — professor */}
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 flex items-center gap-1.5 min-w-0">
          <User size={11} className="opacity-70 shrink-0" />
          <span className="truncate">{profNome}</span>
        </p>

        {/* Row 4 — occupancy */}
        <div className="mt-auto space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 text-caption1 font-semibold tabular-nums text-ios-label-2 dark:text-ios-dlabel-2 min-w-0">
              <UsersIcon size={11} className="opacity-70 shrink-0" />
              {booking.inscritos.length}/{totalVag}
            </span>
            <span
              className={`text-caption1 font-semibold tabular-nums shrink-0 whitespace-nowrap ${
                full ? 'text-sys-red' : vagas <= 3 ? 'text-sys-orange' : 'text-ios-label-3 dark:text-ios-dlabel-3'
              }`}
            >
              {full ? 'Lotada' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="h-[3px] rounded-full ios-fill-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pct * 100, 100)}%`,
                background: pct >= 1 ? '#FF3B30' : pct >= 0.8 ? '#FF9500' : '#34C759',
              }}
            />
          </div>
          {booking.filaEspera.length > 0 && (
            <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 tabular-nums truncate">
              {booking.filaEspera.length} na fila
            </p>
          )}
        </div>

        {/* Row 5 — action */}
        <div className="pt-1">{actionBtn}</div>
      </div>
    </article>
  )
}

/* ───────────────────────────── Main Page ───────────────────────────── */

const SegBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption1 font-semibold transition-all ${
      active
        ? 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel shadow-ios-1'
        : 'text-ios-label-2 dark:text-ios-dlabel-2'
    }`}
  >
    {children}
  </button>
)

export default function StudentClasses() {
  const { data, currentUser, bookClassDia, cancelClassDia, joinWaitlistDia } = useApp()
  const { showToast } = useToast()
  const [view, setView] = useState<ViewMode>('dia')
  const [selectedDay, setSelectedDay] = useState(getDefaultDay)
  const [weekOffset, setWeekOffset] = useState(0)
  const [filterMod, setFilterMod] = useState<'Todas' | ModalidadeType>('Todas')
  const [filterHorario, setFilterHorario] = useState<string>('Todos')
  const [filterProf, setFilterProf] = useState<string>('Todos')
  const [fullModal, setFullModal] = useState<{ aula: Aula; dia: string } | null>(null)
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  const userId = currentUser?.id ?? ''
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset])
  const profNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? id

  const horariosOpts = useMemo(() => [...new Set(data.aulas.map(a => a.horario))].sort(), [data.aulas])
  const modalidadesOpts = useMemo(() => [...new Set(data.aulas.map(a => a.modalidade))].filter(Boolean).sort(), [data.aulas])
  const profsOpts = useMemo(
    () => data.professores.filter(p => data.aulas.some(a => a.professorId === p.id)),
    [data.aulas, data.professores],
  )

  const aulasFiltered = useMemo(() => {
    let list = filterMod === 'Todas' ? data.aulas : data.aulas.filter(a => a.modalidade === filterMod)
    if (filterHorario !== 'Todos') list = list.filter(a => a.horario === filterHorario)
    if (filterProf !== 'Todos') list = list.filter(a => a.professorId === filterProf)
    return list
  }, [data.aulas, filterMod, filterHorario, filterProf])

  const hasActiveFilters = filterMod !== 'Todas' || filterHorario !== 'Todos' || filterProf !== 'Todos'
  const clearFilters = () => { setFilterMod('Todas'); setFilterHorario('Todos'); setFilterProf('Todos') }

  const handleBook = (aulaId: string, dia: string) => {
    const aula = data.aulas.find(a => a.id === aulaId)!
    const vagas = getVagasDisponiveisDia(aula, dia)
    const inscrito = isInscritoDia(aula, dia, userId)
    const naFila = isNaFilaDia(aula, dia, userId)
    // Only open "lotada" when there are truly no vagas AND user isn't already inscrito.
    if (vagas <= 0 && !inscrito && !naFila) {
      setFullModal({ aula, dia }); return
    }
    const res = bookClassDia(aulaId, dia)
    if (res === 'booked') showToast(`${aula.modalidade} — ${dia} ${aula.horario} agendado.`, 'success')
    else if (res === 'already_booked') showToast('Você já está inscrito neste horário.', 'info')
    else if (res === 'waitlisted') showToast('Você já está na fila de espera deste horário.', 'info')
    else if (res === 'inactive') showToast('Matrícula inativa. Procure a recepção para regularizar.', 'warning')
    else if (res === 'full') setFullModal({ aula, dia })
  }

  const handleCancel = (aulaId: string, dia: string) => {
    const aula = data.aulas.find(a => a.id === aulaId)!
    if (cancelClassDia(aulaId, dia)) showToast(`${aula.modalidade} — ${dia} cancelada.`, 'warning')
  }

  const handleWaitlist = (aulaId: string, dia: string) => {
    joinWaitlistDia(aulaId, dia)
    showToast('Você entrou na fila de espera.', 'info')
  }

  const aulasNoDia  = useMemo(() => sortByHorario(aulasFiltered.filter(a => a.diasSemana.includes(selectedDay))), [aulasFiltered, selectedDay])
  const allHorarios = useMemo(() => [...new Set(aulasFiltered.map(a => a.horario))].sort(), [aulasFiltered])

  // Group aulas by period of day for the "Dia" view
  const periodGroups = useMemo(() => {
    const manha: Aula[] = []
    const tarde: Aula[] = []
    const noite: Aula[] = []
    aulasNoDia.forEach(a => {
      const hour = parseInt(a.horario.split(':')[0] || '0', 10)
      if (hour < 12) manha.push(a)
      else if (hour < 18) tarde.push(a)
      else noite.push(a)
    })
    return [
      { label: 'Manhã', icon: '☀', aulas: manha },
      { label: 'Tarde', icon: '◐', aulas: tarde },
      { label: 'Noite', icon: '☾', aulas: noite },
    ].filter(g => g.aulas.length > 0)
  }, [aulasNoDia])

  return (
    <div className="page-container pt-4 md:pt-5 pb-6">
      {/* Header: title stacks above seg-control on mobile; row on desktop */}
      <div className="pb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Aulas</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Escolha o dia e agende sua presença
          </p>
        </div>
        <div className="inline-flex ios-fill-1 rounded-full p-0.5 gap-0.5 self-start sm:self-auto">
          <SegBtn active={view === 'dia'} onClick={() => setView('dia')}>
            <CalendarCheck size={12} strokeWidth={2.2} /> Dia
          </SegBtn>
          <SegBtn active={view === 'semana'} onClick={() => setView('semana')}>
            <LayoutGrid size={12} strokeWidth={2.2} /> Semana
          </SegBtn>
          <SegBtn active={view === 'tipo'} onClick={() => setView('tipo')}>
            <Tag size={12} strokeWidth={2.2} /> Tipo
          </SegBtn>
        </div>
      </div>

      {/* Compact toolbar: week nav + filters inline */}
      {(view === 'dia' || view === 'semana') ? (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {/* Week nav — compact pill */}
          <div className="inline-flex items-center gap-0.5 ios-fill-2 rounded-full pl-0.5 pr-2 py-0.5 shrink-0">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-caption1 font-semibold text-ios-label dark:text-ios-dlabel px-1 tabular-nums whitespace-nowrap">
              {weekOffset === 0 ? 'Esta sem.' : weekOffset === 1 ? 'Próxima' : `+${weekOffset}`}
            </span>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => { setWeekOffset(0); setSelectedDay(getDefaultDay()) }}
                className="ml-1 text-caption1 font-semibold text-tint-500 hover:text-tint-600"
              >
                Hoje
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div
            data-tour="student-filtros"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0"
          >
            <PillSelect
              icon={<Tag size={11} strokeWidth={2.4} />}
              label="Modalidade"
              value={filterMod}
              onChange={v => setFilterMod(v as 'Todas' | ModalidadeType)}
              active={filterMod !== 'Todas'}
              options={[
                { value: 'Todas', label: 'Todas as modalidades' },
                ...modalidadesOpts.map(m => ({ value: m, label: m })),
              ]}
            />
            <PillSelect
              icon={<Clock size={11} strokeWidth={2.4} />}
              label="Horário"
              value={filterHorario}
              onChange={setFilterHorario}
              active={filterHorario !== 'Todos'}
              options={[{ value: 'Todos', label: 'Qualquer horário' }, ...horariosOpts.map(h => ({ value: h, label: h }))]}
            />
            <PillSelect
              icon={<User size={11} strokeWidth={2.4} />}
              label="Professor"
              value={filterProf}
              onChange={setFilterProf}
              active={filterProf !== 'Todos'}
              options={[{ value: 'Todos', label: 'Qualquer professor' }, ...profsOpts.map(p => ({ value: p.id, label: p.nome }))]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="shrink-0 text-caption1 font-semibold text-sys-red hover:bg-sys-red/10 px-2 py-1 rounded-full transition-colors inline-flex items-center gap-1"
              >
                <X size={11} strokeWidth={2.6} /> Limpar
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tipo view only shows filters */
        <div
          data-tour="student-filtros"
          className="mb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          <PillSelect
            icon={<Tag size={11} strokeWidth={2.4} />}
            label="Modalidade"
            value={filterMod}
            onChange={v => setFilterMod(v as 'Todas' | ModalidadeType)}
            active={filterMod !== 'Todas'}
            options={[
              { value: 'Todas', label: 'Todas as modalidades' },
              ...(['Pilates', 'Muay Thai', 'Spinning'] as ModalidadeType[]).map(m => ({ value: m, label: m })),
            ]}
          />
          <PillSelect
            icon={<User size={11} strokeWidth={2.4} />}
            label="Professor"
            value={filterProf}
            onChange={setFilterProf}
            active={filterProf !== 'Todos'}
            options={[{ value: 'Todos', label: 'Qualquer professor' }, ...profsOpts.map(p => ({ value: p.id, label: p.nome }))]}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 text-caption1 font-semibold text-sys-red hover:bg-sys-red/10 px-2 py-1 rounded-full transition-colors inline-flex items-center gap-1"
            >
              <X size={11} strokeWidth={2.6} /> Limpar
            </button>
          )}
        </div>
      )}

      {/* Compact day strip — row of chip pills, not big blocks */}
      {(view === 'dia' || view === 'semana') && (
        <div data-tour="student-dias" className="mb-3">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {weekDays.map(d => {
              const hasClasses = aulasFiltered.some(a => a.diasSemana.includes(d.name))
              const active = view === 'dia' && selectedDay === d.name
              return (
                <button
                  key={d.name}
                  onClick={() => { setSelectedDay(d.name); if (view === 'semana') setView('dia') }}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 relative ${
                    active
                      ? 'bg-tint-500 text-white shadow-tint-glow'
                      : d.isPast
                        ? 'ios-fill-3 text-ios-label-4 dark:text-ios-dlabel-4'
                        : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                  }`}
                >
                  <span className={`text-caption2 font-semibold uppercase tracking-wider ${d.isToday && !active ? 'text-tint-500' : ''}`}>
                    {d.abbrev}
                  </span>
                  <span className={`text-caption1 font-bold tabular-nums ${d.isToday && !active ? 'text-tint-500' : ''}`}>
                    {d.dayNum}
                  </span>
                  {hasClasses && !active && (
                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dismissible info notice (small inline, not a big banner) */}
      {!noticeDismissed && (
        <button
          onClick={() => setNoticeDismissed(true)}
          className="mb-3 w-full flex items-center gap-2 px-3 py-1.5 bg-tint-500/8 dark:bg-tint-500/12 text-tint-700 dark:text-tint-300 text-caption1 rounded-full"
        >
          <Info size={12} className="shrink-0" />
          <span className="flex-1 text-left truncate">Os horários são definidos pela academia. Você escolhe os dias.</span>
          <X size={12} className="shrink-0 opacity-60" />
        </button>
      )}

      {/* ── DIA view — grouped by period (Manhã/Tarde/Noite) ── */}
      {view === 'dia' && (
        <div data-tour="student-aulas-list" className="space-y-4">
          {aulasNoDia.length === 0 ? (
            <div className="ios-card flex flex-col items-center text-center py-12 px-6">
              <div className="w-12 h-12 rounded-full ios-fill-1 flex items-center justify-center mb-3">
                <SlidersHorizontal size={20} className="text-ios-label-3 dark:text-ios-dlabel-3" />
              </div>
              <p className="text-headline">Nenhuma aula encontrada</p>
              <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
                Tente ajustar os filtros ou selecione outro dia.
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 ios-btn-tinted">Limpar filtros</button>
              )}
            </div>
          ) : (
            periodGroups.map(group => (
              <section key={group.label}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                    {group.icon} {group.label}
                  </span>
                  <span className="text-caption2 text-ios-label-4 dark:text-ios-dlabel-4 tabular-nums">
                    · {group.aulas.length}
                  </span>
                  <div className="flex-1 h-px bg-ios-separator dark:bg-ios-dseparator ml-1" />
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.aulas.map(aula => (
                    <ClassCard
                      key={aula.id}
                      aula={aula}
                      dia={selectedDay}
                      userId={userId}
                      profNome={profNome(aula.professorId)}
                      onBook={() => handleBook(aula.id, selectedDay)}
                      onCancel={() => handleCancel(aula.id, selectedDay)}
                      onFullClick={() => setFullModal({ aula, dia: selectedDay })}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── SEMANA view ── */}
      {view === 'semana' && (
        <div className="overflow-x-auto">
          <div className="ios-card p-3 min-w-[640px]">
            <table className="min-w-full text-caption2 border-separate border-spacing-y-0">
              <thead>
                <tr>
                  <th className="w-12 pr-2 pb-2 text-left font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-wider">Hora</th>
                  {weekDays.map(d => (
                    <th
                      key={d.name}
                      className={`px-1 pb-2 text-center uppercase tracking-wider font-semibold ${
                        d.isToday ? 'text-tint-500' : 'text-ios-label-3 dark:text-ios-dlabel-3'
                      }`}
                    >
                      <div>{d.abbrev}</div>
                      <div className={`text-footnote font-bold mt-0.5 tabular-nums ${d.isToday ? 'text-tint-500' : 'text-ios-label dark:text-ios-dlabel'}`}>
                        {d.dayNum}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allHorarios.map(horario => (
                  <tr key={horario} className="align-top">
                    <td className="pr-2 py-1 text-ios-label-3 dark:text-ios-dlabel-3 font-mono tabular-nums text-caption2 whitespace-nowrap pt-2">
                      {horario}
                    </td>
                    {weekDays.map(d => {
                      const aulasDia = aulasFiltered.filter(a => a.horario === horario && a.diasSemana.includes(d.name))
                      return (
                        <td key={d.name} className="px-0.5 py-0.5 min-w-[62px]">
                          {aulasDia.map(aula => {
                            const totalVag = Number(aula.vagasTotais) || 0
                            const vagas    = Math.max(0, totalVag - getBookingDia(aula, d.name).inscritos.length)
                            const inscrito = isInscritoDia(aula, d.name, userId)
                            const naFila   = isNaFilaDia(aula, d.name, userId)
                            const full     = vagas <= 0
                            const accent   = modalidadeAccent(aula.modalidade)
                            return (
                              <button
                                key={aula.id}
                                onClick={() => inscrito ? handleCancel(aula.id, d.name) : handleBook(aula.id, d.name)}
                                disabled={d.isPast}
                                title={`${aula.modalidade} ${aula.horario} — ${d.name}`}
                                className={`w-full text-left rounded-ios-sm p-1.5 mb-0.5 leading-none transition-all ${
                                  d.isPast ? 'opacity-30 cursor-default' : 'hover:scale-[1.02]'
                                }`}
                                style={{
                                  background: inscrito ? `${accent}22` : full ? 'rgba(120,120,128,0.1)' : naFila ? 'rgba(255,149,0,0.18)' : `${accent}14`,
                                  boxShadow: inscrito
                                    ? `inset 0 0 0 1px ${accent}66`
                                    : naFila ? `inset 0 0 0 1px #FF9500` : undefined,
                                  color: inscrito || !full ? accent : naFila ? '#FF9500' : 'rgba(60,60,67,0.4)',
                                }}
                              >
                                <div className="font-bold text-caption2">{aula.modalidade === 'Muay Thai' ? 'Muay' : aula.modalidade}</div>
                                <div className="opacity-70 text-caption2 mt-0.5 tabular-nums">
                                  {vagas > 0 ? `${vagas}v` : 'lot.'}
                                </div>
                              </button>
                            )
                          })}
                          {aulasDia.length === 0 && (
                            <div className="text-ios-label-4 dark:text-ios-dlabel-4 text-center text-caption2 py-1">·</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TIPO view ── */}
      {view === 'tipo' && (
        <div className="space-y-6">
          {modalidadesOpts
            .filter(mod => filterMod === 'Todas' || filterMod === mod)
            .map(mod => {
              const aulas = sortByHorario(aulasFiltered.filter(a => a.modalidade === mod))
              if (aulas.length === 0) return null
              const accent = modalidadeAccent(mod)
              const gradient = modalidadeGradient(mod)
              return (
                <section key={mod}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: gradient }} />
                    <h2 className="text-title3" style={{ color: accent }}>{mod}</h2>
                    <span className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3">
                      · {aulas.length} turma{aulas.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ios-card overflow-hidden">
                    {aulas.map(aula => {
                      const totalVag = Number(aula.vagasTotais) || 0
                      return (
                        <div key={aula.id} className="ios-list-row px-4 py-3">
                          <div className="flex items-center gap-3 text-callout text-ios-label dark:text-ios-dlabel mb-2.5">
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                              <Clock size={12} className="text-ios-label-2 dark:text-ios-dlabel-2" />
                              <span className="tabular-nums">{aula.horario}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-ios-label-2 dark:text-ios-dlabel-2">
                              <User size={12} />{profNome(aula.professorId)}
                            </span>
                            <span className="text-ios-label-3 dark:text-ios-dlabel-3 text-caption1 ml-auto">
                              {totalVag} vagas/dia
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {aula.diasSemana.map(dia => {
                              const vagas    = Math.max(0, totalVag - getBookingDia(aula, dia).inscritos.length)
                              const inscrito = isInscritoDia(aula, dia, userId)
                              const naFila   = isNaFilaDia(aula, dia, userId)
                              const full     = vagas <= 0 && !inscrito
                              return (
                                <button
                                  key={dia}
                                  onClick={() => {
                                    if (inscrito) return handleCancel(aula.id, dia)
                                    if (naFila) return handleCancel(aula.id, dia)
                                    handleBook(aula.id, dia)
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-caption1 font-semibold transition-all active:scale-[0.96]"
                                  style={{
                                    background: inscrito ? gradient : naFila ? 'rgba(255,149,0,0.18)' : full ? 'rgba(120,120,128,0.14)' : 'rgba(120,120,128,0.1)',
                                    color: inscrito ? '#fff' : naFila ? '#FF9500' : full ? 'rgba(60,60,67,0.4)' : 'inherit',
                                    boxShadow: inscrito
                                      ? `0 4px 12px ${accent}44`
                                      : naFila ? 'inset 0 0 0 1px #FF9500' : undefined,
                                  }}
                                >
                                  {dia.slice(0, 3)}
                                  <span className="opacity-80 text-caption2 tabular-nums">
                                    {inscrito ? ' ×' : naFila ? ' fila' : full ? ' lot.' : ` ${vagas}v`}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
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
            <div className="flex items-start gap-2.5 p-3 ios-fill-2 rounded-ios">
              <Info size={14} className="text-ios-label-2 dark:text-ios-dlabel-2 shrink-0 mt-0.5" />
              <p className="text-footnote text-ios-label dark:text-ios-dlabel">
                {fullModal.aula.modalidade} às {fullModal.aula.horario} — {fullModal.dia} está lotada.
                {getBookingDia(fullModal.aula, fullModal.dia).filaEspera.length > 0 &&
                  ` ${getBookingDia(fullModal.aula, fullModal.dia).filaEspera.length} na fila.`}
              </p>
            </div>
            {!isNaFilaDia(fullModal.aula, fullModal.dia, userId) && (
              <button
                onClick={() => { handleWaitlist(fullModal.aula.id, fullModal.dia); setFullModal(null) }}
                className="w-full ios-btn-tinted !rounded-ios !py-3"
              >
                Entrar na fila de espera
              </button>
            )}
            {(() => {
              const alts = data.aulas.filter(a =>
                a.id !== fullModal.aula.id &&
                a.diasSemana.includes(fullModal.dia) &&
                (a.modalidade === fullModal.aula.modalidade || a.professorId === fullModal.aula.professorId) &&
                getVagasDisponiveisDia(a, fullModal.dia) > 0,
              )
              if (alts.length === 0) return null
              return (
                <div>
                  <p className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-wider mb-2">
                    Alternativos disponíveis
                  </p>
                  <div className="ios-card-flat overflow-hidden">
                    {alts.map(alt => {
                      const accent = modalidadeAccent(alt.modalidade)
                      return (
                        <div key={alt.id} className="ios-list-row flex items-center justify-between p-3">
                          <div className="min-w-0">
                            <span className="inline-flex items-center gap-1 text-caption1 font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${accent}18`, color: accent }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                              {alt.modalidade}
                            </span>
                            <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1 flex items-center gap-1">
                              <Clock size={10} />
                              <span className="tabular-nums">{alt.horario}</span>
                              <span>·</span>
                              <span>{getVagasDisponiveisDia(alt, fullModal.dia)} vagas</span>
                            </p>
                          </div>
                          <button
                            onClick={() => { handleBook(alt.id, fullModal.dia); setFullModal(null) }}
                            className="ios-btn-primary !py-1.5 !text-caption1"
                          >
                            Agendar
                          </button>
                        </div>
                      )
                    })}
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
