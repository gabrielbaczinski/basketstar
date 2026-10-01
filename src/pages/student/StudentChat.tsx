import { useMemo, useState, useEffect, useRef } from 'react'
import { Send, Phone } from 'lucide-react'
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
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] max-w-2xl mx-auto px-4 md:px-0 pt-4 md:pt-0">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Chat</h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Fale diretamente com a recepção</p>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_0_0_#F1F5F9] dark:shadow-[0_1px_0_0_#1A1A1E]">
          <div className="relative">
            <Avatar name={admin?.nome ?? 'Admin'} size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111111]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{admin?.nome ?? 'Academia'}</p>
            <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-medium">Online</p>
          </div>
          <button className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors" aria-label="Ligar">
            <Phone size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
                <Send size={18} className="text-[#5E6AD2]" />
              </div>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Nenhuma mensagem ainda</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500">Envie a primeira mensagem abaixo.</p>
            </div>
          )}
          {messages.map(m => {
            const mine = m.de === currentUser?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!mine && <Avatar name={admin?.nome ?? 'Admin'} size="xs" />}
                <div className={`max-w-[72%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 text-[13px] leading-relaxed ${
                    mine
                      ? 'bg-[#5E6AD2] text-white rounded-2xl rounded-br-md shadow-sm'
                      : 'bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    {m.texto}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 shadow-[0_-1px_0_0_#F1F5F9] dark:shadow-[0_-1px_0_0_#1A1A1E] flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Escreva sua mensagem…"
            className="flex-1 bg-[#F9F9FB] dark:bg-[#1A1A1E] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-[#1F1F23] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-all"
          />
          <button onClick={send} disabled={!text.trim()}
            className="w-10 h-10 rounded-xl bg-[#5E6AD2] hover:bg-[#4B55B8] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Enviar">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
