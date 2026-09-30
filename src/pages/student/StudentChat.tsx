import { useMemo, useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

const ADMIN_ID = 'admin1'

export default function StudentChat() {
  const { data, currentUser, sendMensagem } = useApp()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const admin = data.usuarios.find(u => u.id === ADMIN_ID)

  const messages = useMemo(() => {
    if (!currentUser) return []
    return data.mensagens
      .filter(m => (m.de === currentUser.id && m.para === ADMIN_ID) || (m.de === ADMIN_ID && m.para === currentUser.id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [data.mensagens, currentUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = () => {
    const t = text.trim()
    if (!t || !currentUser) return
    sendMensagem(ADMIN_ID, t)
    setText('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Chat com a academia</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fale diretamente com a recepção</p>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1f2937]">
          <Avatar name={admin?.nome ?? 'Admin'} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin?.nome}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FAFAFA] dark:bg-[#0D0D0D]">
          {messages.length === 0 && (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma mensagem ainda. Envie a primeira.
            </p>
          )}
          {messages.map(m => {
            const mine = m.de === currentUser?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  <div className={`px-3.5 py-2 text-sm ${
                    mine
                      ? 'bg-[#5E6AD2] text-white rounded-2xl rounded-br-sm'
                      : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white rounded-2xl rounded-bl-sm'
                  }`}>
                    {m.texto}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${mine ? 'text-right' : 'text-left'}`}>
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
          />
          <button
            onClick={send}
            className="w-9 h-9 rounded-lg bg-[#5E6AD2] hover:bg-[#4B55B8] text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Enviar"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
