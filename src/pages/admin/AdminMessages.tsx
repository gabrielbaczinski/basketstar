import { useMemo, useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

const ADMIN_ID = 'admin1'

export default function AdminMessages() {
  const { data, sendMensagem, currentUser } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversations = useMemo(() => {
    const map = new Map<string, { userId: string; lastText: string; lastTime: string }>()
    data.mensagens.forEach(m => {
      const other = m.de === ADMIN_ID ? m.para : m.de === currentUser?.id ? m.para : m.de
      if (other === ADMIN_ID) return
      const existing = map.get(other)
      if (!existing || new Date(m.timestamp) > new Date(existing.lastTime)) {
        map.set(other, { userId: other, lastText: m.texto, lastTime: m.timestamp })
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

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Mensagens</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Converse diretamente com os alunos</p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-3 h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)]">
        {/* Left panel */}
        <div className="bg-white dark:bg-[#111111] rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1f2937]">
            <p className="text-[11px] uppercase font-medium text-gray-400 tracking-wider">Conversas</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">Nenhuma conversa ainda.</p>
            )}
            {conversations.map(c => (
              <button
                key={c.userId}
                onClick={() => setSelectedId(c.userId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  selectedId === c.userId
                    ? 'bg-[#F4F4F5] dark:bg-[#1F1F23]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1E]'
                }`}
              >
                <Avatar name={userName(c.userId)} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName(c.userId)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastText}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white dark:bg-[#111111] rounded-lg shadow-sm overflow-hidden flex flex-col">
          {selectedId ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3 shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1f2937]">
                <Avatar name={userName(selectedId)} size="md" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName(selectedId)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aluno</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FAFAFA] dark:bg-[#0D0D0D]">
                {currentThread.map(m => {
                  const mine = m.de === ADMIN_ID
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%]">
                        <div className={`px-3.5 py-2 text-sm ${
                          mine
                            ? 'bg-[#5E6AD2] text-white rounded-lg rounded-br-sm'
                            : 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white rounded-lg rounded-bl-sm'
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
              <div className="p-3 flex items-center gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && reply()}
                  placeholder="Escreva uma resposta..."
                  className="flex-1 bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
                />
                <button
                  onClick={reply}
                  className="w-9 h-9 rounded-lg bg-[#5E6AD2] hover:bg-[#4B55B8] text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Enviar"
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Selecione uma conversa
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
