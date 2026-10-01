import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, ChevronRight, X, Megaphone, CreditCard,
  MessageCircle, ArrowRight, Clock, TrendingUp
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const MOD_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  'Pilates':   { dot: '#7C3AED', bg: '#F5F3FF', text: '#6D28D9' },
  'Muay Thai': { dot: '#DC2626', bg: '#FEF2F2', text: '#B91C1C' },
  'Spinning':  { dot: '#D97706', bg: '#FFFBEB', text: '#B45309' },
}

const QUICK = [
  { to: '/aulas',       icon: CalendarDays,   label: 'Aulas',       cls: 'bg-[#EEF0FD] dark:bg-[#1F2545] text-[#5E6AD2]' },
  { to: '/carteirinha', icon: CreditCard,      label: 'Carteirinha', cls: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { to: '/comunidade',  icon: Megaphone,       label: 'Feed',        cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { to: '/chat',        icon: MessageCircle,   label: 'Chat',        cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function StudentDashboard() {
  const { data, currentUser, cancelClassDia } = useApp()

  const minhasAulas = useMemo(() => {
    if (!currentUser) return []
    const result: { aula: typeof data.aulas[0]; dia: string }[] = []
    data.aulas.forEach(aula => {
      aula.diasSemana.forEach(dia => {
        const booking = aula.bookingsPorDia[dia]
        if (booking?.inscritos.includes(currentUser.id)) result.push({ aula, dia })
      })
    })
    return result.sort((a, b) => DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia))
  }, [data.aulas, currentUser])

  const profNome = (id: string) => data.professores.find(p => p.id === id)?.nome?.split(' ')[0] ?? '—'
  const avisos = data.comunidadeAvisos.slice(0, 3)
  const first = currentUser?.nome.split(' ')[0] ?? ''
  const isAtivo = currentUser?.statusPlano === 'Ativo'
  const proxima = minhasAulas[0]

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-6 space-y-5">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500">{greeting()}</p>
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white leading-tight mt-0.5">{first}</h1>
        </div>
        <span className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          isAtivo
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {currentUser?.statusPlano}
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={11} className="text-[#5E6AD2]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Agendadas</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums leading-none mt-1">{minhasAulas.length}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">aula{minhasAulas.length !== 1 ? 's' : ''} na semana</p>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={11} className="text-[#5E6AD2]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Próxima</p>
          </div>
          {proxima ? (
            <>
              <p className="text-[18px] font-bold text-gray-900 dark:text-white tabular-nums leading-tight mt-1">{proxima.aula.horario}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{proxima.aula.modalidade} · {proxima.dia.slice(0, 3)}</p>
            </>
          ) : (
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1.5">Nenhuma</p>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK.map(({ to, icon: Icon, label, cls }) => (
          <Link key={to} to={to}
            className="flex flex-col items-center gap-2 bg-white dark:bg-[#111111] rounded-xl shadow-sm py-4 hover:shadow-md active:scale-95 transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls}`}>
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Suas aulas ── */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">Suas aulas</h2>
          <Link to="/aulas" className="text-[12px] font-medium text-[#5E6AD2] inline-flex items-center gap-0.5">
            Ver todas <ChevronRight size={12} />
          </Link>
        </div>

        {minhasAulas.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm py-10 flex flex-col items-center gap-2 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center mb-1">
              <CalendarDays size={22} className="text-[#5E6AD2]" />
            </div>
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Nenhuma aula agendada</p>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 max-w-[200px] leading-relaxed">
              Explore as modalidades disponíveis e escolha seus horários.
            </p>
            <Link to="/aulas"
              className="mt-3 inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95">
              Explorar aulas <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden">
            {minhasAulas.map((item, idx) => {
              const { aula, dia } = item
              const c = MOD_COLOR[aula.modalidade] ?? { dot: '#5E6AD2', bg: '#EEF0FD', text: '#3730A3' }
              return (
                <div key={`${aula.id}-${dia}`}
                  className={`flex items-center gap-3.5 px-4 py-3.5 ${idx > 0 ? 'shadow-[0_-1px_0_0_#F1F5F9] dark:shadow-[0_-1px_0_0_#1A1A1E]' : ''}`}>
                  <div className="w-2 self-stretch rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{aula.modalidade}</span>
                      <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>{aula.horario}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <Clock size={9} /> {profNome(aula.professorId)} · {dia}
                    </p>
                  </div>
                  <button onClick={() => cancelClassDia(aula.id, dia)}
                    className="w-7 h-7 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Cancelar aula">
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Avisos ── */}
      {avisos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">Avisos</h2>
            <Link to="/comunidade" className="text-[12px] font-medium text-[#5E6AD2] inline-flex items-center gap-0.5">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {avisos.map(av => (
              <div key={av.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={15} className="text-[#5E6AD2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug">{av.titulo}</h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0 mt-0.5">
                      {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{av.corpo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
