import { useState } from 'react'
import { Send, Trash2, Megaphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'
import { useToast } from '../../context/ToastContext'

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

  const inputCls = 'w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow'

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Comunidade</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publique avisos para todos os alunos</p>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 inline-flex items-center gap-2">
          <Megaphone size={14} className="text-[#5E6AD2]" /> Novo aviso
        </h3>
        <div className="space-y-3">
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título do aviso"
            className={inputCls}
          />
          <textarea
            value={corpo}
            onChange={e => setCorpo(e.target.value)}
            placeholder="Escreva a mensagem que os alunos verão..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
          <div className="flex justify-end">
            <button
              onClick={publish}
              className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={13} /> Publicar
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Avisos publicados</h3>
        {data.comunidadeAvisos.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum aviso publicado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.comunidadeAvisos.map(av => (
              <article key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={authorName(av.autorId)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h4>
                      <button
                        onClick={() => remove(av.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        aria-label="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{av.corpo}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {authorName(av.autorId)} &middot; {new Date(av.timestamp).toLocaleString('pt-BR')}
                    </p>
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
