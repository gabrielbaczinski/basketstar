import { useState } from 'react'
import { Dumbbell, Sun, Moon, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const FEATURES = [
  'Agendamento inteligente com fila de espera automática',
  'Dashboards e relatórios em tempo real',
  'Chat direto entre alunos e recepção',
]

export default function LoginPage() {
  const { data, login, isDark, toggleDark } = useApp()
  const [selected, setSelected] = useState<string>('u1')

  const alunos = data.usuarios.filter(u => u.role === 'aluno')
  const admins = data.usuarios.filter(u => u.role === 'admin')

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D0D0D]">
      {/* Dark toggle */}
      <button onClick={toggleDark}
        className="fixed top-4 right-4 z-10 w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
        aria-label="Alternar tema">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Brand panel */}
      <aside className="hidden md:flex md:w-1/2 lg:w-[45%] relative overflow-hidden text-white p-12 flex-col justify-between"
        style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A35 50%, #111128 100%)' }}>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* Gradient glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #5E6AD2 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)' }} />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#5E6AD2] flex items-center justify-center shadow-lg">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">FitCore</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-white/80 mb-5 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sistema ativo
          </div>
          <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4">
            Gerencie sua academia com eficiência
          </h1>
          <p className="text-[14px] text-white/50 leading-relaxed mb-8">
            Uma plataforma moderna para agendamentos, comunicação e insights que impulsionam o crescimento da sua academia.
          </p>
          <ul className="space-y-3.5">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#5E6AD2]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-[#818CF8]" />
                </div>
                <span className="text-[13px] text-white/70 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-white/25">&copy; {new Date().getFullYear()} FitCore. Demonstração local.</p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#5E6AD2] flex items-center justify-center shadow-md">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-gray-900 dark:text-white">FitCore</span>
          </div>

          <h2 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white mb-1">Bem-vindo</h2>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-8">
            Selecione seu perfil para continuar
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="user-select" className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Perfil de acesso
              </label>
              <div className="relative">
                <select id="user-select" value={selected} onChange={e => setSelected(e.target.value)}
                  className="w-full appearance-none bg-[#F9F9FB] dark:bg-[#1A1A1E] text-gray-900 dark:text-white text-[13px] rounded-xl px-4 py-3 pr-10 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow">
                  <optgroup label="Alunos">
                    {alunos.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </optgroup>
                  <optgroup label="Administradores">
                    {admins.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </optgroup>
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button onClick={() => login(selected)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#5E6AD2] hover:bg-[#4B55B8] active:scale-[0.98] text-white text-[13px] font-semibold px-4 py-3 rounded-xl transition-all shadow-md shadow-[#5E6AD2]/20 hover:shadow-[#5E6AD2]/30">
              Entrar <ArrowRight size={15} />
            </button>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
            Sistema de demonstração &mdash; todos os dados são armazenados localmente no seu navegador.
          </p>
        </div>
      </main>
    </div>
  )
}
