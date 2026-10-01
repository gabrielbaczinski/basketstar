import { Megaphone, Pin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

export default function StudentCommunity() {
  const { data } = useApp()
  const authorName = (id: string) => data.usuarios.find(u => u.id === id)?.nome ?? 'Academia'

  return (
    <div className="space-y-5 max-w-2xl px-4 md:px-0 pt-4 md:pt-0 pb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Feed</h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Avisos e novidades da academia</p>
      </div>

      {data.comunidadeAvisos.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <Megaphone size={22} className="text-[#5E6AD2]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Nenhum aviso ainda</p>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">Novidades da academia aparecerão aqui.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.comunidadeAvisos.map((av, idx) => (
            <article key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden">
              {/* Accent strip for pinned/first item */}
              {idx === 0 && <div className="h-0.5 bg-gradient-to-r from-[#5E6AD2] to-[#818CF8]" />}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={authorName(av.autorId)} size="sm" />
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{authorName(av.autorId)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EEF0FD] dark:bg-[#1F2545] text-[#5E6AD2] text-[10px] font-semibold rounded-full">
                        <Pin size={9} /> Recente
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug mb-1.5">
                  {av.titulo}
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{av.corpo}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
