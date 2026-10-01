import { useState } from 'react'
import {
  Dumbbell, Sun, Moon, ArrowRight, Sparkles, CalendarCheck,
  MessageSquare, BarChart3, AlertCircle, Shield,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Avatar from '../components/ui/Avatar'

const FEATURES = [
  { icon: CalendarCheck, label: 'Agendamentos', text: 'Gerencie sua agenda com fila de espera automática' },
  { icon: BarChart3,     label: 'Insights',     text: 'Dashboards e relatórios em tempo real' },
  { icon: MessageSquare, label: 'Comunicação',  text: 'Chat direto entre alunos e recepção' },
]

export default function LoginPage() {
  const { data, login, isDark, toggleDark } = useApp()
  const [selected, setSelected] = useState<string>('u1')
  const [loginError, setLoginError] = useState<string | null>(null)

  const alunos = data.usuarios.filter(u => u.role === 'aluno')
  const admins = data.usuarios.filter(u => u.role === 'admin')
  const selectedUser = data.usuarios.find(u => u.id === selected)

  const handleLogin = () => {
    setLoginError(null)
    const res = login(selected)
    if (res === 'inactive') {
      setLoginError(`A matrícula de ${selectedUser?.nome.split(' ')[0] ?? 'este aluno'} está inativa. Procure a recepção para regularizar.`)
    } else if (res === 'not_found') {
      setLoginError('Usuário não encontrado.')
    }
  }

  return (
    <div className="min-h-screen flex bg-ios-bg dark:bg-ios-dbg relative overflow-hidden">
      {/* Ambient aurora */}
      <div className="aurora-bg" aria-hidden="true" />

      {/* Dark toggle */}
      <button
        onClick={toggleDark}
        className="fixed top-5 right-5 z-20 w-10 h-10 rounded-full ios-glass-heavy text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors shadow-ios-2"
        aria-label="Alternar tema"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* ─────────── Brand panel (desktop only) ─────────── */}
      <aside
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden text-white p-12 flex-col justify-between"
        style={{
          background:
            'radial-gradient(120% 90% at 0% 0%, #4B55B8 0%, #1F2545 55%, #0A0E26 100%)',
        }}
      >
        {/* Mesh glows */}
        <div
          className="absolute top-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full opacity-45 pointer-events-none animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-[-20%] left-[-15%] w-[560px] h-[560px] rounded-full opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 dots-pattern opacity-20 pointer-events-none" />

        {/* Top: brand */}
        <div className="relative flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-ios-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 100%)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <Dumbbell size={20} strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-callout tracking-tight">FitCore</p>
            <p className="text-caption2 font-medium text-white/55 uppercase tracking-[0.14em]">Gym Platform</p>
          </div>
        </div>

        {/* Middle: pitch */}
        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/14 text-caption2 font-semibold text-white/85 mb-6 tracking-wider uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sys-green animate-pulse" />
            Sistema online
          </div>
          <h1 className="text-ltitle leading-[1.1] tracking-tight mb-5">
            A sua academia,<br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent">
              moderna e inteligente.
            </span>
          </h1>
          <p className="text-callout text-white/65 leading-relaxed mb-10">
            Agendamentos, comunicação e insights em uma plataforma unificada que seus alunos vão adorar usar.
          </p>
          <ul className="space-y-4">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-ios flex items-center justify-center shrink-0 text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(94,106,210,0.5) 0%, rgba(129,140,248,0.3) 100%)',
                    boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2)',
                  }}
                >
                  <f.icon size={17} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-footnote font-semibold text-white">{f.label}</p>
                  <p className="text-caption1 text-white/60 leading-relaxed mt-0.5">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="relative text-caption2 text-white/30">
          &copy; {new Date().getFullYear()} FitCore. Demonstração local.
        </p>
      </aside>

      {/* ─────────── Form panel ─────────── */}
      <main className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Brand (visible on mobile and tablet) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-ios-md flex items-center justify-center text-white mb-3"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                boxShadow: '0 10px 24px rgba(94,106,210,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.25)',
              }}
            >
              <Dumbbell size={22} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-title3 tracking-tight text-ios-label dark:text-ios-dlabel">
              FitCore
            </span>
            <span className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-[0.14em] mt-1">
              Gym Platform
            </span>
          </div>

          <h2 className="text-title1 text-ios-label dark:text-ios-dlabel mb-1 text-center lg:text-left">
            Bem-vindo
          </h2>
          <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 mb-6 text-center lg:text-left">
            Selecione seu perfil para continuar.
          </p>

          {/* Selected user preview card */}
          {selectedUser && (
            <div className="ios-card p-3 mb-3 flex items-center gap-3 animate-fade-up">
              <Avatar name={selectedUser.nome} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel truncate">
                  {selectedUser.nome}
                </p>
                <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 truncate">
                  {selectedUser.email}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption2 font-bold shrink-0 ${
                  selectedUser.role === 'admin'
                    ? 'bg-tint-500/14 text-tint-600 dark:text-tint-300'
                    : selectedUser.statusPlano === 'Ativo'
                      ? 'bg-sys-green/14 text-sys-green'
                      : 'bg-sys-red/14 text-sys-red'
                }`}
              >
                {selectedUser.role === 'admin' ? <Shield size={9} /> : null}
                {selectedUser.role === 'admin' ? 'Admin' : selectedUser.statusPlano}
              </span>
            </div>
          )}

          {/* User selector list (grouped list) */}
          <div className="ios-card-flat overflow-hidden mb-4">
            <GroupLabel>Alunos</GroupLabel>
            {alunos.map(u => (
              <UserRow
                key={u.id}
                nome={u.nome}
                detail={u.statusPlano === 'Inativo' ? 'Matrícula inativa' : u.email}
                inactive={u.statusPlano === 'Inativo'}
                selected={selected === u.id}
                onSelect={() => setSelected(u.id)}
              />
            ))}
            <GroupLabel>Administradores</GroupLabel>
            {admins.map(u => (
              <UserRow
                key={u.id}
                nome={u.nome}
                detail="Acesso completo"
                admin
                selected={selected === u.id}
                onSelect={() => setSelected(u.id)}
              />
            ))}
          </div>

          {loginError && (
            <div className="flex items-start gap-2 px-3.5 py-2.5 bg-sys-red/12 text-sys-red rounded-ios text-caption1 mb-3 animate-fade-up">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span className="flex-1">{loginError}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="ios-btn-primary w-full !rounded-ios !py-3 !text-callout"
          >
            Entrar <ArrowRight size={15} strokeWidth={2.4} />
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-6">
            <Sparkles size={11} className="text-ios-label-3 dark:text-ios-dlabel-3" />
            <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 text-center">
              Demonstração local — dados salvos apenas no navegador.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-1.5 bg-ios-fill-3 dark:bg-white/[0.03] text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
      {children}
    </div>
  )
}

function UserRow({
  nome, detail, selected, admin, inactive, onSelect,
}: {
  nome: string; detail: string; selected: boolean
  admin?: boolean; inactive?: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`ios-list-row w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
        selected
          ? 'bg-tint-500/10 dark:bg-tint-500/14'
          : 'hover:bg-ios-fill-3 dark:hover:bg-white/5'
      }`}
    >
      <Avatar name={nome} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`text-footnote font-semibold truncate ${
          selected
            ? 'text-tint-700 dark:text-tint-300'
            : inactive
              ? 'text-ios-label-2 dark:text-ios-dlabel-2'
              : 'text-ios-label dark:text-ios-dlabel'
        }`}>
          {nome}
        </p>
        <p className={`text-caption2 truncate mt-0.5 ${
          inactive ? 'text-sys-red' : 'text-ios-label-3 dark:text-ios-dlabel-3'
        }`}>
          {detail}
        </p>
      </div>
      {admin && (
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-tint-500/14 text-tint-600 dark:text-tint-300 shrink-0">
          Admin
        </span>
      )}
      {selected && (
        <span className="w-5 h-5 rounded-full bg-tint-500 flex items-center justify-center shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  )
}
