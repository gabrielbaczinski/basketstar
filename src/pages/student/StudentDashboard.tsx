import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays, ChevronRight, X, Megaphone, CreditCard,
  MessageCircle, ArrowRight, Clock, TrendingUp, Flame, Hourglass,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { modalidadeAccent, modalidadeGradient } from '../../components/ui/Badge'
import type { ModalidadeType } from '../../types'

const QUICK: { to: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; gradient: string }[] = [
  { to: '/aulas',       icon: CalendarDays, label: 'Aulas',       gradient: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)' },
  { to: '/carteirinha', icon: CreditCard,   label: 'Carteirinha', gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)' },
  { to: '/comunidade',  icon: Megaphone,    label: 'Feed',        gradient: 'linear-gradient(135deg, #AF52DE 0%, #DA70FF 100%)' },
  { to: '/chat',        icon: MessageCircle, label: 'Chat',       gradient: 'linear-gradient(135deg, #34C759 0%, #58D068 100%)' },
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

  const minhasFilas = useMemo(() => {
    if (!currentUser) return []
    const result: { aula: typeof data.aulas[0]; dia: string; pos: number }[] = []
    data.aulas.forEach(aula => {
      aula.diasSemana.forEach(dia => {
        const booking = aula.bookingsPorDia[dia]
        const idx = booking?.filaEspera.indexOf(currentUser.id) ?? -1
        if (idx >= 0) result.push({ aula, dia, pos: idx + 1 })
      })
    })
    return result.sort((a, b) => DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia))
  }, [data.aulas, currentUser])

  const profNome = (id: string) => data.professores.find(p => p.id === id)?.nome?.split(' ')[0] ?? '—'
  const avisos = data.comunidadeAvisos.slice(0, 3)
  const first = currentUser?.nome.split(' ')[0] ?? ''
  const isAtivo = currentUser?.statusPlano === 'Ativo'
  const proxima = minhasAulas[0]
  const streak = minhasAulas.length

  return (
    <div className="page-container pt-4 md:pt-5 pb-6">
      {/* Greeting + status pill */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-caption1 font-medium text-ios-label-2 dark:text-ios-dlabel-2">{greeting()},</p>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-tight mt-0.5 truncate">
            {first}
          </h1>
        </div>
        <span
          className={`mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption1 font-semibold shrink-0 ${
            isAtivo ? 'bg-sys-green/14 text-sys-green' : 'bg-sys-red/14 text-sys-red'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse-soft ${isAtivo ? 'bg-sys-green' : 'bg-sys-red'}`} />
          {currentUser?.statusPlano}
        </span>
      </div>

      {/* ─────────── Desktop: 2-column grid; Mobile: stack ─────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">

        {/* ── Column 1: Hero + Suas aulas ── */}
        <div className="space-y-4 min-w-0">
          {/* Hero stat card */}
          <div
            className="relative rounded-ios-xl p-5 overflow-hidden text-white"
            style={{
              background: 'radial-gradient(130% 100% at 0% 0%, #5E6AD2 0%, #4B55B8 50%, #2F3677 100%)',
              boxShadow: '0 12px 32px -8px rgba(94,106,210,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.14)',
            }}
          >
            <div className="absolute inset-0 dots-pattern opacity-30 pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-caption2 uppercase tracking-widest font-semibold text-white/70">Esta semana</p>
                <p className="text-[40px] font-bold tabular-nums leading-none mt-1.5">{streak}</p>
                <p className="text-caption1 font-medium text-white/80 mt-1">
                  {streak === 0 ? 'Vamos começar a treinar?' : `aula${streak !== 1 ? 's' : ''} agendada${streak !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-ios flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
                }}
              >
                <Flame size={18} strokeWidth={2} />
              </div>
            </div>
            {proxima && (
              <div className="relative mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock size={12} className="text-white/80" />
                  <div>
                    <p className="text-caption2 uppercase tracking-wider font-semibold text-white/60">Próxima</p>
                    <p className="text-caption1 font-semibold mt-0.5">
                      {proxima.aula.modalidade} · {proxima.aula.horario}
                    </p>
                  </div>
                </div>
                <Link
                  to="/aulas"
                  className="inline-flex items-center gap-1 text-caption1 font-semibold bg-white/18 hover:bg-white/26 transition-colors rounded-full px-3 py-1"
                >
                  Ver aulas <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>

          {/* Suas aulas */}
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-title3 text-ios-label dark:text-ios-dlabel">Suas aulas</h2>
              <Link to="/aulas" className="text-caption1 font-semibold text-tint-500 inline-flex items-center gap-0.5">
                Ver todas <ChevronRight size={13} />
              </Link>
            </div>

            {minhasAulas.length === 0 && minhasFilas.length === 0 ? (
              <div className="ios-card py-8 flex flex-col items-center gap-2 text-center px-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(94,106,210,0.14) 0%, rgba(129,140,248,0.18) 100%)',
                  }}
                >
                  <CalendarDays size={20} className="text-tint-500" />
                </div>
                <p className="text-headline text-ios-label dark:text-ios-dlabel">Nenhuma aula agendada</p>
                <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 max-w-[220px]">
                  Explore as modalidades e escolha seus horários.
                </p>
                <Link to="/aulas" className="mt-2 ios-btn-primary !py-2 !text-caption1">
                  Explorar aulas <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="ios-card-flat overflow-hidden">
                {minhasAulas.map((item) => {
                  const { aula, dia } = item
                  const accent = modalidadeAccent(aula.modalidade as ModalidadeType)
                  const gradient = modalidadeGradient(aula.modalidade as ModalidadeType)
                  return (
                    <div
                      key={`${aula.id}-${dia}`}
                      className="ios-list-row flex items-center gap-3 px-4 py-2.5"
                    >
                      <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: gradient }} />
                      <div className="shrink-0 w-[50px]">
                        <p className="text-callout font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none">
                          {aula.horario}
                        </p>
                        <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
                          {dia.slice(0, 3)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-footnote font-semibold leading-tight" style={{ color: accent }}>
                          {aula.modalidade}
                        </p>
                        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-0.5 truncate">
                          {profNome(aula.professorId)}
                        </p>
                      </div>
                      <button
                        onClick={() => cancelClassDia(aula.id, dia)}
                        className="w-7 h-7 rounded-full text-ios-label-3 dark:text-ios-dlabel-3 hover:text-sys-red hover:bg-sys-red/10 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Cancelar aula"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
                {/* Waitlist entries */}
                {minhasFilas.map((item) => {
                  const { aula, dia, pos } = item
                  const accent = modalidadeAccent(aula.modalidade as ModalidadeType)
                  return (
                    <div
                      key={`fila-${aula.id}-${dia}`}
                      className="ios-list-row flex items-center gap-3 px-4 py-2.5"
                      style={{ background: 'rgba(255,149,0,0.06)' }}
                    >
                      <div className="w-1 self-stretch rounded-full shrink-0 bg-sys-orange" />
                      <div className="shrink-0 w-[50px]">
                        <p className="text-callout font-bold tabular-nums text-ios-label dark:text-ios-dlabel leading-none">
                          {aula.horario}
                        </p>
                        <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5">
                          {dia.slice(0, 3)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-footnote font-semibold leading-tight truncate" style={{ color: accent }}>
                            {aula.modalidade}
                          </p>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-sys-orange/18 text-sys-orange text-caption2 font-bold rounded-full leading-none shrink-0">
                            <Hourglass size={9} strokeWidth={2.6} /> Fila · {pos}º
                          </span>
                        </div>
                        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-0.5 truncate">
                          {profNome(aula.professorId)} · aguardando
                        </p>
                      </div>
                      <button
                        onClick={() => cancelClassDia(aula.id, dia)}
                        className="w-7 h-7 rounded-full text-ios-label-3 dark:text-ios-dlabel-3 hover:text-sys-red hover:bg-sys-red/10 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Sair da fila"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Column 2: Quick actions + Insights + Avisos (compacted) ── */}
        <div className="space-y-4 min-w-0">

          {/* Quick actions grid */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map(({ to, icon: Icon, label, gradient }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-1.5 py-2.5 rounded-ios-md ios-card-flat hover:shadow-ios-2 active:scale-[0.96] transition-all"
              >
                <div
                  className="w-9 h-9 rounded-ios flex items-center justify-center text-white transition-transform group-hover:scale-[1.06]"
                  style={{
                    background: gradient,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.25)',
                  }}
                >
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-caption2 font-semibold text-ios-label dark:text-ios-dlabel text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Insights snapshot — compact 2-col */}
          <div className="grid grid-cols-2 gap-2">
            <div className="ios-card p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                  Frequência
                </p>
                <TrendingUp size={11} className="text-sys-green" />
              </div>
              <p className="text-title3 font-bold text-ios-label dark:text-ios-dlabel tabular-nums leading-none">
                {Math.min(100, 60 + streak * 8)}%
              </p>
              <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">do objetivo</p>
            </div>
            <div className="ios-card p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
                  Modalidade
                </p>
                <Flame size={11} className="text-sys-orange" />
              </div>
              <p className="text-footnote font-bold text-ios-label dark:text-ios-dlabel leading-tight truncate">
                {minhasAulas[0]?.aula.modalidade ?? '—'}
              </p>
              <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">em destaque</p>
            </div>
          </div>

          {/* Avisos */}
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-title3 text-ios-label dark:text-ios-dlabel">Avisos</h2>
              <Link to="/comunidade" className="text-caption1 font-semibold text-tint-500 inline-flex items-center gap-0.5">
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            {avisos.length === 0 ? (
              <div className="ios-card-flat py-6 text-center">
                <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3">
                  Nenhum aviso recente.
                </p>
              </div>
            ) : (
              <div className="ios-card-flat overflow-hidden">
                {avisos.map(av => (
                  <div key={av.id} className="ios-list-row flex items-start gap-3 px-3.5 py-2.5">
                    <div
                      className="w-7 h-7 rounded-ios flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(94,106,210,0.14) 0%, rgba(129,140,248,0.18) 100%)',
                      }}
                    >
                      <Megaphone size={12} className="text-tint-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-caption1 font-semibold text-ios-label dark:text-ios-dlabel leading-snug">
                          {av.titulo}
                        </h3>
                        <span className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 whitespace-nowrap shrink-0">
                          {new Date(av.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2 mt-0.5 leading-relaxed line-clamp-2">
                        {av.corpo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
