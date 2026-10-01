import { useState } from 'react'
import { Dumbbell, Sun, Moon, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const FEATURES = [
  'Agendamento com fila de espera automática',
  'Dashboards e relatórios em tempo real',
  'Chat direto entre alunos e recepção',
]

export default function LoginPage() {
  const { data, login, isDark, toggleDark } = useApp()
  const [selected, setSelected] = useState<string>('u1')

  const alunos = data.usuarios.filter(u => u.role === 'aluno')
  const admins = data.usuarios.filter(u => u.role === 'admin')

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      {/* Dark toggle */}
      <button
        onClick={toggleDark}
        className="fixed top-5 right-5 z-10 w-10 h-10 rounded-full ios-fill-2 text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center justify-center transition-colors"
        aria-label="Alternar tema"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Brand panel */}
      <aside
        className="hidden md:flex md:w-1/2 lg:w-[48%] relative overflow-hidden text-white p-12 flex-col justify-between"
        style={{
          background:
            'radial-gradient(120% 90% at 0% 0%, #4B55B8 0%, #1F2545 55%, #0A0E26 100%)',
        }}
      >
        {/* Mesh glows */}
        <div
          className="absolute top-[-10%] right-[-15%] w-[560px] h-[560px] rounded-full opacity-45 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-[-20%] left-[-15%] w-[520px] h-[520px] rounded-full opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 dots-pattern opacity-20 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-ios flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 100%)',
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <Dumbbell size={18} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-callout tracking-tight">FitCore</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/14 text-caption2 font-semibold text-white/85 mb-6 tracking-wider uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistema online
          </div>
          <h1 className="text-ltitle leading-[1.1] tracking-tight mb-5">
            A sua academia,<br />
            <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              moderna e inteligente.
            </span>
          </h1>
          <p className="text-callout text-white/60 leading-relaxed mb-10">
            Agendamentos, comunicação e insights em uma plataforma unificada que seus alunos vão adorar usar.
          </p>
          <ul className="space-y-4">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(94,106,210,0.5) 0%, rgba(129,140,248,0.3) 100%)',
                    boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2)',
                  }}
                >
                  <CheckCircle2 size={13} className="text-white" strokeWidth={2.4} />
                </div>
                <span className="text-footnote text-white/80 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-caption2 text-white/30">
          &copy; {new Date().getFullYear()} FitCore. Demonstração local.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center p-6 bg-ios-bg dark:bg-ios-dbg">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2.5 mb-10">
            <div
              className="w-10 h-10 rounded-ios flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                boxShadow: '0 4px 14px rgba(94,106,210,0.4)',
              }}
            >
              <Dumbbell size={17} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-callout tracking-tight text-ios-label dark:text-ios-dlabel">FitCore</span>
          </div>

          <h2 className="text-title1 text-ios-label dark:text-ios-dlabel mb-1">Bem-vindo</h2>
          <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 mb-8">
            Selecione seu perfil para continuar.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="user-select"
                className="block text-caption2 font-semibold uppercase tracking-wider text-ios-label-2 dark:text-ios-dlabel-2 mb-2 px-1"
              >
                Perfil de acesso
              </label>
              <div className="relative">
                <select
                  id="user-select"
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="ios-input appearance-none pr-10"
                >
                  <optgroup label="Alunos">
                    {alunos.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Administradores">
                    {admins.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ios-label-3 dark:text-ios-dlabel-3 pointer-events-none"
                />
              </div>
            </div>

            <button
              onClick={() => login(selected)}
              className="ios-btn-primary w-full !rounded-ios !py-3 !text-callout"
            >
              Entrar <ArrowRight size={15} strokeWidth={2.4} />
            </button>
          </div>

          <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mt-8 leading-relaxed">
            Sistema de demonstração — todos os dados são armazenados localmente no seu navegador.
          </p>
        </div>
      </main>
    </div>
  )
}
