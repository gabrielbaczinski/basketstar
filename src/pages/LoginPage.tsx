import { useState } from 'react'
import { Dumbbell, Sun, Moon, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { data, login, isDark, toggleDark } = useApp()
  const [selected, setSelected] = useState<string>('u1')

  const alunos = data.usuarios.filter(u => u.role === 'aluno')
  const admins = data.usuarios.filter(u => u.role === 'admin')

  const handleLogin = () => login(selected)

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D0D0D]">
      {/* Dark toggle - floating */}
      <button
        onClick={toggleDark}
        className="fixed top-4 right-4 z-10 w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
        aria-label="Alternar tema"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Left brand panel - hidden on mobile */}
      <aside className="hidden md:flex md:w-1/2 lg:w-[45%] bg-[#111111] text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#5E6AD2] flex items-center justify-center">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">FitCore</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-3">
            Gerencie sua academia com eficiência
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">
            Uma plataforma moderna para agendamentos, comunicação e insights que impulsionam o crescimento da sua academia.
          </p>

          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#5E6AD2] mt-0.5 shrink-0" />
              <span>Agendamento inteligente com fila de espera automática</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#5E6AD2] mt-0.5 shrink-0" />
              <span>Dashboards e relatórios em tempo real</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#5E6AD2] mt-0.5 shrink-0" />
              <span>Chat direto entre alunos e recepção</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} FitCore. Demonstração local.
        </p>
      </aside>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-[#5E6AD2] flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-white">FitCore</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-1">
            Bem-vindo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Selecione seu perfil para continuar
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="user-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Perfil
              </label>
              <div className="relative">
                <select
                  id="user-select"
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#1A1A1E] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2.5 pr-9 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
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
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Entrar
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
            Sistema de demonstração &mdash; todos os dados são armazenados localmente no seu navegador.
          </p>
        </div>
      </main>
    </div>
  )
}
