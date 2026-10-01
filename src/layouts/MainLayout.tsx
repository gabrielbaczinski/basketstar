import type React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Dumbbell, LayoutDashboard, Calendar, CreditCard, Megaphone, MessageCircle,
  CalendarDays, Users, Inbox, BarChart3, Settings2,
  Sun, Moon, LogOut, WifiOff
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TourProvider } from '../context/TourContext'
import ProfileSwitcher from '../components/ProfileSwitcher'
import AIChat from '../components/AIChat'
import HelpButton from '../components/HelpButton'
import TourOverlay from '../components/TourOverlay'
import Avatar from '../components/ui/Avatar'

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
interface NavItem { to: string; label: string; icon: IconComponent }

const studentNav: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: Calendar },
  { to: '/carteirinha', label: 'Carteirinha', icon: CreditCard },
  { to: '/comunidade', label: 'Feed', icon: Megaphone },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
]

const adminNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: CalendarDays },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/comunidade', label: 'Comunidade', icon: Megaphone },
  { to: '/mensagens', label: 'Mensagens', icon: Inbox },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/configuracoes', label: 'Config.', icon: Settings2 },
]

const adminTabs: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: CalendarDays },
  { to: '/usuarios', label: 'Alunos', icon: Users },
  { to: '/mensagens', label: 'Mensagens', icon: Inbox },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function pageTitle(pathname: string, isAdmin: boolean): string {
  const map: Record<string, string> = isAdmin
    ? { '/': 'Dashboard', '/aulas': 'Aulas', '/usuarios': 'Alunos', '/comunidade': 'Comunidade', '/mensagens': 'Mensagens', '/relatorios': 'Relatórios', '/configuracoes': 'Configurações' }
    : { '/': 'Início', '/aulas': 'Aulas', '/carteirinha': 'Carteirinha', '/comunidade': 'Feed', '/chat': 'Chat' }
  return map[pathname] ?? 'FitCore'
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isDark, toggleDark, logout, activeView, isOffline } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminView = activeView === 'admin'
  const nav = isAdminView ? adminNav : studentNav
  const tabs = isAdminView ? adminTabs : studentNav
  const title = pageTitle(location.pathname, isAdminView)

  const doLogout = () => { logout(); navigate('/') }

  return (
    <TourProvider>
    <div className="h-screen overflow-hidden bg-[#F2F2F7] dark:bg-[#090909] text-gray-900 dark:text-gray-100 flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:flex-col w-[220px] shrink-0 h-full bg-gradient-to-b from-white to-[#F8F8FA] dark:from-[#111111] dark:to-[#0C0C0E] shadow-[1px_0_0_0_#E5E7EB] dark:shadow-[1px_0_0_0_#1f2937]">
        <div className="h-14 px-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#5E6AD2] flex items-center justify-center">
            <Dumbbell size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">FitCore</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-0.5">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1E] hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {currentUser && (
          <div className="p-3">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
              <Avatar name={currentUser.nome} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{currentUser.nome}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
              </div>
              <button onClick={doLogout} className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors" aria-label="Sair" title="Sair">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Desktop top bar */}
        <header className="shrink-0 h-14 bg-gradient-to-r from-white to-[#FAFAFA] dark:from-[#111111] dark:to-[#0E0E10] shadow-[0_1px_0_0_#E5E7EB] dark:shadow-[0_1px_0_0_#1f2937] hidden md:flex items-center px-6 z-30">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">{title}</h1>
          <div className="flex items-center gap-2">
            {isOffline && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400 rounded-md text-[11px] font-medium">
                <WifiOff size={11} /> Offline
              </span>
            )}
            <ProfileSwitcher />
            <button onClick={toggleDark} className="w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors" aria-label="Alternar tema">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile top bar — native style: centered title */}
        <header className="md:hidden shrink-0 h-[52px] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md flex items-center px-4 z-30 relative">
          {/* Left slot: logo on home, empty otherwise */}
          <div className="w-10">
            {location.pathname === '/' && (
              <div className="w-7 h-7 rounded-md bg-[#5E6AD2] flex items-center justify-center">
                <Dumbbell size={14} className="text-white" />
              </div>
            )}
          </div>

          {/* Center: page title */}
          <h1 className="flex-1 text-center text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
            {location.pathname === '/' ? 'FitCore' : title}
          </h1>

          {/* Right: actions */}
          <div className="w-10 flex items-center justify-end gap-1">
            {isOffline && <WifiOff size={14} className="text-amber-500" />}
            <button onClick={toggleDark} className="w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 flex items-center justify-center" aria-label="Alternar tema">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto md:px-6 md:py-6 pb-[72px] md:pb-6">
          <div className="md:max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md shadow-[0_-0.5px_0_0_rgba(0,0,0,0.12)] dark:shadow-[0_-0.5px_0_0_rgba(255,255,255,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-[56px]">
          {tabs.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors relative ${
                  isActive ? 'text-[#5E6AD2]' : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill indicator */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-[#5E6AD2]" />
                  )}
                  <span className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                    <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span className={`text-[10px] font-medium leading-none tracking-tight ${isActive ? 'text-[#5E6AD2]' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop floating buttons */}
      <div className="hidden md:block">
        <HelpButton />
        <AIChat />
      </div>

      {/* Mobile: profile switcher for admin in a fixed top-right chip */}
      <div className="md:hidden fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <ProfileSwitcher mobile />
        </div>
      </div>

      <TourOverlay />
    </div>
    </TourProvider>
  )
}
