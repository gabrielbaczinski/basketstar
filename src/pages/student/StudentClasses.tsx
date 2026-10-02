import { useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, ChevronDown, Info, Clock, User, CalendarCheck,
  LayoutGrid, Tag, SlidersHorizontal, X, Check, Users as UsersIcon, Flame,
  Hourglass, Calendar as CalendarIcon,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import { getBookingDia, getVagasDisponiveisDia, isInscritoDia, isNaFilaDia } from '../../utils/aulaUtils'
import { useToast } from '../../context/ToastContext'
import { modalidadeAccent, modalidadeGradient } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const DIAS_ABREV = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MESES_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
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
      monthLong: MESES_LONG[date.getMonth()],
      isToday: date.getTime() === today.getTime(),
      isPast: date.getTime() < today.getTime(),
    }
  })
}

type WeekDay = ReturnType<typeof getWeekDays>[number]

function getDefaultDay(): string {
  const map = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const name = map[new Date().getDay()]
  return name === 'Domingo' ? 'Segunda' : name
}

function sortByHorario(aulas: Aula[]) {
  return [...aulas].sort((a, b) => a.horario.localeCompare(b.horario))
}

/* ───────────────────────────── Filter select (native) ───────────────────────────── */

interface Option { value: string; label: string }

function FilterSelect({
  value, onChange, options, active,
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  active: boolean
}) {
  return (
    <div className={`relative shrink-0 rounded-full transition-all ${active ? 'bg-tint-500/10 ring-1 ring-tint-500' : 'ios-fill-2'}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1.5 text-caption1 font-semibold bg-transparent border-none outline-none cursor-pointer text-ios-label dark:text-ios-dlabel"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={11}
        strokeWidth={2.5}
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${active ? 'text-tint-500' : 'text-ios-label-2 dark:text-ios-dlabel-2'}`}
      />
    </div>
  )
}

/* ─────────────────────── Class card (grid cell) ──────────────────────────────── */

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
      className="group relative ios-card overflow-hidden transition-all hover:shadow-ios-3 sm:hover:-translate-y-0.5 border-l-[3px] border-l-[3px] brand-border-l"
      style={{ boxShadow: ringShadow }}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full shrink-0" style={{ background: gradient }} />

      {/* ── MOBILE layout (horizontal row) ── */}
      <div className="sm:hidden flex items-center gap-3 p-3 min-w-0">
        {/* Time + day block */}
        <div className="shrink-0 w-[64px]">
          <p className="text-footnote font-semibold tabular-nums text-ios-label-2 dark:text-ios-dlabel-2 leading-none">
            {aula.horario}
          </p>
          <p className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5 truncate">
            {dia}
          </p>
        </div>
        {/* Middle: modality + professor + inline count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-callout font-bold tracking-tight truncate" style={{ color: accent }}>
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
          <span className="text-callout font-bold tracking-tight truncate min-w-0" style={{ color: accent }}>
            {aula.modalidade}
          </span>
          {statusChip}
        </div>

        {/* Row 2 — time (secondary) */}
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-subhead font-semibold tabular-nums text-ios-label-2 dark:text-ios-dlabel-2 leading-none">
            {aula.horario}
          </p>
          <span className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 truncate">
            {dia}
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

/* ─────────────── Mini card used inside the week view columns ─────────────── */

function WeekMiniCard({
  aula, dia, userId, onClick,
}: {
  aula: Aula; dia: string; userId: string; onClick: () => void
}) {
  const booking  = getBookingDia(aula, dia)
  const totalVag = Number(aula.vagasTotais) || 0
  const vagas    = Math.max(0, totalVag - booking.inscritos.length)
  const inscrito = isInscritoDia(aula, dia, userId)
  const naFila   = isNaFilaDia(aula, dia, userId)
  const full     = vagas <= 0 && !inscrito
  const accent   = modalidadeAccent(aula.modalidade)

  const statusLabel = inscrito ? 'Inscrito' : naFila ? 'Na fila' : full ? 'Lotada' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`
  const statusColor = inscrito ? 'text-sys-green' : naFila ? 'text-sys-orange' : full ? 'text-sys-red' : 'text-ios-label-3 dark:text-ios-dlabel-3'

  return (
    <button
      onClick={onClick}
      className="w-full text-left relative ios-card-flat overflow-hidden transition-all active:scale-[0.98] hover:shadow-ios-2 flex"
    >
      {/* Left accent bar */}
      <div className="w-1 shrink-0 self-stretch" style={{ background: accent }} />
      <div className="flex-1 min-w-0 p-2">
        <p className="text-callout font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none">
          {aula.horario}
        </p>
        <p className="text-caption1 font-semibold truncate mt-1" style={{ color: accent }}>
          {aula.modalidade}
        </p>
        <p className={`text-caption2 font-semibold mt-0.5 tabular-nums ${statusColor}`}>
          {statusLabel}
        </p>
      </div>
    </button>
  )
}

/* ─────────────────────── Desktop list row (day view) ─────────────────────── */

function DesktopListRow({
  aula, dia, userId, profNome, onBook, onCancel, onFullClick,
}: {
  aula: Aula; dia: string; userId: string; profNome: string
  onBook: () => void; onCancel: () => void; onFullClick: () => void
}) {
  const booking  = getBookingDia(aula, dia)
  const totalVag = Number(aula.vagasTotais) || 0
  const vagas    = Math.max(0, totalVag - booking.inscritos.length)
  const inscrito = isInscritoDia(aula, dia, userId)
  const naFila   = isNaFilaDia(aula, dia, userId)
  const full     = vagas <= 0 && !inscrito
  const pct      = totalVag > 0 ? booking.inscritos.length / totalVag : 0
  const accent   = modalidadeAccent(aula.modalidade)
  const trending = pct >= 0.75 && pct < 1
  const filaPos  = naFila ? booking.filaEspera.indexOf(userId) + 1 : 0

  const statusChip = inscrito ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-green/14 text-sys-green text-caption2 font-bold rounded-full leading-none whitespace-nowrap">
      <Check size={9} strokeWidth={3} /> Inscrito
    </span>
  ) : naFila ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-orange/18 text-sys-orange text-caption2 font-bold rounded-full leading-none whitespace-nowrap">
      <Hourglass size={9} strokeWidth={2.6} /> Fila {filaPos}º
    </span>
  ) : trending ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-orange/14 text-sys-orange text-caption2 font-bold rounded-full leading-none whitespace-nowrap">
      <Flame size={9} strokeWidth={2.6} /> Alta
    </span>
  ) : null

  const actionBtn = inscrito ? (
    <button onClick={onCancel} className="text-caption1 font-semibold text-sys-red hover:bg-sys-red/10 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
      Cancelar
    </button>
  ) : naFila ? (
    <button onClick={onCancel} className="text-caption1 font-semibold text-sys-orange hover:bg-sys-orange/10 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
      Sair da fila
    </button>
  ) : full ? (
    <button onClick={onFullClick} className="ios-btn-gray !py-1.5 !text-caption1 !px-3 whitespace-nowrap">
      Fila de espera
    </button>
  ) : (
    <button onClick={onBook} className="ios-btn-primary !py-1.5 !text-caption1 !px-3 whitespace-nowrap">
      Agendar
    </button>
  )

  const leftAccent = inscrito ? accent : naFila ? '#FF9500' : 'var(--brand)'

  return (
    <article
      className="ios-list-row flex items-center gap-4 px-4 py-3 min-h-[52px] hover:bg-ios-fill-3 dark:hover:bg-white/[0.04] transition-colors"
      style={{ boxShadow: `inset 3px 0 0 ${leftAccent}` }}
    >
      {/* Modalidade */}
      <div className="w-36 shrink-0 min-w-0">
        <p className="text-callout font-bold truncate" style={{ color: accent }}>{aula.modalidade}</p>
      </div>
      {/* Horário */}
      <div className="w-14 shrink-0">
        <p className="text-footnote font-semibold tabular-nums text-ios-label dark:text-ios-dlabel">{aula.horario}</p>
      </div>
      {/* Professor */}
      <div className="flex-1 min-w-0">
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 flex items-center gap-1 truncate">
          <User size={11} className="opacity-70 shrink-0" />
          <span className="truncate">{profNome}</span>
        </p>
      </div>
      {/* Ocupação */}
      <div className="w-36 shrink-0 space-y-1">
        <div className="flex items-center justify-between text-caption2 tabular-nums">
          <span className="flex items-center gap-1 text-ios-label-3 dark:text-ios-dlabel-3">
            <UsersIcon size={10} className="opacity-70" /> {booking.inscritos.length}/{totalVag}
          </span>
          <span className={`font-semibold ${full ? 'text-sys-red' : vagas <= 3 ? 'text-sys-orange' : 'text-ios-label-3 dark:text-ios-dlabel-3'}`}>
            {full ? 'Lotada' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="h-[3px] rounded-full ios-fill-2 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 100, 100)}%`, background: pct >= 1 ? '#FF3B30' : pct >= 0.8 ? '#FF9500' : '#34C759' }} />
        </div>
      </div>
      {/* Status + Ação */}
      <div className="shrink-0 flex items-center gap-2 min-w-[200px] justify-end">
        {statusChip}
        {actionBtn}
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
  const [confirmModal, setConfirmModal] = useState<{ aula: Aula; dia: string; kind: 'book' | 'cancel' | 'waitlist' } | null>(null)
  const [dayPickerOpen, setDayPickerOpen] = useState(false)
  const [noticeDismissed, setNoticeDismissed] = useState(false)

  const userId = currentUser?.id ?? ''
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset])
  const profNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? id

  const modalidadesOpts = useMemo(() => [...new Set(data.aulas.map(a => a.modalidade))].filter(Boolean).sort(), [data.aulas])
  const horariosOpts = useMemo(() => [...new Set(data.aulas.map(a => a.horario))].sort(), [data.aulas])
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

  const selectedWeekDay = useMemo(() => weekDays.find(d => d.name === selectedDay), [weekDays, selectedDay])
  const selectedDayLabel = selectedWeekDay
    ? `${selectedDay}, ${selectedWeekDay.dayNum} de ${selectedWeekDay.monthLong}`
    : selectedDay

  const bookingDescription = (dia: string) => {
    const wd = weekDays.find(d => d.name === dia)
    return wd ? `${dia}, ${wd.dayNum} de ${wd.monthLong}` : dia
  }

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
    else if (res === 'conflict') showToast('Você já tem outra aula neste mesmo horário.', 'warning')
    else if (res === 'full') setFullModal({ aula, dia })
  }

  const handleCancel = (aulaId: string, dia: string) => {
    const aula = data.aulas.find(a => a.id === aulaId)!
    const res = cancelClassDia(aulaId, dia)
    if (res === 'ok') showToast(`${aula.modalidade} — ${dia} cancelada.`, 'warning')
    else if (res === 'removed_from_waitlist') showToast(`Saiu da fila de ${aula.modalidade} — ${dia}.`, 'info')
    else if (res === 'too_late') showToast(
      `Prazo encerrado — cancelamentos até ${data.configuracoes.tempoLimiteCancelamentoMinutos} min antes da aula.`,
      'warning',
    )
  }

  const handleWaitlist = (aulaId: string, dia: string) => {
    joinWaitlistDia(aulaId, dia)
    showToast('Você entrou na fila de espera.', 'info')
  }

  // Request handlers — route through confirmation modal.
  const requestBook = (aula: Aula, dia: string) => {
    const vagas = getVagasDisponiveisDia(aula, dia)
    const inscrito = isInscritoDia(aula, dia, userId)
    const naFila = isNaFilaDia(aula, dia, userId)
    if (vagas <= 0 && !inscrito && !naFila) {
      setConfirmModal({ aula, dia, kind: 'waitlist' })
    } else {
      setConfirmModal({ aula, dia, kind: 'book' })
    }
  }
  const requestCancel = (aula: Aula, dia: string) => {
    setConfirmModal({ aula, dia, kind: 'cancel' })
  }

  const aulasNoDia = useMemo(
    () => sortByHorario(aulasFiltered.filter(a => a.diasSemana.includes(selectedDay))),
    [aulasFiltered, selectedDay],
  )

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

  // State for the Semana view: tap a mini card -> open details modal
  const [weekDetails, setWeekDetails] = useState<{ aula: Aula; dia: string } | null>(null)

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
            <Tag size={12} strokeWidth={2.2} /> Por aulas
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
            <FilterSelect
              value={filterMod}
              onChange={v => setFilterMod(v as 'Todas' | ModalidadeType)}
              active={filterMod !== 'Todas'}
              options={[
                { value: 'Todas', label: 'Modalidade' },
                ...modalidadesOpts.map(m => ({ value: m, label: m })),
              ]}
            />
            <FilterSelect
              value={filterHorario}
              onChange={setFilterHorario}
              active={filterHorario !== 'Todos'}
              options={[
                { value: 'Todos', label: 'Horário' },
                ...horariosOpts.map(h => ({ value: h, label: h })),
              ]}
            />
            <FilterSelect
              value={filterProf}
              onChange={setFilterProf}
              active={filterProf !== 'Todos'}
              options={[
                { value: 'Todos', label: 'Professor' },
                ...profsOpts.map(p => ({ value: p.id, label: p.nome })),
              ]}
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
          <FilterSelect
            value={filterMod}
            onChange={v => setFilterMod(v as 'Todas' | ModalidadeType)}
            active={filterMod !== 'Todas'}
            options={[
              { value: 'Todas', label: 'Modalidade' },
              ...modalidadesOpts.map(m => ({ value: m, label: m })),
            ]}
          />
          <FilterSelect
            value={filterProf}
            onChange={setFilterProf}
            active={filterProf !== 'Todos'}
            options={[
              { value: 'Todos', label: 'Professor' },
              ...profsOpts.map(p => ({ value: p.id, label: p.nome })),
            ]}
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

      {/* ── Day picker: full-width button on mobile, pills on desktop ── */}
      {(view === 'dia' || view === 'semana') && (
        <div data-tour="student-dias" className="mb-3">
          {/* Mobile: large button opens day-picker modal */}
          <button
            onClick={() => setDayPickerOpen(true)}
            className="sm:hidden w-full flex items-center gap-3 px-4 py-3 ios-card active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-tint-500/14 text-tint-600 dark:text-tint-300 flex items-center justify-center shrink-0">
              <CalendarIcon size={16} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                {weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : `Semana +${weekOffset}`}
              </p>
              <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel truncate">
                {selectedDayLabel}
              </p>
            </div>
            <ChevronDown size={16} className="text-ios-label-3 dark:text-ios-dlabel-3 shrink-0" />
          </button>

          {/* Desktop: segmented pills with full day name + date */}
          <div className="hidden sm:flex gap-1.5 overflow-x-auto no-scrollbar">
            {weekDays.map(d => {
              const hasClasses = aulasFiltered.some(a => a.diasSemana.includes(d.name))
              const active = view === 'dia' && selectedDay === d.name
              return (
                <button
                  key={d.name}
                  onClick={() => { setSelectedDay(d.name); if (view === 'semana') setView('dia') }}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-tint-500 text-white'
                      : d.isPast
                        ? 'ios-fill-3 text-ios-label-4 dark:text-ios-dlabel-4'
                        : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                  }`}
                >
                  <span className={`text-caption1 font-semibold ${d.isToday && !active ? 'text-tint-500' : ''}`}>
                    {d.name}
                  </span>
                  <span className={`text-caption1 font-bold tabular-nums opacity-80 ${d.isToday && !active ? 'text-tint-500' : ''}`}>
                    · {d.dayNum}
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
                {/* Mobile: stacked cards */}
                <div className="sm:hidden space-y-2">
                  {group.aulas.map(aula => (
                    <ClassCard
                      key={aula.id}
                      aula={aula}
                      dia={selectedDay}
                      userId={userId}
                      profNome={profNome(aula.professorId)}
                      onBook={() => requestBook(aula, selectedDay)}
                      onCancel={() => requestCancel(aula, selectedDay)}
                      onFullClick={() => setFullModal({ aula, dia: selectedDay })}
                    />
                  ))}
                </div>
                {/* Desktop: scannable list */}
                <div className="hidden sm:block ios-card overflow-hidden">
                  {group.aulas.map(aula => (
                    <DesktopListRow
                      key={aula.id}
                      aula={aula}
                      dia={selectedDay}
                      userId={userId}
                      profNome={profNome(aula.professorId)}
                      onBook={() => requestBook(aula, selectedDay)}
                      onCancel={() => requestCancel(aula, selectedDay)}
                      onFullClick={() => setFullModal({ aula, dia: selectedDay })}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── SEMANA view (7 columns of days with mini cards) ── */}
      {view === 'semana' && (
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))' }}>
            {weekDays.map(d => {
              const aulasDoDia = sortByHorario(
                aulasFiltered.filter(a => a.diasSemana.includes(d.name)),
              )
              return (
                <section
                  key={d.name}
                  className={`ios-card flex flex-col ${d.isPast ? 'opacity-60' : ''}`}
                >
                  <header className={`px-3 py-2.5 hairline-b ${d.isToday ? 'bg-tint-500/8' : ''}`}>
                    <p className={`text-footnote font-semibold leading-tight ${d.isToday ? 'text-tint-600 dark:text-tint-300' : 'text-ios-label dark:text-ios-dlabel'}`}>
                      {d.name}
                    </p>
                    <p className={`text-caption1 tabular-nums mt-0.5 ${d.isToday ? 'text-tint-500' : 'text-ios-label-3 dark:text-ios-dlabel-3'}`}>
                      {d.dayNum} de {d.monthLong}
                    </p>
                  </header>
                  <div className="p-2 flex flex-col gap-1.5 flex-1">
                    {aulasDoDia.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-6">
                        <span className="text-caption2 text-ios-label-4 dark:text-ios-dlabel-4">—</span>
                      </div>
                    ) : (
                      aulasDoDia.map(aula => (
                        <WeekMiniCard
                          key={aula.id}
                          aula={aula}
                          dia={d.name}
                          userId={userId}
                          onClick={() => setWeekDetails({ aula, dia: d.name })}
                        />
                      ))
                    )}
                  </div>
                </section>
              )
            })}
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
                                    if (inscrito || naFila) return requestCancel(aula, dia)
                                    requestBook(aula, dia)
                                  }}
                                  title={inscrito ? 'Cancelar inscrição' : naFila ? 'Sair da fila de espera' : full ? 'Aula lotada — entrar na fila de espera' : 'Agendar esta aula'}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-caption1 font-semibold transition-all active:scale-[0.96] cursor-pointer"
                                  style={{
                                    background: inscrito ? gradient : naFila ? 'rgba(255,149,0,0.18)' : full ? 'rgba(120,120,128,0.14)' : 'rgba(120,120,128,0.1)',
                                    color: inscrito ? '#fff' : naFila ? '#FF9500' : full ? 'rgba(60,60,67,0.4)' : 'inherit',
                                    boxShadow: inscrito
                                      ? `0 4px 12px ${accent}44`
                                      : naFila ? 'inset 0 0 0 1px #FF9500' : undefined,
                                  }}
                                >
                                  {dia}
                                  <span className="opacity-80 text-caption2 tabular-nums">
                                    {inscrito ? ' ×' : naFila ? ' fila' : full ? ' lot.' : ` ${vagas} vaga${vagas !== 1 ? 's' : ''}`}
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

      {/* ── Day-picker modal (mobile) ── */}
      {dayPickerOpen && (
        <DayPickerModal
          weekDays={weekDays}
          selectedDay={selectedDay}
          weekOffset={weekOffset}
          onSelect={(name) => { setSelectedDay(name); setDayPickerOpen(false) }}
          onPrevWeek={() => setWeekOffset(o => o - 1)}
          onNextWeek={() => setWeekOffset(o => o + 1)}
          onClose={() => setDayPickerOpen(false)}
        />
      )}

      {/* ── Confirmation modal (book / cancel / waitlist) ── */}
      {confirmModal && (
        <ConfirmationModal
          aula={confirmModal.aula}
          dia={confirmModal.dia}
          kind={confirmModal.kind}
          profNome={profNome(confirmModal.aula.professorId)}
          dayLabel={bookingDescription(confirmModal.dia)}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => {
            const { aula, dia, kind } = confirmModal
            if (kind === 'book') handleBook(aula.id, dia)
            else if (kind === 'cancel') handleCancel(aula.id, dia)
            else if (kind === 'waitlist') handleWaitlist(aula.id, dia)
            setConfirmModal(null)
          }}
        />
      )}

      {/* ── Week-view details modal ── */}
      {weekDetails && (
        <ClassDetailsModal
          aula={weekDetails.aula}
          dia={weekDetails.dia}
          userId={userId}
          profNome={profNome(weekDetails.aula.professorId)}
          dayLabel={bookingDescription(weekDetails.dia)}
          onClose={() => setWeekDetails(null)}
          onBook={() => { requestBook(weekDetails.aula, weekDetails.dia); setWeekDetails(null) }}
          onCancel={() => { requestCancel(weekDetails.aula, weekDetails.dia); setWeekDetails(null) }}
          onWaitlist={() => { handleWaitlist(weekDetails.aula.id, weekDetails.dia); setWeekDetails(null) }}
        />
      )}

      {/* Full class modal (shows alternatives) */}
      {fullModal && (
        <Modal open={!!fullModal} title="Aula lotada" onClose={() => setFullModal(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 ios-fill-2 rounded-ios">
              <Info size={14} className="text-ios-label-2 dark:text-ios-dlabel-2 shrink-0 mt-0.5" />
              <p className="text-footnote text-ios-label dark:text-ios-dlabel">
                {fullModal.aula.modalidade} às {fullModal.aula.horario} — {bookingDescription(fullModal.dia)} está lotada.
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

/* ─────────────────────── Day-picker modal (mobile) ─────────────────────── */

function DayPickerModal({
  weekDays, selectedDay, weekOffset, onSelect, onPrevWeek, onNextWeek, onClose,
}: {
  weekDays: WeekDay[]
  selectedDay: string
  weekOffset: number
  onSelect: (name: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onClose: () => void
}) {
  const weekLabel = weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : weekOffset < 0 ? `Semana ${weekOffset}` : `Semana +${weekOffset}`
  return (
    <Modal open onClose={onClose} title="Escolher dia">
      <div className="space-y-4">
        {/* Week navigator */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onPrevWeek}
            className="w-9 h-9 rounded-full ios-fill-2 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel">
            {weekLabel}
          </p>
          <button
            onClick={onNextWeek}
            className="w-9 h-9 rounded-full ios-fill-2 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2"
            aria-label="Próxima semana"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_ABREV.map(abbr => (
            <p
              key={abbr}
              className="text-center text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3"
            >
              {abbr}
            </p>
          ))}
          {weekDays.map(d => {
            const active = selectedDay === d.name
            return (
              <button
                key={d.name}
                onClick={() => onSelect(d.name)}
                className={`aspect-square rounded-ios flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.96] ${
                  active
                    ? 'bg-tint-500 text-white'
                    : d.isPast
                      ? 'ios-fill-3 text-ios-label-4 dark:text-ios-dlabel-4'
                      : 'ios-fill-2 text-ios-label dark:text-ios-dlabel'
                }`}
              >
                <span className={`text-title3 font-bold tabular-nums leading-none ${d.isToday && !active ? 'text-tint-500' : ''}`}>
                  {d.dayNum}
                </span>
                <span className="text-caption2 opacity-70">
                  {d.monthShort}
                </span>
              </button>
            )
          })}
        </div>

        {/* Full-name list below the grid */}
        <div className="ios-card-flat overflow-hidden">
          {weekDays.map(d => {
            const active = selectedDay === d.name
            return (
              <button
                key={d.name}
                onClick={() => onSelect(d.name)}
                className="w-full ios-list-row flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  active ? 'bg-tint-500 text-white' : 'ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2'
                }`}>
                  <span className="text-caption1 font-bold tabular-nums">{d.dayNum}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-callout font-semibold leading-tight ${active ? 'text-tint-600 dark:text-tint-300' : 'text-ios-label dark:text-ios-dlabel'}`}>
                    {d.name}
                  </p>
                  <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
                    {d.dayNum} de {d.monthLong}{d.isToday ? ' · hoje' : ''}
                  </p>
                </div>
                {active && <Check size={16} strokeWidth={2.6} className="text-tint-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

/* ─────────────────────── Confirmation modal ─────────────────────── */

function ConfirmationModal({
  aula, dia, kind, profNome, dayLabel, onClose, onConfirm,
}: {
  aula: Aula
  dia: string
  kind: 'book' | 'cancel' | 'waitlist'
  profNome: string
  dayLabel: string
  onClose: () => void
  onConfirm: () => void
}) {
  const booking  = getBookingDia(aula, dia)
  const totalVag = Number(aula.vagasTotais) || 0
  const accent   = modalidadeAccent(aula.modalidade)
  const gradient = modalidadeGradient(aula.modalidade)

  const copy = kind === 'book'
    ? { title: 'Confirmar agendamento', confirm: 'Confirmar agendamento', confirmCls: 'ios-btn-primary' }
    : kind === 'waitlist'
      ? { title: 'Entrar na fila de espera?', confirm: 'Entrar na fila', confirmCls: 'ios-btn-tinted' }
      : { title: 'Cancelar inscrição?', confirm: 'Cancelar inscrição', confirmCls: 'ios-btn-primary' }

  const confirmStyle = kind === 'cancel'
    ? { background: '#FF3B30', color: '#fff', boxShadow: '0 4px 14px rgba(255,59,48,0.32)' } as const
    : undefined

  return (
    <Modal open onClose={onClose} title={copy.title}>
      <div className="space-y-4">
        {/* Hero card */}
        <div className="ios-card-flat overflow-hidden">
          <div className="h-1" style={{ background: gradient }} />
          <div className="p-4 space-y-2.5">
            <span
              className="inline-flex items-center gap-1.5 text-caption1 font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${accent}18`, color: accent }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
              {aula.modalidade}
            </span>
            <p className="text-title2 font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none">
              {aula.horario}
            </p>
            <p className="text-callout text-ios-label-2 dark:text-ios-dlabel-2">
              {dayLabel}
            </p>
            <div className="pt-2 grid grid-cols-2 gap-2 text-caption1">
              <div className="flex items-center gap-1.5 text-ios-label-2 dark:text-ios-dlabel-2">
                <User size={12} className="opacity-70" />
                <span className="truncate">{profNome}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ios-label-2 dark:text-ios-dlabel-2">
                <UsersIcon size={12} className="opacity-70" />
                <span className="tabular-nums">
                  {booking.inscritos.length}/{totalVag} vagas
                </span>
              </div>
            </div>
            {kind === 'waitlist' && booking.filaEspera.length > 0 && (
              <p className="text-caption1 text-sys-orange flex items-center gap-1 pt-1">
                <Hourglass size={11} /> {booking.filaEspera.length} aluno{booking.filaEspera.length !== 1 ? 's' : ''} na fila
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="flex-1 ios-btn-gray !py-3">
            {kind === 'cancel' ? 'Voltar' : 'Cancelar'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${copy.confirmCls} !py-3`}
            style={confirmStyle}
          >
            {copy.confirm}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ─────────────────────── Class details modal (week view) ─────────────────────── */

function ClassDetailsModal({
  aula, dia, userId, profNome, dayLabel, onClose, onBook, onCancel, onWaitlist,
}: {
  aula: Aula
  dia: string
  userId: string
  profNome: string
  dayLabel: string
  onClose: () => void
  onBook: () => void
  onCancel: () => void
  onWaitlist: () => void
}) {
  const booking  = getBookingDia(aula, dia)
  const totalVag = Number(aula.vagasTotais) || 0
  const vagas    = Math.max(0, totalVag - booking.inscritos.length)
  const inscrito = isInscritoDia(aula, dia, userId)
  const naFila   = isNaFilaDia(aula, dia, userId)
  const full     = vagas <= 0 && !inscrito
  const pct      = totalVag > 0 ? booking.inscritos.length / totalVag : 0
  const accent   = modalidadeAccent(aula.modalidade)
  const gradient = modalidadeGradient(aula.modalidade)

  return (
    <Modal open onClose={onClose} title="Detalhes da aula">
      <div className="space-y-4">
        <div className="ios-card-flat overflow-hidden">
          <div className="h-1" style={{ background: gradient }} />
          <div className="p-4 space-y-3">
            <span
              className="inline-flex items-center gap-1.5 text-caption1 font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${accent}18`, color: accent }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
              {aula.modalidade}
            </span>
            <div>
              <p className="text-title1 font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none">
                {aula.horario}
              </p>
              <p className="text-callout text-ios-label-2 dark:text-ios-dlabel-2 mt-1.5">
                {dayLabel}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-caption1 pt-1">
              <div className="flex items-center gap-1.5 text-ios-label-2 dark:text-ios-dlabel-2">
                <User size={12} className="opacity-70" />
                <span className="truncate">{profNome}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ios-label-2 dark:text-ios-dlabel-2">
                <UsersIcon size={12} className="opacity-70" />
                <span className="tabular-nums">{booking.inscritos.length}/{totalVag} vagas</span>
              </div>
            </div>
            <div className="h-[3px] rounded-full ios-fill-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(pct * 100, 100)}%`,
                  background: pct >= 1 ? '#FF3B30' : pct >= 0.8 ? '#FF9500' : '#34C759',
                }}
              />
            </div>
            {inscrito && (
              <p className="text-caption1 text-sys-green flex items-center gap-1">
                <Check size={11} strokeWidth={3} /> Você está inscrito nesta aula
              </p>
            )}
            {naFila && (
              <p className="text-caption1 text-sys-orange flex items-center gap-1">
                <Hourglass size={11} /> Você está na fila de espera
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="flex-1 ios-btn-gray !py-3">
            Fechar
          </button>
          {inscrito || naFila ? (
            <button
              onClick={onCancel}
              className="flex-1 ios-btn-primary !py-3"
              style={{ background: '#FF3B30', boxShadow: '0 4px 14px rgba(255,59,48,0.32)' }}
            >
              {inscrito ? 'Cancelar inscrição' : 'Sair da fila'}
            </button>
          ) : full ? (
            <button onClick={onWaitlist} className="flex-1 ios-btn-tinted !py-3">
              Entrar na fila
            </button>
          ) : (
            <button onClick={onBook} className="flex-1 ios-btn-primary !py-3">
              Agendar
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
