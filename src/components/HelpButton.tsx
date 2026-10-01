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
        className="fixed bottom-20 md:bottom-6 right-20 z-40 w-11 h-11 rounded-full ios-glass-heavy text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors shadow-ios-3"
        aria-label="Ajuda"
      >
        <HelpCircle size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajuda rápida" size="lg">
        {hasTour && (
          <button
            onClick={handleStartTour}
            className="w-full mb-5 bg-tint-500/10 dark:bg-tint-500/14 hover:bg-tint-500/14 text-tint-700 dark:text-tint-300 text-callout font-semibold px-4 py-3 rounded-ios inline-flex items-center justify-center gap-2 transition-colors"
          >
            <PlayCircle size={17} />
            Iniciar tour guiado desta página
          </button>
        )}

        {activeView === 'aluno' ? (
          <div className="space-y-4 text-footnote text-ios-label dark:text-ios-dlabel">
            <HelpItem title="Como agendar uma aula">
              Acesse a aba "Aulas", escolha a modalidade desejada e clique em "Agendar" no card da turma que preferir.
            </HelpItem>
            <HelpItem title="Aula lotada">
              Se a turma estiver lotada, você pode entrar na fila de espera. Ao ser promovido você recebe uma notificação.
            </HelpItem>
            <HelpItem title="Carteirinha digital">
              Sua carteirinha com QR Code está disponível na aba "Carteirinha" e serve para acesso à academia.
            </HelpItem>
            <HelpItem title="Comunidade">
              Fique por dentro dos avisos e novidades da academia na aba "Comunidade".
            </HelpItem>
          </div>
        ) : (
          <div className="space-y-4 text-footnote text-ios-label dark:text-ios-dlabel">
            <HelpItem title="Gerenciar aulas">
              Em "Aulas" você pode criar turmas, editar vagas, trocar professores e registrar chamada de presença. Use "Importar CSV" para subir a grade existente.
            </HelpItem>
            <HelpItem title="Gerenciar alunos">
              Em "Usuários" você adiciona e visualiza os alunos cadastrados com status do plano.
            </HelpItem>
            <HelpItem title="Relatórios">
              Analise ocupação, modalidades mais populares e horários de pico na aba "Relatórios".
            </HelpItem>
            <HelpItem title="Configurações">
              Ajuste política de cancelamento, modo da fila (automático/corrida) e antecedência de agendamento.
            </HelpItem>
          </div>
        )}
      </Modal>
    </>
  )
}

function HelpItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-callout text-ios-label dark:text-ios-dlabel mb-1">{title}</h4>
      <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">{children}</p>
    </div>
  )
}
