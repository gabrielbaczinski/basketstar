import { useEffect, useRef, useState } from 'react'
import { Pencil, ClipboardList, Check, X, Plus, Trash2, Upload, Download, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType, Professor } from '../../types'
import Badge, { modalidadeVariant } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import OccupancyBar from '../../components/ui/OccupancyBar'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/ui/Avatar'
import { getBookingDia, getMaxOcupados } from '../../utils/aulaUtils'

type Presence = 'present' | 'absent' | 'unset'

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const DEFAULT_SUGGESTIONS: ModalidadeType[] = ['Pilates', 'Muay Thai', 'Spinning']

export default function AdminClasses() {
  const { data, updateAula, addAula, deleteAula, markAttendance, getAttendance, addProfessor, updateProfessor, deleteProfessor } = useApp()
  const { showToast } = useToast()
  const [tab, setTab] = useState<'aulas' | 'professores'>('aulas')
  const [showNewProf, setShowNewProf] = useState(false)
  const [editing, setEditing] = useState<Aula | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showCsv, setShowCsv] = useState(false)
  const [attendance, setAttendance] = useState<Aula | null>(null)
  const [attendanceDay, setAttendanceDay] = useState<string>('')
  const [attendanceDate, setAttendanceDate] = useState<string>('')
  const [attendanceState, setAttendanceState] = useState<Record<string, Presence>>({})

  const professorNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? '—'
  const userName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? id
  // Suggestions = defaults + any custom modality already in use
  const modalidadesSuggestions = Array.from(new Set([
    ...DEFAULT_SUGGESTIONS,
    ...data.aulas.map(a => a.modalidade),
  ])).filter(Boolean)

  const openAttendance = (aula: Aula) => {
    const today = new Date().toISOString().slice(0, 10)
    setAttendance(aula)
    setAttendanceDay(aula.diasSemana[0] ?? '')
    setAttendanceDate(today)
  }

  useEffect(() => {
    if (!attendance || !attendanceDay) return
    const saved = getAttendance(attendance.id, attendanceDate || undefined)
    const booking = getBookingDia(attendance, attendanceDay)
    const init: Record<string, Presence> = {}
    booking.inscritos.forEach(id => {
      init[id] = (saved[id] as Presence) ?? 'unset'
    })
    setAttendanceState(init)
  }, [attendance, attendanceDay, attendanceDate, getAttendance])

  const saveEdit = (aula: Aula) => {
    updateAula(aula)
    showToast('Aula atualizada com sucesso.', 'success')
    setEditing(null)
  }

  const handleDelete = (aulaId: string) => {
    deleteAula(aulaId)
    showToast('Aula removida.', 'success')
    setEditing(null)
    setAttendance(null)
  }

  const handleAddAula = (aulaData: Omit<Aula, 'id'>) => {
    addAula(aulaData)
    showToast('Nova aula criada com sucesso.', 'success')
    setShowNew(false)
  }

  const handleImportAulas = (aulasList: Omit<Aula, 'id'>[]) => {
    aulasList.forEach(a => addAula(a))
    showToast(`${aulasList.length} aula(s) importada(s).`, 'success')
    setShowCsv(false)
  }

  const saveAttendance = () => {
    if (!attendance) return
    Object.entries(attendanceState).forEach(([userId, presence]) => {
      if (presence === 'unset') return
      markAttendance(attendance.id, userId, presence === 'present', attendanceDate || undefined)
    })
    showToast('Chamada registrada.', 'success')
    setAttendance(null)
  }

  const currentBooking = attendance && attendanceDay
    ? getBookingDia(attendance, attendanceDay)
    : { inscritos: [], filaEspera: [] }
  const currentInscritos = currentBooking.inscritos
  const currentFila = currentBooking.filaEspera

  const DOW_MAP: Record<string, number> = {
    'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6,
  }
  const isDateDayMismatch = (() => {
    if (!attendanceDate || !attendanceDay) return false
    const [y, mo, d] = attendanceDate.split('-').map(Number)
    const dateDow = new Date(y, mo - 1, d).getDay()
    return dateDow !== (DOW_MAP[attendanceDay] ?? -1)
  })()

  return (
    <div className="page-container pt-4 md:pt-5 pb-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Gestão de aulas</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Edite vagas, professores e registre presenças
          </p>
          <div className="flex gap-1 mt-3">
            {(['aulas', 'professores'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setShowNewProf(false) }}
                className={`px-4 py-1.5 rounded-full text-footnote font-semibold transition-colors capitalize ${
                  tab === t ? 'brand-bg text-white' : 'ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:ios-fill-1'
                }`}
              >
                {t === 'professores' ? `Professores · ${data.professores.length}` : 'Aulas'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'aulas' ? (
            <>
              <button data-tour="admin-importar-csv" onClick={() => setShowCsv(true)} className="ios-btn-gray">
                <Upload size={14} /> Importar CSV
              </button>
              <button data-tour="admin-nova-aula" onClick={() => setShowNew(true)} className="ios-btn-primary">
                <Plus size={15} strokeWidth={2.6} /> Nova aula
              </button>
            </>
          ) : (
            <button onClick={() => setShowNewProf(true)} className="ios-btn-primary">
              <Plus size={15} strokeWidth={2.6} /> Novo professor
            </button>
          )}
        </div>
      </div>

      {tab === 'professores' && (
        <ProfessoresList
          professores={data.professores}
          aulas={data.aulas}
          onUpdate={updateProfessor}
          onDelete={deleteProfessor}
          showAdd={showNewProf}
          onAddDone={() => setShowNewProf(false)}
          onAdd={addProfessor}
        />
      )}

      {tab === 'aulas' && (<>

      {/* Desktop table */}
      <div data-tour="admin-aulas-table" className="hidden md:block ios-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-footnote">
            <thead>
              <tr className="hairline-b">
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Modalidade</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Professor</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Dias</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Horário</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Ocupação</th>
                <th className="px-5 py-2.5 text-right text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.aulas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-footnote text-ios-label-3 dark:text-ios-dlabel-3">
                    Nenhuma aula cadastrada. Clique em <strong>+ Nova aula</strong> para começar.
                  </td>
                </tr>
              )}
              {data.aulas.map((a, idx) => (
                <tr
                  key={a.id}
                  className={`hover:bg-ios-fill-3 dark:hover:bg-white/5 transition-colors ${idx > 0 ? 'hairline-b' : ''}`}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1 h-5 rounded-full brand-bg" />
                      <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-footnote text-ios-label dark:text-ios-dlabel">{professorNome(a.professorId)}</td>
                  <td className="px-5 py-2.5 text-caption1 text-ios-label-2 dark:text-ios-dlabel-2">{a.diasSemana.join(', ')}</td>
                  <td className="px-5 py-2.5 text-footnote font-semibold text-ios-label dark:text-ios-dlabel tabular-nums">{a.horario}</td>
                  <td className="px-5 py-2.5 min-w-[200px]">
                    <OccupancyBar ocupadas={getMaxOcupados(a)} totais={a.vagasTotais} />
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(a)}
                        className="text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel hover:bg-ios-fill-2 text-caption1 font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => openAttendance(a)}
                        className="ios-btn-primary !py-1.5 !px-3 !text-caption1"
                      >
                        <ClipboardList size={12} /> Chamada
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-2 md:hidden">
        {data.aulas.length === 0 && (
          <div className="ios-card p-6 text-center text-footnote text-ios-label-3 dark:text-ios-dlabel-3">
            Nenhuma aula cadastrada. Toque em <strong>+ Nova aula</strong> para começar.
          </div>
        )}
        {data.aulas.map(a => (
          <div key={a.id} className="ios-card overflow-hidden flex border-l-[3px] border-l-[3px] brand-border-l">
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                <span className="text-caption1 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 tabular-nums">{a.horario}</span>
              </div>
              <p className="text-footnote text-ios-label dark:text-ios-dlabel">{professorNome(a.professorId)}</p>
              <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mt-1">{a.diasSemana.join(', ')}</p>
              <div className="my-3">
                <OccupancyBar ocupadas={getMaxOcupados(a)} totais={a.vagasTotais} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(a)} className="flex-1 ios-btn-gray !py-2">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => openAttendance(a)} className="flex-1 ios-btn-primary !py-2">
                  <ClipboardList size={12} /> Chamada
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      </>)}

      {/* CSV import modal */}
      {showCsv && (
        <CsvImportModal onClose={() => setShowCsv(false)} onImport={handleImportAulas} professoresList={data.professores} />
      )}

      {/* New aula modal */}
      {showNew && (
        <NewAulaModal
          onClose={() => setShowNew(false)}
          onSave={handleAddAula}
          professoresList={data.professores}
          sugestoes={modalidadesSuggestions}
          onAddProfessor={addProfessor}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditAulaModal
          aula={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          onDelete={handleDelete}
          professoresList={data.professores}
          sugestoes={modalidadesSuggestions}
          onAddProfessor={addProfessor}
        />
      )}

      {/* Attendance modal */}
      <Modal
        open={!!attendance}
        onClose={() => setAttendance(null)}
        title={attendance ? `Chamada — ${attendance.modalidade} ${attendance.horario}` : 'Chamada'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setAttendance(null)} className="ios-btn-gray">Cancelar</button>
            <button
              onClick={saveAttendance}
              disabled={isDateDayMismatch}
              className="ios-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              title={isDateDayMismatch ? 'Corrija a data antes de salvar' : undefined}
            >
              Salvar chamada
            </button>
          </div>
        }
      >
        {attendance && (
          <div className="space-y-4">
            {/* Day + date selector row */}
            <div className="flex flex-wrap items-center gap-3">
              {attendance.diasSemana.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {attendance.diasSemana.map(d => (
                    <button
                      key={d}
                      onClick={() => setAttendanceDay(d)}
                      className={`px-3 py-1.5 rounded-full text-caption1 font-semibold transition-colors ${
                        attendanceDay === d
                          ? 'bg-tint-500 text-white'
                          : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 shrink-0">
                  Data
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="ios-input !py-1.5 !text-caption1 w-auto"
                />
              </div>
            </div>

            {/* Date ↔ day-of-week mismatch warning */}
            {isDateDayMismatch && (
              <div className="flex items-center gap-2 px-3 py-2 bg-sys-orange/12 text-sys-orange rounded-ios text-caption1">
                <AlertCircle size={13} className="shrink-0" />
                <span>A data selecionada não corresponde ao dia <strong>{attendanceDay}</strong>. Corrija antes de salvar.</span>
              </div>
            )}

            {/* Enrolled students */}
            {currentInscritos.length === 0 ? (
              <p className="text-center text-footnote text-ios-label-3 dark:text-ios-dlabel-3 py-6">
                Nenhum aluno inscrito em {attendanceDay}.
              </p>
            ) : (
              <div className="ios-card-flat overflow-hidden">
                <p className="px-4 pt-3 pb-1 text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                  Inscritos · {currentInscritos.length}
                </p>
                {currentInscritos.map(id => {
                  const st = attendanceState[id] ?? 'unset'
                  return (
                    <div key={id} className="ios-list-row flex items-center gap-3 px-4 py-3">
                      <Avatar name={userName(id)} size="sm" />
                      <span className="flex-1 text-callout text-ios-label dark:text-ios-dlabel">
                        {userName(id)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAttendanceState(s => ({ ...s, [id]: 'present' }))}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            st === 'present'
                              ? 'bg-sys-green text-white'
                              : 'ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-sys-green/14'
                          }`}
                          aria-label="Presente"
                        >
                          <Check size={15} strokeWidth={2.8} />
                        </button>
                        <button
                          onClick={() => setAttendanceState(s => ({ ...s, [id]: 'absent' }))}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            st === 'absent'
                              ? 'bg-sys-red text-white'
                              : 'ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-sys-red/14'
                          }`}
                          aria-label="Ausente"
                        >
                          <X size={15} strokeWidth={2.8} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Waitlist section */}
            {currentFila.length > 0 && (
              <div className="ios-card-flat overflow-hidden">
                <p className="px-4 pt-3 pb-1 text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                  Fila de espera · {currentFila.length}
                </p>
                {currentFila.map((id, pos) => (
                  <div key={id} className="ios-list-row flex items-center gap-3 px-4 py-2.5">
                    <span className="w-6 h-6 rounded-full bg-ios-fill-2 flex items-center justify-center text-caption2 font-bold text-ios-label-3 dark:text-ios-dlabel-3 shrink-0">
                      {pos + 1}
                    </span>
                    <Avatar name={userName(id)} size="sm" />
                    <span className="flex-1 text-callout text-ios-label-2 dark:text-ios-dlabel-2">
                      {userName(id)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

interface EditModalProps {
  aula: Aula
  onClose: () => void
  onSave: (a: Aula) => void
  onDelete: (id: string) => void
  professoresList: Professor[]
  sugestoes: string[]
  onAddProfessor: (nome: string) => Professor
}

function EditAulaModal({ aula, onClose, onSave, onDelete, professoresList, sugestoes, onAddProfessor }: EditModalProps) {
  const [state, setState] = useState<Aula>(aula)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const toggleDia = (dia: string) => {
    setState(s => ({
      ...s,
      diasSemana: s.diasSemana.includes(dia)
        ? s.diasSemana.filter(d => d !== dia)
        : [...s.diasSemana, dia],
    }))
    setError('')
  }

  const handleSave = () => {
    if (!state.modalidade.trim()) { setError('Informe a modalidade.'); return }
    if (!state.professorId) { setError('Selecione um professor.'); return }
    if (!state.horario) { setError('Informe o horário.'); return }
    if (Number(state.vagasTotais) < 1) { setError('Vagas deve ser ≥ 1.'); return }
    if (state.diasSemana.length === 0) { setError('Selecione ao menos um dia.'); return }
    const overCapacityDay = state.diasSemana.find(
      dia => (state.bookingsPorDia[dia]?.inscritos.length ?? 0) > Number(state.vagasTotais),
    )
    if (overCapacityDay) {
      const count = state.bookingsPorDia[overCapacityDay]?.inscritos.length ?? 0
      setError(`Esta aula já tem ${count} inscritos em ${overCapacityDay}. A capacidade não pode ser menor que isso.`)
      return
    }
    // Clean bookings for removed days; initialise new days
    const cleanedBookings = { ...state.bookingsPorDia }
    Object.keys(cleanedBookings).forEach(dia => { if (!state.diasSemana.includes(dia)) delete cleanedBookings[dia] })
    state.diasSemana.forEach(dia => { if (!cleanedBookings[dia]) cleanedBookings[dia] = { inscritos: [], filaEspera: [] } })
    onSave({ ...state, bookingsPorDia: cleanedBookings })
  }

  const removedWithBookings = aula.diasSemana.filter(
    dia => !state.diasSemana.includes(dia) && (aula.bookingsPorDia[dia]?.inscritos.length ?? 0) > 0,
  )

  const totalInscritos = Object.values(aula.bookingsPorDia).reduce((sum, b) => sum + b.inscritos.length, 0)

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar aula"
      footer={
        <div className="flex items-center justify-between gap-2">
          {confirmDelete ? (
            <div className="flex items-start gap-2 flex-col sm:flex-row sm:items-center">
              <span className="text-caption1 text-sys-red font-semibold">
                Excluir?{totalInscritos > 0 && ` ${totalInscritos} aluno${totalInscritos !== 1 ? 's' : ''} perderão a inscrição.`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(state.id)}
                  className="bg-sys-red text-white text-caption1 font-semibold px-3 py-1.5 rounded-full transition-colors hover:brightness-110"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-ios-label-2 dark:text-ios-dlabel-2 text-caption1 font-semibold px-3 py-1.5 rounded-full hover:bg-ios-fill-2 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sys-red hover:bg-sys-red/10 text-caption1 font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> Excluir aula
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="ios-btn-gray">Cancelar</button>
            <button onClick={handleSave} className="ios-btn-primary">Salvar</button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-sys-red/12 text-sys-red rounded-ios text-caption1">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <FieldLabel label="Modalidade">
          <input
            type="text"
            list="modalidade-sugestoes-edit"
            value={state.modalidade}
            onChange={e => setState(s => ({ ...s, modalidade: e.target.value }))}
            placeholder="Ex.: Pilates, Crossfit, Zumba…"
            className="ios-input"
          />
          <datalist id="modalidade-sugestoes-edit">
            {sugestoes.map(s => <option key={s} value={s} />)}
          </datalist>
        </FieldLabel>
        <FieldLabel label="Professor">
          <ProfessorSelector
            value={state.professorId}
            professoresList={professoresList}
            onSelect={id => setState(s => ({ ...s, professorId: id }))}
            onAdd={onAddProfessor}
          />
        </FieldLabel>
        <FieldLabel label="Horário">
          <input
            type="time"
            value={state.horario}
            onChange={e => setState(s => ({ ...s, horario: e.target.value }))}
            className="ios-input"
          />
        </FieldLabel>
        <FieldLabel label="Vagas totais">
          <input
            type="number"
            min={1}
            max={99}
            value={state.vagasTotais}
            onChange={e => setState(s => ({ ...s, vagasTotais: Number(e.target.value) }))}
            className="ios-input"
          />
        </FieldLabel>
        <FieldLabel label="Dias da semana">
          <div className="flex flex-wrap gap-1.5">
            {DIAS_SEMANA.map(dia => {
              const active = state.diasSemana.includes(dia)
              const enrolledOnRemoved = !active && (aula.bookingsPorDia[dia]?.inscritos.length ?? 0) > 0
              return (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDia(dia)}
                  className={`relative px-3.5 py-2 rounded-full text-caption1 font-semibold transition-all active:scale-[0.97] ${
                    active
                      ? 'bg-tint-500 text-white'
                      : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                  }`}
                >
                  {dia}
                  {active && (aula.bookingsPorDia[dia]?.inscritos.length ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sys-orange text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {aula.bookingsPorDia[dia]!.inscritos.length}
                    </span>
                  )}
                  {enrolledOnRemoved && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sys-red text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {aula.bookingsPorDia[dia]!.inscritos.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {removedWithBookings.length > 0 && (
            <div className="flex items-start gap-1.5 mt-2 text-caption1 text-sys-orange">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <span>Remover {removedWithBookings.join(', ')} cancela {removedWithBookings.reduce((s, d) => s + (aula.bookingsPorDia[d]?.inscritos.length ?? 0), 0)} inscrição(ões) desse(s) dia(s).</span>
            </div>
          )}
        </FieldLabel>
      </div>
    </Modal>
  )
}

interface NewModalProps {
  onClose: () => void
  onSave: (aula: Omit<Aula, 'id'>) => void
  professoresList: Professor[]
  sugestoes: string[]
  onAddProfessor: (nome: string) => Professor
}

function NewAulaModal({ onClose, onSave, professoresList, sugestoes, onAddProfessor }: NewModalProps) {
  const [modalidade, setModalidade] = useState<ModalidadeType>('')
  const [professorId, setProfessorId] = useState(professoresList[0]?.id ?? '')
  const [horario, setHorario] = useState('07:00')
  const [diasSemana, setDiasSemana] = useState<string[]>([])
  const [vagasTotais, setVagasTotais] = useState(20)
  const [error, setError] = useState('')

  const toggleDia = (dia: string) => {
    setDiasSemana(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
    setError('')
  }

  const handleSave = () => {
    const mod = modalidade.trim()
    if (!mod) { setError('Informe o nome da modalidade.'); return }
    if (diasSemana.length === 0) { setError('Selecione ao menos um dia.'); return }
    if (!professorId) { setError('Selecione um professor.'); return }
    const bookingsPorDia: Record<string, { inscritos: string[]; filaEspera: string[] }> = {}
    diasSemana.forEach(dia => { bookingsPorDia[dia] = { inscritos: [], filaEspera: [] } })
    onSave({ modalidade: mod, professorId, horario, diasSemana, vagasTotais, bookingsPorDia })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova aula"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="ios-btn-gray">Cancelar</button>
          <button onClick={handleSave} className="ios-btn-primary">Criar aula</button>
        </div>
      }
    >
      <div className="space-y-4">
        <FieldLabel label="Modalidade">
          <input
            type="text"
            list="modalidade-sugestoes-new"
            value={modalidade}
            onChange={e => { setModalidade(e.target.value); setError('') }}
            placeholder="Ex.: Pilates, Crossfit, Yoga, Zumba…"
            className="ios-input"
            autoFocus
          />
          <datalist id="modalidade-sugestoes-new">
            {sugestoes.map(s => <option key={s} value={s} />)}
          </datalist>
          {modalidade.trim() && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: 'var(--brand)' }}
              />
              <span className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">
                Cor atribuída automaticamente
              </span>
            </div>
          )}
        </FieldLabel>

        <FieldLabel label="Professor">
          <ProfessorSelector
            value={professorId}
            professoresList={professoresList}
            onSelect={setProfessorId}
            onAdd={onAddProfessor}
          />
        </FieldLabel>

        <FieldLabel label="Horário">
          <input type="time" value={horario} onChange={e => setHorario(e.target.value)} className="ios-input" />
        </FieldLabel>

        <FieldLabel label="Dias da semana">
          <div className="flex flex-wrap gap-1.5">
            {DIAS_SEMANA.map(dia => {
              const active = diasSemana.includes(dia)
              return (
                <button
                  key={dia}
                  onClick={() => toggleDia(dia)}
                  className={`px-3.5 py-2 rounded-full text-caption1 font-semibold transition-all active:scale-[0.97] ${
                    active
                      ? 'bg-tint-500 text-white'
                      : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                  }`}
                >
                  {dia}
                </button>
              )
            })}
          </div>
          {error && <p className="text-caption1 text-sys-red mt-2">{error}</p>}
        </FieldLabel>

        <FieldLabel label="Vagas totais">
          <input
            type="number"
            min={1}
            max={99}
            value={vagasTotais}
            onChange={e => setVagasTotais(Number(e.target.value))}
            className="ios-input"
          />
        </FieldLabel>
      </div>
    </Modal>
  )
}

/* ── CSV Import ── */

const CSV_TEMPLATE = `modalidade,professor,horario,dias,vagas
Pilates,Ana Souza,07:00,Segunda;Quarta,20
Muay Thai,Carlos Lima,08:00,Terça;Quinta;Sábado,15
Spinning,Fernanda Costa,09:00,Segunda;Quarta;Sexta,25`

interface CsvRow {
  modalidade: string
  professor: string
  horario: string
  dias: string[]
  vagas: number
  errors: string[]
}

function parseAulaCsv(raw: string, profs: { id: string; nome: string }[]): CsvRow[] {
  const lines = raw.trim().split('\n').filter(l => l.trim() && !l.toLowerCase().startsWith('modalidade'))
  return lines.map(line => {
    const [mod = '', prof = '', hor = '', dias = '', vg = ''] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
    const errors: string[] = []
    if (!mod.trim()) errors.push('Modalidade obrigatória')
    if (!hor.match(/^\d{2}:\d{2}$/)) errors.push('Horário deve ser HH:MM')
    const parsedDias = dias.split(';').map(d => d.trim()).filter(Boolean)
    if (parsedDias.length === 0) errors.push('Informe ao menos um dia')
    const vagasNum = Number(vg)
    if (isNaN(vagasNum) || vagasNum < 1) errors.push('Vagas deve ser ≥ 1')
    const profMatch = profs.find(p => p.nome.toLowerCase() === prof.toLowerCase())
    if (!profMatch) errors.push(`Professor "${prof}" não encontrado`)
    return { modalidade: mod, professor: prof, horario: hor, dias: parsedDias, vagas: vagasNum, errors }
  })
}

interface CsvModalProps {
  onClose: () => void
  onImport: (aulas: Omit<Aula, 'id'>[]) => void
  professoresList: { id: string; nome: string; modalidades: ModalidadeType[] }[]
}

function CsvImportModal({ onClose, onImport, professoresList }: CsvModalProps) {
  const [csvText, setCsvText] = useState('')
  const [rows, setRows] = useState<CsvRow[]>([])
  const [parsed, setParsed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setCsvText(String(ev.target?.result ?? '')); setParsed(false) }
    reader.readAsText(file, 'utf-8')
  }

  const handleParse = () => {
    const result = parseAulaCsv(csvText, professoresList)
    setRows(result)
    setParsed(true)
  }

  const validRows = rows.filter(r => r.errors.length === 0)

  const handleImport = () => {
    const aulas: Omit<Aula, 'id'>[] = validRows.map(r => {
      const prof = professoresList.find(p => p.nome.toLowerCase() === r.professor.toLowerCase())!
      const bookingsPorDia: Record<string, { inscritos: string[]; filaEspera: string[] }> = {}
      r.dias.forEach(d => { bookingsPorDia[d] = { inscritos: [], filaEspera: [] } })
      return { modalidade: r.modalidade as ModalidadeType, professorId: prof.id, horario: r.horario, diasSemana: r.dias, vagasTotais: r.vagas, bookingsPorDia }
    })
    onImport(aulas)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'template_aulas.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Importar aulas via CSV"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={downloadTemplate}
            className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel inline-flex items-center gap-1 transition-colors"
          >
            <Download size={12} /> Baixar template
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="ios-btn-gray">Cancelar</button>
            {!parsed ? (
              <button onClick={handleParse} disabled={!csvText.trim()} className="ios-btn-primary">
                Visualizar
              </button>
            ) : (
              <button onClick={handleImport} disabled={validRows.length === 0} className="ios-btn-primary">
                Importar {validRows.length} aula{validRows.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {!parsed ? (
          <>
            <div>
              <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mb-2">
                Formato: <code className="ios-fill-2 px-1.5 py-0.5 rounded font-mono text-caption2">modalidade, professor, horario, dias (separados por ;), vagas</code>
              </p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-ios-label-4 dark:border-ios-dlabel-4 rounded-ios p-5 text-center cursor-pointer hover:border-tint-500/50 transition-colors"
              >
                <Upload size={18} className="mx-auto text-ios-label-3 dark:text-ios-dlabel-3 mb-1" />
                <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2">
                  Clique para selecionar um arquivo .csv
                </p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              </div>
            </div>
            <FieldLabel label="Ou cole o CSV aqui">
              <textarea
                value={csvText}
                onChange={e => { setCsvText(e.target.value); setParsed(false) }}
                rows={7}
                placeholder={CSV_TEMPLATE}
                className="ios-input font-mono text-caption1 resize-none"
              />
            </FieldLabel>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2">
                {rows.length} linha(s) encontrada(s)
              </p>
              <button onClick={() => setParsed(false)} className="text-caption1 font-semibold text-tint-500 hover:text-tint-600">
                Editar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-caption1">
                <thead>
                  <tr className="text-left text-caption2 uppercase text-ios-label-3 dark:text-ios-dlabel-3 tracking-wider">
                    <th className="pb-2 pr-3 font-semibold">Modalidade</th>
                    <th className="pb-2 pr-3 font-semibold">Professor</th>
                    <th className="pb-2 pr-3 font-semibold">Horário</th>
                    <th className="pb-2 pr-3 font-semibold">Dias</th>
                    <th className="pb-2 pr-3 font-semibold">Vagas</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={`${r.errors.length > 0 ? 'bg-sys-red/5' : ''} ${i > 0 ? 'hairline-t' : ''}`}>
                      <td className="py-2 pr-3 text-ios-label dark:text-ios-dlabel">{r.modalidade || '—'}</td>
                      <td className="py-2 pr-3 text-ios-label-2 dark:text-ios-dlabel-2">{r.professor || '—'}</td>
                      <td className="py-2 pr-3 font-mono text-ios-label-2 dark:text-ios-dlabel-2 tabular-nums">{r.horario || '—'}</td>
                      <td className="py-2 pr-3 text-ios-label-3 dark:text-ios-dlabel-3">{r.dias.join(', ') || '—'}</td>
                      <td className="py-2 pr-3 text-ios-label-2 dark:text-ios-dlabel-2 tabular-nums">{isNaN(r.vagas) ? '—' : r.vagas}</td>
                      <td className="py-2">
                        {r.errors.length === 0 ? (
                          <span className="text-sys-green font-semibold">OK</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sys-red" title={r.errors.join('; ')}>
                            <AlertCircle size={11} /> {r.errors.length} erro{r.errors.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

interface ProfessoresListProps {
  professores: Professor[]
  aulas: Aula[]
  onUpdate: (prof: Professor) => void
  onDelete: (profId: string) => void
  showAdd: boolean
  onAddDone: () => void
  onAdd: (nome: string) => Professor
}

function ProfessoresList({ professores, aulas, onUpdate, onDelete, showAdd, onAddDone, onAdd }: ProfessoresListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newNome, setNewNome] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (showAdd) { setNewNome(''); setTimeout(() => addInputRef.current?.focus(), 50) } }, [showAdd])
  useEffect(() => { if (editingId) editInputRef.current?.focus() }, [editingId])

  const classesDe = (profId: string) => aulas.filter(a => a.professorId === profId)

  const commitEdit = (prof: Professor) => {
    const nome = editNome.trim()
    if (nome && nome !== prof.nome) onUpdate({ ...prof, nome })
    setEditingId(null)
  }

  const commitAdd = () => {
    const nome = newNome.trim()
    if (!nome) return
    onAdd(nome)
    onAddDone()
  }

  return (
    <div className="space-y-3">
      {showAdd && (
        <div className="ios-card px-4 py-3 flex gap-2 items-center">
          <input
            ref={addInputRef}
            type="text"
            value={newNome}
            onChange={e => setNewNome(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') onAddDone() }}
            placeholder="Nome completo do professor"
            className="ios-input flex-1 min-w-0"
          />
          <button onClick={commitAdd} disabled={!newNome.trim()} className="w-9 h-9 rounded-full bg-sys-green text-white flex items-center justify-center shrink-0 disabled:opacity-40" aria-label="Confirmar">
            <Check size={14} strokeWidth={2.8} />
          </button>
          <button onClick={onAddDone} className="w-9 h-9 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 flex items-center justify-center shrink-0" aria-label="Cancelar">
            <X size={14} strokeWidth={2.8} />
          </button>
        </div>
      )}

      <div className="ios-card overflow-hidden">
        {professores.length === 0 && !showAdd && (
          <p className="p-8 text-center text-footnote text-ios-label-3 dark:text-ios-dlabel-3">
            Nenhum professor cadastrado. Clique em <strong>+ Novo professor</strong> para começar.
          </p>
        )}
        {professores.map((prof, idx) => {
          const classes = classesDe(prof.id)
          const mods = Array.from(new Set(classes.map(a => a.modalidade)))
          const isEditing = editingId === prof.id
          const isConfirming = confirmDeleteId === prof.id

          return (
            <div key={prof.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'hairline-t' : ''}`}>
              <Avatar name={prof.nome} size="sm" />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      ref={editInputRef}
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(prof); if (e.key === 'Escape') setEditingId(null) }}
                      className="ios-input flex-1 min-w-0 !py-1.5"
                    />
                    <button onClick={() => commitEdit(prof)} className="w-8 h-8 rounded-full bg-sys-green text-white flex items-center justify-center shrink-0" aria-label="Salvar">
                      <Check size={13} strokeWidth={2.8} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 flex items-center justify-center shrink-0" aria-label="Cancelar">
                      <X size={13} strokeWidth={2.8} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel truncate">{prof.nome}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mods.length > 0
                        ? mods.map(m => <Badge key={m} variant={modalidadeVariant(m as ModalidadeType)}>{m}</Badge>)
                        : <span className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">Sem aulas atribuídas</span>
                      }
                    </div>
                  </>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  {isConfirming ? (
                    <>
                      <span className="text-caption2 text-sys-red font-semibold mr-1 hidden sm:inline">
                        {classes.length > 0 ? `${classes.length} aula(s) ficarão sem professor.` : 'Excluir?'}
                      </span>
                      <button onClick={() => { onDelete(prof.id); setConfirmDeleteId(null) }} className="px-2.5 py-1 rounded-full bg-sys-red text-white text-caption2 font-semibold">Excluir</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 text-caption2 font-semibold">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(prof.id); setEditNome(prof.nome); setConfirmDeleteId(null) }} className="text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-ios-fill-2 p-2 rounded-full transition-colors" aria-label="Editar">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(prof.id)} className="text-sys-red hover:bg-sys-red/10 p-2 rounded-full transition-colors" aria-label="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfessorSelector({
  value,
  professoresList,
  onSelect,
  onAdd,
}: {
  value: string
  professoresList: Professor[]
  onSelect: (id: string) => void
  onAdd: (nome: string) => Professor
}) {
  const [adding, setAdding] = useState(false)
  const [newNome, setNewNome] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const commit = () => {
    const nome = newNome.trim()
    if (!nome) return
    const prof = onAdd(nome)
    onSelect(prof.id)
    setNewNome('')
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <select value={value} onChange={e => onSelect(e.target.value)} className="ios-input flex-1 min-w-0">
          {professoresList.length === 0 && (
            <option value="" disabled>Nenhum — use + para adicionar</option>
          )}
          {professoresList.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => { setAdding(a => !a); setNewNome('') }}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            adding
              ? 'brand-bg text-white'
              : 'ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:ios-fill-1'
          }`}
          aria-label="Novo professor"
        >
          <Plus size={14} strokeWidth={2.6} />
        </button>
      </div>
      {adding && (
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={newNome}
            onChange={e => setNewNome(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setAdding(false); setNewNome('') }
            }}
            placeholder="Nome completo do professor"
            className="ios-input flex-1 min-w-0"
          />
          <button
            type="button"
            onClick={commit}
            disabled={!newNome.trim()}
            className="w-9 h-9 rounded-full bg-sys-green text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            aria-label="Confirmar"
          >
            <Check size={14} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewNome('') }}
            className="w-9 h-9 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 flex items-center justify-center shrink-0"
            aria-label="Cancelar"
          >
            <X size={14} strokeWidth={2.8} />
          </button>
        </div>
      )}
    </div>
  )
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-caption2 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 mb-1.5 uppercase tracking-wider px-1">
        {label}
      </label>
      {children}
    </div>
  )
}
