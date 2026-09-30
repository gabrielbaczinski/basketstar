import { Megaphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

export default function StudentCommunity() {
  const { data } = useApp()

  const authorName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? 'Academia'

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Comunidade</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avisos e novidades da academia</p>
      </div>

      {data.comunidadeAvisos.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-16 flex flex-col items-center gap-2 text-center">
          <Megaphone size={24} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Nenhum aviso ainda</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Novidades da academia aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.comunidadeAvisos.map(av => (
            <article key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h2>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{av.corpo}</p>
              <div className="flex items-center gap-2 mt-4">
                <Avatar name={authorName(av.autorId)} size="xs" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{authorName(av.autorId)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
