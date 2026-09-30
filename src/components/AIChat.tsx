import { useState } from 'react'
import { Sparkles, Send, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface Msg { role: 'user' | 'bot'; text: string }

function respond(text: string, view: 'aluno' | 'admin'): string {
  const t = text.toLowerCase()
  if (view === 'aluno') {
    if (t.includes('pilates')) return 'Temos aulas de Pilates às 08:00 (seg/qua) e 10:00 (ter/qui). Deseja agendar?'
    if (t.includes('muay')) return 'Muay Thai acontece às 07:30 (seg/qua/sex) e 19:00 (ter/qui). Posso te levar até a página de aulas.'
    if (t.includes('spinning')) return 'A aula de Spinning é às 07:00 (seg/qua/sex). Restam poucas vagas!'
    if (t.includes('cancel')) return 'Você pode cancelar até 60 minutos antes do horário da aula, sem penalidade.'
    if (t.includes('fila') || t.includes('espera')) return 'Se a aula estiver lotada, você entra na fila de espera. Assim que alguém cancela, você é promovido automaticamente.'
    if (t.includes('carteirinha') || t.includes('acesso')) return 'Sua carteirinha digital está disponível na aba "Carteirinha". Use o QR Code na catraca.'
    return 'Olá! Posso te ajudar com: agendamento de aulas, cancelamento, fila de espera, carteirinha digital ou mensagens com a academia.'
  } else {
    if (t.includes('ocupa') || t.includes('vagas')) return 'A taxa média de ocupação está em 74%. As aulas de Pilates das 08h estão sempre lotadas — sugiro abrir uma turma extra.'
    if (t.includes('alun') || t.includes('cadastro')) return 'Você pode adicionar novos alunos manualmente ou importar via CSV com mapeamento automático de colunas.'
    if (t.includes('relatório') || t.includes('relatorio')) return 'Os relatórios estão em /relatorios. Insights: horário de pico é 08h e 19h, com Muay Thai crescendo 18% no mês.'
    if (t.includes('mensagem') || t.includes('chat')) return 'Você tem novas mensagens de alunos aguardando resposta na aba Mensagens.'
    return 'Olá, gestor! Posso te ajudar com: análise de ocupação, insights de alunos, sugestões de novas turmas, relatórios e mensagens.'
  }
}

export default function AIChat() {
  const { activeView } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: activeView === 'admin' ? 'Olá! Sou seu assistente de gestão. Como posso ajudar?' : 'Oi! Sou seu assistente virtual da academia. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')

  const send = () => {
    const text = input.trim()
    if (!text) return
    const newMessages: Msg[] = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: respond(text, activeView) }])
    }, 500)
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#5E6AD2] hover:bg-[#4B55B8] text-white shadow-md flex items-center justify-center transition-colors"
        aria-label="Chat com IA"
      >
        <Sparkles size={18} />
      </button>

      {open && (
        <div className="fixed bottom-32 md:bottom-20 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm bg-white dark:bg-[#111111] rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="flex items-center justify-between px-4 py-3 shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1f2937]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#5E6AD2] text-white flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Assistente IA</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-[#0D0D0D]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-[#5E6AD2] text-white rounded-2xl rounded-br-sm'
                    : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white dark:bg-[#111111] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
            />
            <button
              onClick={send}
              className="w-9 h-9 rounded-lg bg-[#5E6AD2] hover:bg-[#4B55B8] text-white flex items-center justify-center transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
