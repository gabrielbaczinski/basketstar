import { useMemo, useState, useEffect, useRef } from 'react'
import { Send, Phone, MessageCircle } from 'lucide-react'
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
    <div className="h-full flex flex-col md:page-container md:pt-5 md:pb-6">
      <div className="hidden md:flex mb-3 items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Chat</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Fale diretamente com a recepção
          </p>
        </div>
      </div>

      <div
        className="md:ios-card flex-1 min-h-0 flex flex-col overflow-hidden md:mx-auto w-full bg-white dark:bg-ios-dbg-elev"
        style={{ maxWidth: '880px' }}
      >
        <div className="px-4 py-2.5 flex items-center gap-3 hairline-b shrink-0">
          <div className="relative">
            <Avatar name={admin?.nome ?? 'Admin'} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel">
              {admin?.nome ?? 'Academia'}
            </p>
            <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3">Responde em até 24h</p>
          </div>
          <button
            className="w-9 h-9 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors"
            aria-label="Ligar"
          >
            <Phone size={15} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-ios-bg/60 dark:bg-ios-dbg/60">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(229,90,43,0.10)' }}
              >
                <MessageCircle size={20} className="text-tint-500" />
              </div>
              <p className="text-headline">Nenhuma mensagem</p>
              <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2">Envie a primeira mensagem abaixo.</p>
            </div>
          )}
          {messages.map(m => {
            const mine = m.de === currentUser?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!mine && <Avatar name={admin?.nome ?? 'Admin'} size="xs" />}
                <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-2.5 text-callout leading-relaxed ${
                      mine
                        ? 'text-white rounded-[20px] rounded-br-md'
                        : 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel rounded-[20px] rounded-bl-md shadow-ios-1'
                    }`}
                    style={mine ? { background: 'var(--brand)' } : undefined}
                  >
                    {m.texto}
                  </div>
                  <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 px-2 tabular-nums">
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 hairline-t flex items-center gap-2 bg-white dark:bg-ios-dbg-elev shrink-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Escreva sua mensagem…"
            className="flex-1 ios-input !rounded-full !py-2.5"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--brand)' }}
            aria-label="Enviar"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
