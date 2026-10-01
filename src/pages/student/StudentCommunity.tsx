import { Megaphone, Pin, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

export default function StudentCommunity() {
  const { data } = useApp()
  const authorName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? 'Academia'

  const [featured, ...rest] = data.comunidadeAvisos

  return (
    <div className="page-container pt-5 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Feed</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Avisos e novidades da academia
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 text-caption1 font-semibold px-3 py-1 rounded-full">
          <Sparkles size={11} /> {data.comunidadeAvisos.length} publicações
        </span>
      </div>

      {data.comunidadeAvisos.length === 0 ? (
        <div className="ios-card py-16 flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(94,106,210,0.14) 0%, rgba(129,140,248,0.18) 100%)',
            }}
          >
            <Megaphone size={22} className="text-tint-500" />
          </div>
          <div>
            <p className="text-headline">Nenhum aviso ainda</p>
            <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
              Novidades da academia aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* ── Feed column ── */}
          <div className="space-y-3 min-w-0">
            {data.comunidadeAvisos.map((av, idx) => (
              <article key={av.id} className="ios-card overflow-hidden">
                {idx === 0 && (
                  <div
                    className="h-1"
                    style={{ background: 'linear-gradient(90deg, #5E6AD2 0%, #818CF8 50%, #AF52DE 100%)' }}
                  />
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={authorName(av.autorId)} size="sm" />
                      <div>
                        <p className="text-caption1 font-semibold text-ios-label dark:text-ios-dlabel leading-tight">
                          {authorName(av.autorId)}
                        </p>
                        <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
                          {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-tint-500/12 text-tint-600 dark:text-tint-300 text-caption2 font-bold rounded-full">
                        <Pin size={10} /> Novo
                      </span>
                    )}
                  </div>

                  <h2 className="text-headline text-ios-label dark:text-ios-dlabel leading-snug mb-1.5">
                    {av.titulo}
                  </h2>
                  <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">
                    {av.corpo}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* ── Sidebar: featured + recent summary ── */}
          <aside className="hidden lg:block space-y-5">
            {featured && (
              <div className="ios-section p-5">
                <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-3">
                  Em destaque
                </p>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-ios flex items-center justify-center shrink-0 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                      boxShadow: '0 4px 10px rgba(94,106,210,0.3)',
                    }}
                  >
                    <Pin size={14} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-callout font-semibold text-ios-label dark:text-ios-dlabel leading-snug">
                      {featured.titulo}
                    </h3>
                    <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1 leading-relaxed line-clamp-3">
                      {featured.corpo}
                    </p>
                    <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 mt-2">
                      {authorName(featured.autorId)} ·{' '}
                      {new Date(featured.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
                  Recentes
                </p>
                <div className="ios-card-flat overflow-hidden">
                  {rest.slice(0, 5).map(av => (
                    <div key={av.id} className="ios-list-row px-4 py-3">
                      <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-snug">
                        {av.titulo}
                      </p>
                      <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5 tabular-nums">
                        {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
