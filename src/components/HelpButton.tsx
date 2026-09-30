import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import Modal from './ui/Modal'
import { useApp } from '../context/AppContext'

export default function HelpButton() {
  const [open, setOpen] = useState(false)
  const { activeView } = useApp()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-16 z-40 w-10 h-10 rounded-full bg-white dark:bg-[#111111] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shadow-md flex items-center justify-center transition-colors"
        aria-label="Ajuda"
      >
        <HelpCircle size={18} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajuda rápida" size="lg">
        {activeView === 'aluno' ? (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Como agendar uma aula</h4>
              <p>Acesse a aba "Aulas", escolha a modalidade desejada e clique em "Agendar" no card da turma que preferir.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Aula lotada</h4>
              <p>Se a turma estiver lotada, você pode entrar na fila de espera ou ver sugestões de aulas alternativas. Ao ser promovido você recebe uma notificação.</p>
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
              <p>Em "Aulas" você pode editar vagas, trocar professores e registrar a chamada de presença.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Importar alunos</h4>
              <p>Em "Usuários" arraste um arquivo CSV para importação com mapeamento automático de colunas via IA.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Relatórios</h4>
              <p>Analise ocupação, modalidades populares e horários de pico. Exporte em PDF ou Excel.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Configurações</h4>
              <p>Ajuste política de cancelamento, modo da fila (automática/corrida) e antecedência de agendamento.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
