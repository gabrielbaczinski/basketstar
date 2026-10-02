import { useState } from 'react'
import {
  Dumbbell, Sun, Moon, ArrowRight, Sparkles, CalendarCheck,
  MessageSquare, BarChart3, AlertCircle, Shield, UserPlus, Mail,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'

const FEATURES = [
  { icon: CalendarCheck, label: 'Agendamentos', text: 'Gerencie sua agenda com fila de espera automática' },
  { icon: BarChart3,     label: 'Insights',     text: 'Dashboards e relatórios em tempo real' },
  { icon: MessageSquare, label: 'Comunicação',  text: 'Chat direto entre alunos e recepção' },
]

export default function LoginPage() {
  const { data, login, signupAndLogin, isDark, toggleDark } = useApp()
  const [emailInput, setEmailInput] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupOpen, setSignupOpen] = useState(false)

  const matchedUser = emailInput.trim()
    ? data.usuarios.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase())
    : null

  const handleLogin = () => {
    setLoginError(null)
    const trimmed = emailInput.trim()
    if (!trimmed) {
      setLoginError('Informe seu email para continuar.')
      return
    }
    if (!matchedUser) {
      setLoginError('Email não cadastrado. Verifique ou crie uma conta.')
      return
    }
    const res = login(matchedUser.id)
    if (res === 'inactive') {
      setLoginError(`A matrícula de ${matchedUser.nome.split(' ')[0]} está inativa. Procure a recepção para regularizar.`)
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
            'radial-gradient(120% 90% at 0% 0%, #C54820 0%, #7A2B12 55%, #2A0E06 100%)',
        }}
      >
        {/* Mesh glows */}
        <div
          className="absolute top-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #FF8A65 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-[-20%] left-[-15%] w-[560px] h-[560px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F06838 0%, transparent 60%)' }}
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
            <span className="text-white/80">
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
                    background: 'rgba(255,255,255,0.18)',
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
              style={{ background: 'var(--brand)' }}
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
            Entre com seu email para continuar.
          </p>

          {/* Email input */}
          <div className="mb-3">
            <label htmlFor="email-input" className="block text-caption2 font-semibold uppercase tracking-wider text-ios-label-2 dark:text-ios-dlabel-2 mb-2 px-1">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ios-label-3 dark:text-ios-dlabel-3 pointer-events-none" />
              <input
                id="email-input"
                type="email"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setLoginError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="seu@email.com"
                className="ios-input !pl-9"
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          {/* Matched user preview card */}
          {matchedUser && (
            <div className="ios-card p-3 mb-4 flex items-center gap-3 animate-fade-up">
              <Avatar name={matchedUser.nome} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel truncate">
                  {matchedUser.nome}
                </p>
                <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 truncate">
                  {matchedUser.email}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption2 font-bold shrink-0 ${
                  matchedUser.role === 'admin'
                    ? 'bg-tint-500/14 text-tint-600 dark:text-tint-300'
                    : matchedUser.statusPlano === 'Ativo'
                      ? 'bg-sys-green/14 text-sys-green'
                      : 'bg-sys-red/14 text-sys-red'
                }`}
              >
                {matchedUser.role === 'admin' ? <Shield size={9} /> : null}
                {matchedUser.role === 'admin' ? 'Admin' : matchedUser.statusPlano}
              </span>
            </div>
          )}

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

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-ios-separator dark:bg-ios-dseparator" />
            <span className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">
              ou
            </span>
            <div className="h-px flex-1 bg-ios-separator dark:bg-ios-dseparator" />
          </div>

          <button
            onClick={() => setSignupOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-ios-fill-2 hover:ios-fill-1 text-ios-label dark:text-ios-dlabel text-callout font-semibold py-3 rounded-ios transition-colors active:scale-[0.98]"
          >
            <UserPlus size={15} strokeWidth={2.2} /> Criar nova conta
          </button>

          {/* Quick-switch for demo */}
          <QuickSwitch onSelect={(email) => { setEmailInput(email); setLoginError(null) }} />

          <div className="flex items-center justify-center gap-1.5 mt-6">
            <Sparkles size={11} className="text-ios-label-3 dark:text-ios-dlabel-3" />
            <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 text-center">
              Demonstração local — dados salvos apenas no navegador.
            </p>
          </div>
        </div>
      </main>

      {signupOpen && (
        <SignupModal
          initialEmail={emailInput}
          onClose={() => setSignupOpen(false)}
          onSignup={(form) => {
            signupAndLogin(form)
            setSignupOpen(false)
          }}
        />
      )}
    </div>
  )
}

/* ─────────────────── Quick Switch (demo) ─────────────────── */

function QuickSwitch({ onSelect }: { onSelect: (email: string) => void }) {
  const { data } = useApp()
  const [open, setOpen] = useState(false)
  const alunos = data.usuarios.filter(u => u.role === 'aluno')
  const admins = data.usuarios.filter(u => u.role === 'admin')

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-wider flex items-center justify-center gap-1.5 py-2 hover:text-ios-label-2 dark:hover:text-ios-dlabel-2 transition-colors"
      >
        Acesso rápido — demo
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 ios-card overflow-hidden animate-fade-up max-h-[260px] overflow-y-auto">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Alunos</p>
          </div>
          {alunos.map(u => (
            <button
              key={u.id}
              type="button"
              onClick={() => { onSelect(u.email); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-ios-fill-2 dark:hover:bg-ios-dfill-2 transition-colors text-left"
            >
              <Avatar name={u.nome} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-caption1 font-semibold text-ios-label dark:text-ios-dlabel truncate">{u.nome}</p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 truncate">{u.email}</p>
              </div>
              {u.statusPlano === 'Inativo' && (
                <span className="text-caption2 font-semibold text-sys-red shrink-0">Inativo</span>
              )}
            </button>
          ))}
          <div className="px-3 pt-2.5 pb-1 mt-1 border-t border-ios-separator dark:border-ios-dseparator">
            <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Administradores</p>
          </div>
          {admins.map(u => (
            <button
              key={u.id}
              type="button"
              onClick={() => { onSelect(u.email); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 pb-3 hover:bg-ios-fill-2 dark:hover:bg-ios-dfill-2 transition-colors text-left"
            >
              <Avatar name={u.nome} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-caption1 font-semibold text-ios-label dark:text-ios-dlabel truncate">{u.nome}</p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 truncate">{u.email}</p>
              </div>
              <span className="text-caption2 font-semibold text-tint-600 dark:text-tint-300 shrink-0 flex items-center gap-0.5">
                <Shield size={9} /> Admin
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────── Signup Modal ─────────────────── */

interface SignupForm {
  nome: string
  email: string
  celular: string
  idade: number
  dataNascimento: string
}

function SignupModal({
  initialEmail = '',
  onClose,
  onSignup,
}: {
  initialEmail?: string
  onClose: () => void
  onSignup: (f: SignupForm) => void
}) {
  const { data } = useApp()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [celular, setCelular] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    const n = nome.trim()
    const e = email.trim()
    const c = celular.trim()
    if (!n) return setError('Informe seu nome completo.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return setError('Informe um email válido.')
    if (data.usuarios.some(u => u.email.toLowerCase() === e.toLowerCase()))
      return setError('Este email já está cadastrado. Tente fazer login.')
    if (!c) return setError('Informe seu celular.')
    if (!dataNascimento) return setError('Informe sua data de nascimento.')
    const i = Math.floor((Date.now() - new Date(dataNascimento + 'T12:00:00').getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (!Number.isFinite(i) || i < 10 || i > 100) return setError('Data de nascimento inválida (deve ter entre 10 e 100 anos).')
    onSignup({ nome: n, email: e, celular: c, idade: i, dataNascimento })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Criar conta"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="ios-btn-gray">Cancelar</button>
          <button onClick={submit} className="ios-btn-primary">
            <UserPlus size={14} strokeWidth={2.4} /> Criar e entrar
          </button>
        </div>
      }
    >
      <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 mb-4">
        Crie sua conta de aluno em segundos. Após o cadastro, você entra automaticamente e pode começar a agendar aulas.
      </p>
      <div className="space-y-3">
        <SignupField label="Nome completo">
          <input
            type="text"
            value={nome}
            onChange={e => { setNome(e.target.value); setError('') }}
            placeholder="Ex.: João da Silva"
            className="ios-input"
            autoFocus
          />
        </SignupField>
        <SignupField label="Email">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="voce@exemplo.com"
            className="ios-input"
          />
        </SignupField>
        <div className="grid grid-cols-2 gap-3">
          <SignupField label="Celular">
            <input
              type="tel"
              value={celular}
              onChange={e => { setCelular(e.target.value); setError('') }}
              placeholder="(41) 9 0000-0000"
              className="ios-input"
            />
          </SignupField>
          <SignupField label="Nascimento">
            <input
              type="date"
              value={dataNascimento}
              onChange={e => { setDataNascimento(e.target.value); setError('') }}
              className="ios-input"
              max={new Date(Date.now() - 10 * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
            />
          </SignupField>
        </div>
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 bg-sys-red/12 text-sys-red rounded-ios text-caption1">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">
          Ao criar sua conta, você aceita os termos de uso da demonstração. Nenhum dado é enviado — tudo fica salvo apenas no seu navegador.
        </p>
      </div>
    </Modal>
  )
}

function SignupField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-caption2 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 mb-1.5 uppercase tracking-wider px-1">
        {label}
      </label>
      {children}
    </div>
  )
}

