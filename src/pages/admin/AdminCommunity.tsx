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

  return (
    <div className="page-container pt-4 md:pt-5 pb-6">
      <div className="mb-4">
        <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Comunidade</h1>
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
          Publique avisos para todos os alunos
        </p>
      </div>

      {/* 2-column on desktop: composer sticky + feed; stacked on mobile */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">

        {/* Composer */}
        <div className="ios-card p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-ios flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                boxShadow: '0 3px 8px rgba(94,106,210,0.26)',
              }}
            >
              <Megaphone size={14} />
            </div>
            <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel">Novo aviso</h3>
          </div>
          <div className="space-y-2.5">
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título do aviso"
              className="ios-input !py-2.5"
            />
            <textarea
              value={corpo}
              onChange={e => setCorpo(e.target.value)}
              placeholder="Escreva a mensagem que os alunos verão…"
              rows={4}
              className="ios-input !py-2.5 resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 tabular-nums">
                {corpo.length} caracteres
              </p>
              <button onClick={publish} className="ios-btn-primary">
                <Send size={13} /> Publicar
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="min-w-0">
          <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
            Publicados · {data.comunidadeAvisos.length}
          </p>
          {data.comunidadeAvisos.length === 0 ? (
            <div className="ios-card py-10 text-center">
              <p className="text-footnote text-ios-label-3 dark:text-ios-dlabel-3">
                Nenhum aviso publicado ainda.
              </p>
            </div>
          ) : (
            <div className="ios-card-flat overflow-hidden">
              {data.comunidadeAvisos.map(av => (
                <article key={av.id} className="ios-list-row flex items-start gap-3 px-4 py-3">
                  <Avatar name={authorName(av.autorId)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h4 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-snug">
                          {av.titulo}
                        </h4>
                        <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
                          {authorName(av.autorId)} ·{' '}
                          {new Date(av.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(av.id)}
                        className="w-7 h-7 rounded-full text-ios-label-3 dark:text-ios-dlabel-3 hover:text-sys-red hover:bg-sys-red/10 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Remover aviso"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed mt-1">
                      {av.corpo}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
