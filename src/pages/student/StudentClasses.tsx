import { useMemo, useState } from 'react'
import { Clock, User, X, ArrowRight, CheckCircle2, Repeat } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Aula, ModalidadeType } from '../../types'
import Badge, { modalidadeVariant, modalidadeAccent } from '../../components/ui/Badge'
import OccupancyBar from '../../components/ui/OccupancyBar'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'

const FILTERS: ('Todas' | ModalidadeType)[] = ['Todas', 'Pilates', 'Muay Thai', 'Spinning']

const DAY_ABBREV: Record<string, string> = {
  'Segunda': 'Seg',
  'Terça': 'Ter',
  'Quarta': 'Qua',
  'Quinta': 'Qui',
  'Sexta': 'Sex',
  'Sábado': 'Sáb',
  'Domingo': 'Dom',
}

export default function StudentClasses() {
  const { data, currentUser, bookClass, cancelClass, joinWaitlist } = useApp()
  const { showToast } = useToast()
  const [filter, setFilter] = useState<'Todas' | ModalidadeType>('Todas')
  const [fullModal, setFullModal] = useState<Aula | null>(null)
  const [confirmModal, setConfirmModal] = useState<Aula | null>(null)
  const [recurring, setRecurring] = useState(false)

  const permiteRecorrencia = data.configuracoes.permiteRecorrencia

  const aulas = useMemo(() => {
    return filter === 'Todas' ? data.aulas : data.aulas.filter(a => a.modalidade === filter)
  }, [data.aulas, filter])

  const professorNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? '—'

  const openBooking = (aula: Aula) => {
    if (!currentUser) return
    if (aula.vagasOcupadas >= aula.vagasTotais && !aula.inscritos.includes(currentUser.id)) {
      setFullModal(aula)
      return
    }
    if (aula.inscritos.includes(currentUser.id)) {
      showToast('Você já está inscrito nesta aula.', 'info')
      return
    }
    setRecurring(false)
    setConfirmModal(aula)
  }

  const confirmBooking = () => {
    if (!confirmModal) return
    const res = bookClass(confirmModal.id)
    if (res === 'booked') {
      const suffix = recurring ? ' (recorrente)' : ''
      showToast(`Aula de ${confirmModal.modalidade} às ${confirmModal.horario} agendada${suffix}!`, 'success')
    } else if (res === 'already_booked') {
      showToast('Você já está inscrito nesta aula.', 'info')
    } else if (res === 'full') {
      setFullModal(confirmModal)
    } else if (res === 'waitlisted') {
      showToast('Você já está na fila desta aula.', 'info')
    }
    setConfirmModal(null)
    setRecurring(false)
  }

  const handleCancel = (aula: Aula) => {
    const ok = cancelClass(aula.id)
    if (ok) showToast(`Inscrição em ${aula.modalidade} cancelada.`, 'warning')
  }

  const handleJoinWaitlist = (aula: Aula) => {
    joinWaitlist(aula.id)
    showToast('Você entrou na fila de espera.', 'info')
  }

  const alternativas = useMemo(() => {
    if (!fullModal) return []
    return data.aulas.filter(a => a.id !== fullModal.id && (a.modalidade === fullModal.modalidade || a.professorId === fullModal.professorId) && a.vagasOcupadas < a.vagasTotais)
  }, [fullModal, data.aulas])

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Aulas disponíveis</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Escolha sua modalidade e horário preferidos</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1E]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Classes grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {aulas.map(aula => {
          const meInscrito = currentUser ? aula.inscritos.includes(currentUser.id) : false
          const meNaFila = currentUser ? aula.filaEspera.includes(currentUser.id) : false
          const cheia = aula.vagasOcupadas >= aula.vagasTotais
          return (
            <div key={aula.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden flex">
              {/* Left accent bar */}
              <div className="w-[3px] shrink-0" style={{ backgroundColor: modalidadeAccent(aula.modalidade) }} />
              <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={modalidadeVariant(aula.modalidade)}>{aula.modalidade}</Badge>
                    {meNaFila && (
                      <Badge variant="warning">Na fila</Badge>
                    )}
                    {meInscrito && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} /> Inscrito
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                    <Clock size={12} className="text-gray-400" />
                    {aula.horario}
                  </span>
                </div>

                {/* Professor */}
                <p className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5">
                  <User size={12} />
                  {professorNome(aula.professorId)}
                </p>

                {/* Days */}
                <div className="flex gap-1 flex-wrap">
                  {aula.diasSemana.map(d => (
                    <span
                      key={d}
                      className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1A1A1E] px-1.5 py-0.5 rounded"
                    >
                      {DAY_ABBREV[d] ?? d.slice(0, 3)}
                    </span>
                  ))}
                </div>

                {/* Occupancy */}
                <OccupancyBar ocupadas={aula.vagasOcupadas} totais={aula.vagasTotais} />

                {/* Action */}
                {meInscrito ? (
                  <button
                    onClick={() => handleCancel(aula)}
                    className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Cancelar inscrição
                  </button>
                ) : meNaFila ? (
                  <button
                    disabled
                    className="w-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} /> Na fila de espera
                  </button>
                ) : cheia ? (
                  <button
                    onClick={() => setFullModal(aula)}
                    className="w-full bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Ver opções
                  </button>
                ) : (
                  <button
                    onClick={() => openBooking(aula)}
                    className="w-full bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Agendar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Booking confirmation modal */}
      <Modal
        open={!!confirmModal}
        onClose={() => { setConfirmModal(null); setRecurring(false) }}
        title="Confirmar agendamento"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setConfirmModal(null); setRecurring(false) }}
              className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmBooking}
              className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Confirmar
            </button>
          </div>
        }
      >
        {confirmModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Você quer agendar <strong className="text-gray-900 dark:text-white">{confirmModal.modalidade}</strong> às <strong className="text-gray-900 dark:text-white">{confirmModal.horario}</strong> com {professorNome(confirmModal.professorId)}?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {confirmModal.diasSemana.join(', ')}
            </p>
            {permiteRecorrencia && (
              <label className="flex items-start gap-2.5 mt-3 p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#0D0D0D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={e => setRecurring(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#5E6AD2]"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white inline-flex items-center gap-1.5">
                    <Repeat size={12} /> Agendar semanalmente (recorrente)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    A inscrição será mantida automaticamente todas as semanas.
                  </p>
                </div>
              </label>
            )}
          </div>
        )}
      </Modal>

      {/* Full modal */}
      <Modal open={!!fullModal} onClose={() => setFullModal(null)} title="Aula lotada" size="lg">
        {fullModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A aula de <strong>{fullModal.modalidade} às {fullModal.horario}</strong> está sem vagas no momento. Veja alternativas ou entre na fila de espera.
            </p>

            <button
              onClick={() => { handleJoinWaitlist(fullModal); setFullModal(null) }}
              disabled={currentUser ? fullModal.filaEspera.includes(currentUser.id) : true}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentUser && fullModal.filaEspera.includes(currentUser.id) ? 'Você já está na fila' : 'Entrar na fila de espera'}
            </button>

            {alternativas.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2 mt-4">
                  Alternativas sugeridas
                </p>
                <div className="space-y-2">
                  {alternativas.map(alt => (
                    <div key={alt.id} className="flex items-center gap-3 p-3 bg-[#FAFAFA] dark:bg-[#0D0D0D] rounded-lg">
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: modalidadeAccent(alt.modalidade) }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={modalidadeVariant(alt.modalidade)}>{alt.modalidade}</Badge>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{alt.horario}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {professorNome(alt.professorId)} &middot; {alt.diasSemana.join(', ')} &middot; {alt.vagasTotais - alt.vagasOcupadas} vagas
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const res = bookClass(alt.id)
                          if (res === 'booked') { showToast('Aula alternativa agendada.', 'success'); setFullModal(null) }
                        }}
                        className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-xs font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                      >
                        Agendar <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
