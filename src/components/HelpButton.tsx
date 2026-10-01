import { useState } from 'react'
import { HelpCircle, PlayCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Modal from './ui/Modal'
import { useApp } from '../context/AppContext'
import { useTour } from '../context/TourContext'
import { pageTours } from '../tours/definitions'

export default function HelpButton() {
  const [open, setOpen] = useState(false)
  const { activeView } = useApp()
  const { startTour } = useTour()
  const location = useLocation()

  const currentTour = pageTours[activeView]?.[location.pathname] ?? []
  const hasTour = currentTour.length > 0

  const handleStartTour = () => {
    setOpen(false)
    setTimeout(() => startTour(currentTour), 200)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-16 z-40 w-10 h-10 rounded-lg bg-white dark:bg-[#111111] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shadow-md flex items-center justify-center transition-colors"
        aria-label="Ajuda"
      >
        <HelpCircle size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajuda rápida" size="lg">
        {hasTour && (
          <button
            onClick={handleStartTour}
            className="w-full mb-5 bg-[#5E6AD2]/8 dark:bg-[#5E6AD2]/10 hover:bg-[#5E6AD2]/12 text-[#3730A3] dark:text-[#A5B4FC] text-sm font-medium px-4 py-3 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
          >
            <PlayCircle size={16} />
            Iniciar tour guiado desta página
          </button>
        )}

        {activeView === 'aluno' ? (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Como agendar uma aula</h4>
              <p>Acesse a aba "Aulas", escolha a modalidade desejada e clique em "Agendar" no card da turma que preferir.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Aula lotada</h4>
              <p>Se a turma estiver lotada, você pode entrar na fila de espera. Ao ser promovido você recebe uma notificação.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Carteirinha digital</h4>
              <p>Sua carteirinha com QR Code está disponível na aba "Carteirinha" e serve para acesso à academia.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Comunidade</h4>
              <p>Fique por dentro dos avisos e novidades da academia na aba "Comunidade".</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Gerenciar aulas</h4>
              <p>Em "Aulas" você pode criar turmas, editar vagas, trocar professores e registrar chamada de presença. Use "Importar CSV" para subir a grade existente.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Gerenciar alunos</h4>
              <p>Em "Usuários" você adiciona e visualiza os alunos cadastrados com status do plano.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Relatórios</h4>
              <p>Analise ocupação, modalidades mais populares e horários de pico na aba "Relatórios".</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Configurações</h4>
              <p>Ajuste política de cancelamento, modo da fila (automático/corrida) e antecedência de agendamento.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
