import { useState } from 'react'
import { Send, Trash2, Megaphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'
import { useToast } from '../../context/ToastContext'

const INPUT_CLS = 'w-full bg-[#F9F9FB] dark:bg-[#0D0D0F] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow'

export default function AdminCommunity() {
  const { data, addAviso, deleteAviso } = useApp()
  const { showToast } = useToast()
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')

  const authorName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? 'Admin'

  const publish = () => {
    if (!titulo.trim() || !corpo.trim()) {
      showToast('Preencha título e mensagem.', 'warning')
      return
    }
    addAviso(titulo, corpo)
    showToast('Aviso publicado.', 'success')
    setTitulo('')
    setCorpo('')
  }

  const remove = (id: string) => {
    deleteAviso(id)
    showToast('Aviso removido.', 'info')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Comunidade</h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Publique avisos para todos os alunos</p>
      </div>

      {/* Composer */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <Megaphone size={13} className="text-[#5E6AD2]" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Novo aviso</h3>
        </div>
        <div className="space-y-3">
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título do aviso"
            className={INPUT_CLS}
          />
          <textarea
            value={corpo}
            onChange={e => setCorpo(e.target.value)}
            placeholder="Escreva a mensagem que os alunos verão..."
            rows={4}
            className={`${INPUT_CLS} resize-none`}
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{corpo.length} caracteres</p>
            <button
              onClick={publish}
              className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] active:scale-95 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all"
            >
              <Send size={13} /> Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Publicados · {data.comunidadeAvisos.length}
        </p>
        {data.comunidadeAvisos.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-10 text-center">
            <p className="text-[13px] text-gray-400 dark:text-gray-500">Nenhum aviso publicado ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.comunidadeAvisos.map(av => (
              <article key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={authorName(av.autorId)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {authorName(av.autorId)} · {new Date(av.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(av.id)}
                        className="w-7 h-7 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Remover aviso"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{av.corpo}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
