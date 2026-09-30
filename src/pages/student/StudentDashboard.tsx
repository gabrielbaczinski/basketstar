import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, User, X, Megaphone, CreditCard, MessageCircle, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Badge, { modalidadeVariant, modalidadeAccent } from '../../components/ui/Badge'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const quickActions = [
  { to: '/aulas', icon: Calendar, label: 'Aulas', color: '#5E6AD2', bg: '#EEF0FD' },
  { to: '/carteirinha', icon: CreditCard, label: 'Carteirinha', color: '#0EA5E9', bg: '#E0F2FE' },
  { to: '/comunidade', icon: Megaphone, label: 'Feed', color: '#8B5CF6', bg: '#EDE9FE' },
  { to: '/chat', icon: MessageCircle, label: 'Chat', color: '#10B981', bg: '#D1FAE5' },
]

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
    <div className="space-y-0">

      {/* ── Hero section ── */}
      <section className="md:hidden px-4 pt-4 pb-6 bg-white dark:bg-[#1C1C1E]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">{greeting()}</p>
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white leading-tight mt-0.5">
              {first}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentUser?.statusPlano === 'Ativo' ? 'success' : 'danger'} className="text-[11px]">
              {currentUser?.statusPlano}
            </Badge>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Aulas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{minhasAulas.length}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">agendadas</p>
          </div>
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Próxima</p>
            {minhasAulas.length > 0 ? (
              <>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight mt-1">{minhasAulas[0].horario}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">{minhasAulas[0].modalidade}</p>
              </>
            ) : (
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-2">Nenhuma</p>
            )}
          </div>
        </div>
      </section>

      {/* Desktop greeting */}
      <div className="hidden md:block mb-6">
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

      {/* ── Quick actions (horizontal scroll on mobile) ── */}
      <section className="md:mb-8">
        <div className="flex gap-3 overflow-x-auto px-4 md:px-0 py-4 md:py-0 no-scrollbar">
          {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div
                className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                style={{ backgroundColor: bg }}
              >
                <Icon size={26} style={{ color }} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Suas aulas ── */}
      <section className="px-4 md:px-0 pb-4 md:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] md:text-sm font-semibold text-gray-900 dark:text-white">Suas aulas</h2>
          <Link to="/aulas" className="text-[13px] md:text-xs font-medium text-[#5E6AD2] inline-flex items-center gap-0.5">
            Ver todas <ChevronRight size={13} />
          </Link>
        </div>

        {minhasAulas.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-center mb-1">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <p className="text-[15px] font-semibold text-gray-900 dark:text-white">Nenhuma aula agendada</p>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 max-w-[220px] leading-relaxed">
              Explore as modalidades disponíveis e agende sua primeira aula.
            </p>
            <Link
              to="/aulas"
              className="mt-3 inline-flex items-center gap-1.5 bg-[#5E6AD2] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-colors active:scale-95"
            >
              Explorar aulas <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm overflow-hidden">
            {minhasAulas.map((a, idx) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 px-4 py-4 active:bg-gray-50 dark:active:bg-[#2C2C2E] transition-colors ${idx % 2 === 1 ? 'bg-[#F9F9F9] dark:bg-[#242424]' : ''}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${modalidadeAccent(a.modalidade)}20` }}
                >
                  <Calendar size={18} style={{ color: modalidadeAccent(a.modalidade) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-900 dark:text-white">{a.modalidade}</span>
                    <Badge variant={modalidadeVariant(a.modalidade)} className="text-[10px]">{a.horario}</Badge>
                  </div>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 inline-flex items-center gap-1 truncate">
                    <User size={10} /> {professorNome(a.professorId)} · {a.diasSemana.slice(0, 2).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => cancelClass(a.id)}
                  className="w-8 h-8 rounded-full text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  aria-label="Cancelar aula"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Últimos avisos ── */}
      {avisosRecentes.length > 0 && (
        <section className="px-4 md:px-0 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] md:text-sm font-semibold text-gray-900 dark:text-white">Avisos</h2>
            <Link to="/comunidade" className="text-[13px] md:text-xs font-medium text-[#5E6AD2] inline-flex items-center gap-0.5">
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3 md:grid md:gap-3 md:grid-cols-2 md:space-y-0">
            {avisosRecentes.map(av => (
              <div key={av.id} className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF0FD] dark:bg-[#5E6AD2]/15 text-[#5E6AD2] flex items-center justify-center shrink-0">
                  <Megaphone size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h3>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed line-clamp-2">{av.corpo}</p>
                  <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-2">
                    {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
