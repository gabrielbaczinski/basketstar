import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Settings, HelpCircle, LogOut, Moon, Sun, RotateCcw, AlertTriangle, Palette } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTour } from '../context/TourContext'
import { pageTours } from '../tours/definitions'
import Avatar from './ui/Avatar'
import Modal from './ui/Modal'

const BRAND_COLORS = [
  { label: 'Laranja', value: '#E55A2B' },
  { label: 'Azul',   value: '#007AFF' },
  { label: 'Roxo',   value: '#5E6AD2' },
  { label: 'Verde',  value: '#0CA679' },
  { label: 'Rosa',   value: '#FF2D55' },
  { label: 'Cinza',  value: '#6C6C70' },
]

export default function UserMenu() {
  const { currentUser, logout, isDark, toggleDark, activeView, resetDemo, brandColor, setBrandColor } = useApp()
  const { showToast } = useToast()
  const { startTour } = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentTour = pageTours[activeView]?.[location.pathname] ?? []
  const hasTour = currentTour.length > 0

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
  const isAluno = activeView === 'aluno'

  const handleHelp = () => {
    setOpen(false)
    if (hasTour) {
      setTimeout(() => startTour(currentTour), 200)
    } else {
      showToast('Nenhum tour disponível para esta página.', 'info')
    }
  }

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
          className="absolute right-0 top-full mt-2 w-[280px] origin-top-right animate-scale-in z-50"
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

            {/* Action items */}
            <div className="py-1">
              {isAluno && (
                <MenuItem icon={<CreditCard size={15} />} label="Carteirinha" onClick={() => go('/carteirinha')} onClose={() => setOpen(false)} />
              )}
              {!isAluno && (
                <MenuItem icon={<Settings size={15} />} label="Configurações" onClick={() => go('/configuracoes')} onClose={() => setOpen(false)} />
              )}
              <MenuItem
                icon={isDark ? <Sun size={15} /> : <Moon size={15} />}
                label={isDark ? 'Tema claro' : 'Tema escuro'}
                onClick={toggleDark}
                keepOpen
                onClose={() => setOpen(false)}
              />
              <MenuItem
                icon={<HelpCircle size={15} />}
                label={hasTour ? 'Tour guiado desta página' : 'Ajuda'}
                onClick={handleHelp}
                onClose={() => setOpen(false)}
              />
              {import.meta.env.DEV && (
                <MenuItem
                  icon={<RotateCcw size={15} />}
                  label="Resetar dados demo"
                  onClick={() => { setOpen(false); setResetConfirm(true) }}
                  onClose={() => setOpen(false)}
                />
              )}
            </div>

            {/* Color picker */}
            <div className="px-4 py-3 hairline-t hairline-b">
              <p className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Palette size={11} /> Cor do sistema
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {BRAND_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setBrandColor(c.value)}
                    title={c.label}
                    className="w-7 h-7 rounded-full transition-all active:scale-90 shrink-0"
                    style={{
                      background: c.value,
                      boxShadow: brandColor === c.value
                        ? `0 0 0 2px white, 0 0 0 3.5px ${c.value}`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="py-1">
              <MenuItem
                icon={<LogOut size={15} />}
                label="Sair"
                onClick={doLogout}
                onClose={() => setOpen(false)}
                danger
              />
            </div>
          </div>
        </div>
      )}

      {resetConfirm && (
        <Modal
          open
          onClose={() => setResetConfirm(false)}
          title="Resetar dados demo"
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={() => setResetConfirm(false)} className="ios-btn-gray">Cancelar</button>
              <button
                onClick={() => { resetDemo(); showToast('Dados demo restaurados.', 'success'); setResetConfirm(false) }}
                className="bg-sys-red text-white text-footnote font-semibold px-4 py-2 rounded-full transition-colors hover:brightness-110 active:scale-[0.97]"
              >
                Resetar
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sys-orange/14 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-sys-orange" />
            </div>
            <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">
              Todos os dados serão restaurados para o estado inicial. Você será desconectado. Esta ação não pode ser desfeita.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

function MenuItem({
  icon, label, onClick, danger, keepOpen, onClose,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  keepOpen?: boolean
  onClose?: () => void
}) {
  return (
    <button
      onClick={() => { onClick(); if (!keepOpen) onClose?.() }}
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
