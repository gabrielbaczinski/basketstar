import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, KeyRound, Settings, Bell, HelpCircle, LogOut, Moon, Sun, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Avatar from './ui/Avatar'

export default function UserMenu() {
  const { currentUser, logout, isDark, toggleDark, activeView, resetDemo } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  if (!currentUser) return null

  const go = (path: string) => { setOpen(false); navigate(path) }
  const doLogout = () => { setOpen(false); logout(); navigate('/') }

  // Items vary by role — carteirinha only for aluno view
  const isAluno = activeView === 'aluno'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-ios-fill-3 dark:hover:bg-white/5 transition-colors"
        aria-label="Menu do usuário"
        aria-expanded={open}
      >
        <Avatar name={currentUser.nome} size="sm" />
        <span className="hidden lg:inline text-footnote font-semibold text-ios-label dark:text-ios-dlabel max-w-[140px] truncate">
          {currentUser.nome.split(' ')[0]}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[260px] origin-top-right animate-scale-in z-50"
          role="menu"
        >
          <div className="ios-glass-heavy rounded-ios-md shadow-ios-4 overflow-hidden">
            {/* Profile header */}
            <div className="px-4 py-3 flex items-center gap-3 hairline-b">
              <Avatar name={currentUser.nome} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel truncate">
                  {currentUser.nome}
                </p>
                <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="py-1">
              {isAluno && (
                <MenuItem icon={<CreditCard size={15} />} label="Carteirinha" onClick={() => go('/carteirinha')} />
              )}
              <MenuItem
                icon={isDark ? <Sun size={15} /> : <Moon size={15} />}
                label={isDark ? 'Tema claro' : 'Tema escuro'}
                onClick={() => { toggleDark() }}
                keepOpen
              />
              <MenuItem
                icon={<Bell size={15} />}
                label="Notificações"
                onClick={() => { showToast('Em breve.', 'info'); setOpen(false) }}
              />
              <MenuItem
                icon={<KeyRound size={15} />}
                label="Trocar senha"
                onClick={() => { showToast('Em breve.', 'info'); setOpen(false) }}
              />
              <MenuItem
                icon={<Settings size={15} />}
                label="Preferências"
                onClick={() => { showToast('Em breve.', 'info'); setOpen(false) }}
              />
              <MenuItem
                icon={<HelpCircle size={15} />}
                label="Ajuda"
                onClick={() => { showToast('Use o botão de ajuda flutuante.', 'info'); setOpen(false) }}
              />
              <MenuItem
                icon={<RotateCcw size={15} />}
                label="Resetar dados demo"
                onClick={() => {
                  resetDemo()
                  showToast('Dados demo restaurados.', 'success')
                  setOpen(false)
                }}
              />
            </div>

            {/* Logout */}
            <div className="py-1 hairline-t">
              <MenuItem
                icon={<LogOut size={15} />}
                label="Sair"
                onClick={doLogout}
                danger
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon, label, onClick, danger, keepOpen,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  keepOpen?: boolean
}) {
  void keepOpen
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-footnote text-left transition-colors ${
        danger
          ? 'text-sys-red hover:bg-sys-red/10'
          : 'text-ios-label dark:text-ios-dlabel hover:bg-ios-fill-3 dark:hover:bg-white/5'
      }`}
      role="menuitem"
    >
      <span className={danger ? 'text-sys-red' : 'text-ios-label-2 dark:text-ios-dlabel-2'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}
