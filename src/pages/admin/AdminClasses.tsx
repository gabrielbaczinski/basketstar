import { useEffect, useRef, useState } from 'react'
import { Pencil, ClipboardList, Check, X, Plus, Trash2, Upload, Download, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import Badge, { modalidadeVariant, modalidadeAccent, modalidadeGradient } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import OccupancyBar from '../../components/ui/OccupancyBar'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/ui/Avatar'
import { getBookingDia, getMaxOcupados } from '../../utils/aulaUtils'

type Presence = 'present' | 'absent' | 'unset'

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const MODALIDADES: ModalidadeType[] = ['Pilates', 'Muay Thai', 'Spinning']

export default function AdminClasses() {
  const { data, updateAula, addAula, deleteAula, markAttendance, getAttendance } = useApp()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Aula | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showCsv, setShowCsv] = useState(false)
  const [attendance, setAttendance] = useState<Aula | null>(null)
  const [attendanceDay, setAttendanceDay] = useState<string>('')
  const [attendanceState, setAttendanceState] = useState<Record<string, Presence>>({})

  const professorNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? '—'
  const userName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? id

  const openAttendance = (aula: Aula) => {
    setAttendance(aula)
    setAttendanceDay(aula.diasSemana[0] ?? '')
  }

  useEffect(() => {
    if (!attendance || !attendanceDay) return
    const saved = getAttendance(attendance.id)
    const booking = getBookingDia(attendance, attendanceDay)
    const init: Record<string, Presence> = {}
    booking.inscritos.forEach(id => {
      init[id] = (saved[id] as Presence) ?? 'unset'
    })
    setAttendanceState(init)
  }, [attendance, attendanceDay, getAttendance])

  const saveEdit = (aula: Aula) => {
    updateAula(aula)
    showToast('Aula atualizada com sucesso.', 'success')
    setEditing(null)
  }

  const handleDelete = (aulaId: string) => {
    deleteAula(aulaId)
    showToast('Aula removida.', 'success')
    setEditing(null)
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
      markAttendance(attendance.id, userId, presence === 'present')
    })
    showToast('Chamada registrada.', 'success')
    setAttendance(null)
  }

  const currentInscritos = attendance && attendanceDay
    ? getBookingDia(attendance, attendanceDay).inscritos
    : []

  return (
    <div className="page-container pt-4 md:pt-5 pb-6 space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Gestão de aulas</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Edite vagas, professores e registre presenças
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button data-tour="admin-importar-csv" onClick={() => setShowCsv(true)} className="ios-btn-gray">
            <Upload size={14} /> Importar CSV
          </button>
          <button data-tour="admin-nova-aula" onClick={() => setShowNew(true)} className="ios-btn-primary">
            <Plus size={15} strokeWidth={2.6} /> Nova aula
          </button>
        </div>
      </div>

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
              {data.aulas.map((a, idx) => (
                <tr
                  key={a.id}
                  className={`hover:bg-ios-fill-3 dark:hover:bg-white/5 transition-colors ${idx > 0 ? 'hairline-b' : ''}`}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1 h-5 rounded-full" style={{ background: modalidadeGradient(a.modalidade) }} />
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
        {data.aulas.map(a => (
          <div key={a.id} className="ios-card overflow-hidden flex">
            <div className="w-1.5 shrink-0" style={{ background: modalidadeGradient(a.modalidade) }} />
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                <span className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel tabular-nums">{a.horario}</span>
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

      {/* CSV import modal */}
      {showCsv && (
        <CsvImportModal onClose={() => setShowCsv(false)} onImport={handleImportAulas} professoresList={data.professores} />
      )}

      {/* New aula modal */}
      {showNew && (
        <NewAulaModal onClose={() => setShowNew(false)} onSave={handleAddAula} professoresList={data.professores} />
      )}

      {/* Edit modal */}
      {editing && (
        <EditAulaModal
          aula={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          onDelete={handleDelete}
          professoresList={data.professores}
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
            <button onClick={saveAttendance} className="ios-btn-primary">Salvar chamada</button>
          </div>
        }
      >
        {attendance && (
          <div className="space-y-4">
            {/* Day selector */}
            {attendance.diasSemana.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                {attendance.diasSemana.map(d => (
                  <button
                    key={d}
                    onClick={() => setAttendanceDay(d)}
                    className={`px-3 py-1.5 rounded-full text-caption1 font-semibold transition-colors ${
                      attendanceDay === d
                        ? 'bg-tint-500 text-white shadow-tint-glow'
                        : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {currentInscritos.length === 0 ? (
              <p className="text-center text-footnote text-ios-label-3 dark:text-ios-dlabel-3 py-6">
                Nenhum aluno inscrito em {attendanceDay}.
              </p>
            ) : (
              <div className="ios-card-flat overflow-hidden">
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
  professoresList: { id: string; nome: string; modalidades: string[] }[]
}

function EditAulaModal({ aula, onClose, onSave, onDelete, professoresList }: EditModalProps) {
  const [state, setState] = useState<Aula>(aula)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar aula"
      footer={
        <div className="flex items-center justify-between gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-caption1 text-sys-red font-semibold">Confirmar exclusão?</span>
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
                Não
              </button>
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
            <button onClick={() => onSave(state)} className="ios-btn-primary">Salvar</button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <FieldLabel label="Professor">
          <select
            value={state.professorId}
            onChange={e => setState(s => ({ ...s, professorId: e.target.value }))}
            className="ios-input"
          >
            {professoresList.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
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
      </div>
    </Modal>
  )
}

interface NewModalProps {
  onClose: () => void
  onSave: (aula: Omit<Aula, 'id'>) => void
  professoresList: { id: string; nome: string; modalidades: ModalidadeType[] }[]
}

function NewAulaModal({ onClose, onSave, professoresList }: NewModalProps) {
  const [modalidade, setModalidade] = useState<ModalidadeType>('Pilates')
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
    if (diasSemana.length === 0) { setError('Selecione ao menos um dia.'); return }
    if (!professorId) { setError('Selecione um professor.'); return }
    const bookingsPorDia: Record<string, { inscritos: string[]; filaEspera: string[] }> = {}
    diasSemana.forEach(dia => { bookingsPorDia[dia] = { inscritos: [], filaEspera: [] } })
    onSave({ modalidade, professorId, horario, diasSemana, vagasTotais, bookingsPorDia })
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
          <div className="flex gap-1.5">
            {MODALIDADES.map(m => {
              const active = modalidade === m
              return (
                <button
                  key={m}
                  onClick={() => setModalidade(m)}
                  className={`px-3.5 py-2 rounded-full text-caption1 font-semibold transition-all active:scale-[0.97] ${
                    active ? 'text-white' : 'ios-fill-2 text-ios-label dark:text-ios-dlabel hover:ios-fill-1'
                  }`}
                  style={active ? { background: modalidadeGradient(m), boxShadow: `0 4px 12px ${modalidadeAccent(m)}44` } : undefined}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </FieldLabel>

        <FieldLabel label="Professor">
          <select value={professorId} onChange={e => setProfessorId(e.target.value)} className="ios-input">
            {professoresList.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
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
                      ? 'bg-tint-500 text-white shadow-tint-glow'
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
    if (!MODALIDADES.includes(mod as ModalidadeType)) errors.push(`Modalidade "${mod}" inválida`)
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
