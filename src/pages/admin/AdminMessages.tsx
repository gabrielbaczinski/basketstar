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
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Mensagens</h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Converse diretamente com os alunos</p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-3 h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">

        {/* Conversation list */}
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 shadow-[0_1px_0_0_#F1F5F9] dark:shadow-[0_1px_0_0_#1A1A1E]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Conversas · {conversations.length}</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <MessageSquare size={20} className="text-gray-300 dark:text-gray-600" />
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Nenhuma conversa ainda.</p>
              </div>
            )}
            {conversations.map(c => (
              <button key={c.userId} onClick={() => setSelectedId(c.userId)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selectedId === c.userId
                    ? 'bg-[#EEF0FD] dark:bg-[#1F2545]'
                    : 'hover:bg-[#F9F9FB] dark:hover:bg-[#1A1A1E]'
                }`}>
                <div className="relative shrink-0">
                  <Avatar name={userName(c.userId)} size="md" />
                  {c.unread && selectedId !== c.userId && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#5E6AD2] ring-2 ring-white dark:ring-[#111111]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold truncate ${selectedId === c.userId ? 'text-[#3730A3] dark:text-[#818CF8]' : 'text-gray-900 dark:text-white'}`}>
                    {userName(c.userId)}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{c.lastText}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread panel */}
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedId ? (
            <>
              <div className="px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_0_0_#F1F5F9] dark:shadow-[0_1px_0_0_#1A1A1E]">
                <div className="relative">
                  <Avatar name={userName(selectedId)} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111111]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{userName(selectedId)}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {selectedUser?.statusPlano === 'Ativo' ? '● Plano ativo' : '○ Plano inativo'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                {currentThread.map(m => {
                  const mine = m.de === ADMIN_ID
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {!mine && <Avatar name={userName(selectedId)} size="xs" />}
                      <div className={`max-w-[72%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
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

              <div className="p-3 shadow-[0_-1px_0_0_#F1F5F9] dark:shadow-[0_-1px_0_0_#1A1A1E] flex items-center gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && reply()}
                  placeholder="Escreva uma resposta…"
                  className="flex-1 bg-[#F9F9FB] dark:bg-[#1A1A1E] rounded-xl px-4 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-[#1F1F23] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-all"
                />
                <button onClick={reply} disabled={!text.trim()}
                  className="w-10 h-10 rounded-xl bg-[#5E6AD2] hover:bg-[#4B55B8] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Enviar">
                  <Send size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
                <MessageSquare size={18} className="text-[#5E6AD2]" />
              </div>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Selecione uma conversa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
