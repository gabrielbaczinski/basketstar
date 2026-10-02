import { useMemo, useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

const ADMIN_ID = 'admin1'

export default function AdminMessages() {
  const { data, sendMensagem, currentUser } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversations = useMemo(() => {
    const map = new Map<string, { userId: string; lastText: string; lastTime: string; unread: boolean }>()
    data.mensagens.forEach(m => {
      const other = m.de === ADMIN_ID ? m.para : m.de === currentUser?.id ? m.para : m.de
      if (other === ADMIN_ID) return
      const existing = map.get(other)
      if (!existing || new Date(m.timestamp) > new Date(existing.lastTime)) {
        map.set(other, { userId: other, lastText: m.texto, lastTime: m.timestamp, unread: m.de !== ADMIN_ID })
      }
    })
    return Array.from(map.values()).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
  }, [data.mensagens, currentUser])

  useEffect(() => {
    if (!selectedId && conversations[0]) setSelectedId(conversations[0].userId)
  }, [conversations, selectedId])

  const currentThread = useMemo(() => {
    if (!selectedId) return []
    return data.mensagens
      .filter(m => (m.de === selectedId && m.para === ADMIN_ID) || (m.de === ADMIN_ID && m.para === selectedId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [data.mensagens, selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentThread.length])

  const userName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? id

  const reply = () => {
    if (!selectedId || !text.trim()) return
    sendMensagem(selectedId, text.trim())
    setText('')
  }

  const selectedUser = selectedId ? data.usuarios.find(u => u.id === selectedId) : null

  return (
    <div className="h-full page-container pt-4 md:pt-5 pb-3 md:pb-6 flex flex-col">
      <div className="mb-3 shrink-0">
        <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Mensagens</h1>
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
          Converse diretamente com os alunos
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[320px_1fr] flex-1 min-h-0">

        {/* Conversation list */}
        <div className="ios-card overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 hairline-b">
            <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
              Conversas · {conversations.length}
            </p>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {conversations.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <MessageSquare size={20} className="text-ios-label-4 dark:text-ios-dlabel-4" />
                <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3">Nenhuma conversa ainda.</p>
              </div>
            )}
            {conversations.map(c => (
              <button
                key={c.userId}
                onClick={() => setSelectedId(c.userId)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selectedId === c.userId
                    ? 'bg-tint-500/10 dark:bg-tint-500/14'
                    : 'hover:bg-ios-fill-3 dark:hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={userName(c.userId)} size="md" />
                  {c.unread && selectedId !== c.userId && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-tint-500 ring-2 ring-white dark:ring-ios-dbg-elev" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-callout font-semibold truncate ${selectedId === c.userId ? 'text-tint-700 dark:text-tint-300' : 'text-ios-label dark:text-ios-dlabel'}`}>
                    {userName(c.userId)}
                  </p>
                  <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 truncate mt-0.5">
                    {c.lastText}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread panel */}
        <div className="ios-card overflow-hidden flex flex-col">
          {selectedId ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3 hairline-b shrink-0">
                <Avatar name={userName(selectedId)} size="md" />
                <div>
                  <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel">
                    {userName(selectedId)}
                  </p>
                  <p className={`text-caption1 font-semibold ${selectedUser?.statusPlano === 'Ativo' ? 'text-sys-green' : 'text-sys-red'}`}>
                    {selectedUser?.statusPlano === 'Ativo' ? 'Plano ativo' : 'Plano inativo'}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-ios-bg dark:bg-ios-dbg">
                {currentThread.map(m => {
                  const mine = m.de === ADMIN_ID
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {!mine && <Avatar name={userName(selectedId)} size="xs" />}
                      <div className={`max-w-[75%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 text-callout leading-relaxed ${
                            mine
                              ? 'text-white rounded-[20px] rounded-br-md'
                              : 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel rounded-[20px] rounded-bl-md shadow-ios-1'
                          }`}
                          style={
                            mine
                              ? { background: 'var(--brand)' }
                              : undefined
                          }
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
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && reply()}
                  placeholder="Escreva uma resposta…"
                  className="flex-1 ios-input !rounded-full !py-2.5"
                />
                <button
                  onClick={reply}
                  disabled={!text.trim()}
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: 'var(--brand)' }}
                  aria-label="Enviar"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(229,90,43,0.10)' }}
              >
                <MessageSquare size={20} className="text-tint-500" />
              </div>
              <p className="text-headline">Selecione uma conversa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
