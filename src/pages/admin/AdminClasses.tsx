import { useEffect, useState } from 'react'
import { Pencil, ClipboardList, Check, X, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import Badge, { modalidadeVariant, modalidadeAccent } from '../../components/ui/Badge'
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
  const [attendance, setAttendance] = useState<Aula | null>(null)
  const [attendanceDay, setAttendanceDay] = useState<string>('')
  const [attendanceState, setAttendanceState] = useState<Record<string, Presence>>({})

  const professorNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? '—'
  const userName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? id

  const openAttendance = (aula: Aula) => {
    setAttendance(aula)
    setAttendanceDay(aula.diasSemana[0] ?? '')
  }

  // When attendance modal opens or the selected day changes, preload state from context
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
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Gestão de aulas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edite vagas, professores e registre presenças</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="shrink-0 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus size={15} /> Nova aula
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-[#111111] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                <th className="px-5 py-3 font-medium">Modalidade</th>
                <th className="px-5 py-3 font-medium">Professor</th>
                <th className="px-5 py-3 font-medium">Dias</th>
                <th className="px-5 py-3 font-medium">Horário</th>
                <th className="px-5 py-3 font-medium">Ocupação</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.aulas.map((a, idx) => (
                <tr key={a.id} className={`hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60 dark:bg-[#141414]' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-0.5 h-4 rounded-full" style={{ backgroundColor: modalidadeAccent(a.modalidade) }} />
                      <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{professorNome(a.professorId)}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{a.diasSemana.join(', ')}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{a.horario}</td>
                  <td className="px-5 py-3 min-w-[180px]">
                    <OccupancyBar ocupadas={getMaxOcupados(a)} totais={a.vagasTotais} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(a)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23] text-xs font-medium px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => openAttendance(a)}
                        className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-xs font-medium px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
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
          <div key={a.id} className="bg-white dark:bg-[#111111] rounded-lg shadow-sm overflow-hidden flex">
            <div className="w-[3px] shrink-0" style={{ backgroundColor: modalidadeAccent(a.modalidade) }} />
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{a.horario}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{professorNome(a.professorId)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.diasSemana.join(', ')}</p>
              <div className="my-3">
                <OccupancyBar ocupadas={getMaxOcupados(a)} totais={a.vagasTotais} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(a)}
                  className="flex-1 bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  onClick={() => openAttendance(a)}
                  className="flex-1 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <ClipboardList size={12} /> Chamada
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New aula modal */}
      {showNew && (
        <NewAulaModal
          onClose={() => setShowNew(false)}
          onSave={handleAddAula}
          professoresList={data.professores}
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
            <button
              onClick={() => setAttendance(null)}
              className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveAttendance}
              className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Salvar chamada
            </button>
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
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${attendanceDay === d ? 'bg-[#5E6AD2] text-white' : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A30]'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {currentInscritos.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">Nenhum aluno inscrito em {attendanceDay}.</p>
            ) : (
              <div className="space-y-1.5">
                {currentInscritos.map(id => {
                  const st = attendanceState[id] ?? 'unset'
                  return (
                    <div key={id} className="flex items-center gap-3 p-2.5 bg-[#FAFAFA] dark:bg-[#0D0D0D] rounded-lg">
                      <Avatar name={userName(id)} size="sm" />
                      <span className="flex-1 text-sm text-gray-900 dark:text-white">{userName(id)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAttendanceState(s => ({ ...s, [id]: 'present' }))}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            st === 'present'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white dark:bg-[#1A1A1E] text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                          }`}
                          aria-label="Presente"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setAttendanceState(s => ({ ...s, [id]: 'absent' }))}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            st === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-white dark:bg-[#1A1A1E] text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                          }`}
                          aria-label="Ausente"
                        >
                          <X size={14} />
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
  const inputCls = 'w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow'

  return (
    <Modal open onClose={onClose} title="Editar aula" footer={
      <div className="flex items-center justify-between gap-2">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 dark:text-red-400">Confirmar exclusão?</span>
            <button
              onClick={() => onDelete(state.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Excluir
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Excluir aula
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(state)}
            className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    }>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Professor</label>
          <select
            value={state.professorId}
            onChange={e => setState(s => ({ ...s, professorId: e.target.value }))}
            className={inputCls}
          >
            {professoresList.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Horário</label>
          <input
            type="time"
            value={state.horario}
            onChange={e => setState(s => ({ ...s, horario: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vagas totais</label>
          <input
            type="number"
            min={1}
            max={99}
            value={state.vagasTotais}
            onChange={e => setState(s => ({ ...s, vagasTotais: Number(e.target.value) }))}
            className={inputCls}
          />
        </div>
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

  const inputCls = 'w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow'

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
    <Modal open onClose={onClose} title="Nova aula" footer={
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Criar aula
        </button>
      </div>
    }>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Modalidade</label>
          <div className="flex gap-1.5">
            {MODALIDADES.map(m => (
              <button
                key={m}
                onClick={() => setModalidade(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  modalidade === m
                    ? 'bg-[#5E6AD2] text-white'
                    : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A30]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Professor</label>
          <select value={professorId} onChange={e => setProfessorId(e.target.value)} className={inputCls}>
            {professoresList.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Horário</label>
          <input type="time" value={horario} onChange={e => setHorario(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dias da semana</label>
          <div className="flex flex-wrap gap-1.5">
            {DIAS_SEMANA.map(dia => (
              <button
                key={dia}
                onClick={() => toggleDia(dia)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  diasSemana.includes(dia)
                    ? 'bg-[#5E6AD2] text-white'
                    : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A30]'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vagas totais</label>
          <input
            type="number"
            min={1}
            max={99}
            value={vagasTotais}
            onChange={e => setVagasTotais(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    </Modal>
  )
}
