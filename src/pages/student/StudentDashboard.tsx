import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Clock, User, X, Megaphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Badge, { modalidadeVariant, modalidadeAccent } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function StudentDashboard() {
  const { data, currentUser, cancelClass } = useApp()

  const minhasAulas = useMemo(() => {
    if (!currentUser) return []
    return data.aulas.filter(a => a.inscritos.includes(currentUser.id))
  }, [data.aulas, currentUser])

  const professorNome = (id: string) => data.professores.find(p => p.id === id)?.nome ?? '—'

  const avisosRecentes = data.comunidadeAvisos.slice(0, 2)

  const first = currentUser?.nome.split(' ')[0] ?? ''

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {greeting()}, {first}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={currentUser?.statusPlano === 'Ativo' ? 'success' : 'danger'}>
            Plano {currentUser?.statusPlano}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {minhasAulas.length} {minhasAulas.length === 1 ? 'aula agendada' : 'aulas agendadas'}
          </span>
        </div>
      </div>

      {/* Suas aulas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Suas aulas</h2>
          <Link to="/aulas" className="text-xs font-medium text-[#5E6AD2] hover:text-[#4B55B8] inline-flex items-center gap-0.5">
            Ver todas <ChevronRight size={12} />
          </Link>
        </div>

        {minhasAulas.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-12 flex flex-col items-center gap-2 text-center">
            <Calendar size={24} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Nenhuma aula agendada</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Explore as modalidades disponíveis e agende sua primeira aula.
            </p>
            <Link
              to="/aulas"
              className="mt-3 inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Explorar aulas
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden">
            {minhasAulas.map((a, idx) => (
              <div key={a.id} className={`flex items-center gap-4 px-4 py-3.5 ${idx % 2 === 1 ? 'bg-gray-50/60 dark:bg-[#141414]' : ''}`}>
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: modalidadeAccent(a.modalidade) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={modalidadeVariant(a.modalidade)}>{a.modalidade}</Badge>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                      <Clock size={12} className="text-gray-400" />
                      {a.horario}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-flex items-center gap-1">
                    <User size={11} /> {professorNome(a.professorId)} &middot; {a.diasSemana.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => cancelClass(a.id)}
                  className="text-xs font-medium text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 transition-colors"
                >
                  <X size={12} />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Últimos avisos */}
      {avisosRecentes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Últimos avisos</h2>
            <Link to="/comunidade" className="text-xs font-medium text-[#5E6AD2] hover:text-[#4B55B8] inline-flex items-center gap-0.5">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {avisosRecentes.map(av => (
              <div key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#EEF0FD] dark:bg-[#5E6AD2]/15 text-[#5E6AD2] flex items-center justify-center shrink-0">
                    <Megaphone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{av.corpo}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Link
            to="/aulas"
            className="bg-white dark:bg-[#111111] rounded-xl shadow-sm px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition-colors"
          >
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Aulas</span>
          </Link>
          <Link
            to="/carteirinha"
            className="bg-white dark:bg-[#111111] rounded-xl shadow-sm px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition-colors"
          >
            <Avatar name={currentUser?.nome ?? ''} size="xs" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Carteirinha</span>
          </Link>
          <Link
            to="/comunidade"
            className="bg-white dark:bg-[#111111] rounded-xl shadow-sm px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition-colors col-span-2 md:col-span-1"
          >
            <Megaphone size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Comunidade</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
