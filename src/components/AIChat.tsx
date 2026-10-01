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
    { role: 'bot', text: activeView === 'admin' ? 'Olá! Sou seu assistente de gestão. Como posso ajudar?' : 'Oi! Sou seu assistente virtual da academia. Como posso ajudar?' },
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
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-12 h-12 rounded-full text-white flex items-center justify-center transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #AF52DE 0%, #5E6AD2 100%)',
          boxShadow: '0 8px 24px rgba(94,106,210,0.4), 0 2px 6px rgba(94,106,210,0.3)',
        }}
        aria-label="Chat com IA"
      >
        <Sparkles size={19} />
      </button>

      {open && (
        <div
          className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm ios-card flex flex-col overflow-hidden animate-scale-in"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex items-center justify-between px-4 py-3 hairline-b">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-ios flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #AF52DE 0%, #5E6AD2 100%)',
                  boxShadow: '0 2px 6px rgba(175,82,222,0.3)',
                }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-tight">Assistente IA</p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">Powered by FitCore</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ios-bg dark:bg-ios-dbg">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-footnote leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white rounded-[16px] rounded-br-md'
                      : 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel rounded-[16px] rounded-bl-md shadow-ios-1'
                  }`}
                  style={
                    m.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                          boxShadow: '0 2px 6px rgba(94,106,210,0.28)',
                        }
                      : undefined
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 flex gap-2 bg-white dark:bg-ios-dbg-elev hairline-t">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Digite sua pergunta…"
              className="ios-input !rounded-full !py-2"
            />
            <button
              onClick={send}
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                boxShadow: '0 4px 12px rgba(94,106,210,0.3)',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
