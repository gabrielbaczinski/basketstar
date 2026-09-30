import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Dumbbell, LayoutDashboard, Calendar, CreditCard, Megaphone, MessageCircle,
  CalendarDays, Users, Inbox, BarChart3, Settings2,
  Sun, Moon, LogOut, WifiOff
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProfileSwitcher from '../components/ProfileSwitcher'
import AIChat from '../components/AIChat'
import HelpButton from '../components/HelpButton'
import Avatar from '../components/ui/Avatar'

interface NavItem { to: string; label: string; icon: React.ReactNode }

const studentNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/aulas', label: 'Aulas', icon: <Calendar size={16} /> },
  { to: '/carteirinha', label: 'Carteirinha', icon: <CreditCard size={16} /> },
  { to: '/comunidade', label: 'Comunidade', icon: <Megaphone size={16} /> },
  { to: '/chat', label: 'Chat', icon: <MessageCircle size={16} /> },
]

const adminNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/aulas', label: 'Aulas', icon: <CalendarDays size={16} /> },
  { to: '/usuarios', label: 'Usuários', icon: <Users size={16} /> },
  { to: '/comunidade', label: 'Comunidade', icon: <Megaphone size={16} /> },
  { to: '/mensagens', label: 'Mensagens', icon: <Inbox size={16} /> },
  { to: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={16} /> },
  { to: '/configuracoes', label: 'Configurações', icon: <Settings2 size={16} /> },
]

// Mobile bottom-tab items (max 5)
const studentTabs: NavItem[] = studentNav
const adminTabs: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/aulas', label: 'Aulas', icon: <CalendarDays size={18} /> },
  { to: '/usuarios', label: 'Usuários', icon: <Users size={18} /> },
  { to: '/mensagens', label: 'Mensagens', icon: <Inbox size={18} /> },
  { to: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={18} /> },
]

function pageTitle(pathname: string, isAdmin: boolean): string {
  const map: Record<string, string> = isAdmin
    ? {
        '/': 'Dashboard',
        '/aulas': 'Aulas',
        '/usuarios': 'Usuários',
        '/comunidade': 'Comunidade',
        '/mensagens': 'Mensagens',
        '/relatorios': 'Relatórios',
        '/configuracoes': 'Configurações',
      }
    : {
        '/': 'Dashboard',
        '/aulas': 'Aulas',
        '/carteirinha': 'Carteirinha',
        '/comunidade': 'Comunidade',
        '/chat': 'Chat',
      }
  return map[pathname] ?? 'FitCore'
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isDark, toggleDark, logout, activeView, isOffline } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminView = activeView === 'admin'
  const nav = isAdminView ? adminNav : studentNav
  const tabs = isAdminView ? adminTabs : studentTabs
  const title = pageTitle(location.pathname, isAdminView)

  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0D0D0D] text-gray-900 dark:text-gray-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-[220px] shrink-0 h-full bg-white dark:bg-[#111111] shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1f2937]">
        {/* Logo */}
        <div className="h-14 px-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#5E6AD2] flex items-center justify-center">
            <Dumbbell size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">FitCore</span>
        </div>

        {/* Nav */}
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
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1E]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {currentUser && (
          <div className="p-3">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
              <Avatar name={currentUser.nome} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{currentUser.nome}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={doLogout}
                className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 bg-white dark:bg-[#111111] shadow-[0_1px_0_0_#f1f5f9] dark:shadow-[0_1px_0_0_#1f2937] flex items-center px-4 sm:px-6 z-30">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mr-3">
            <div className="w-6 h-6 rounded-md bg-[#5E6AD2] flex items-center justify-center">
              <Dumbbell size={14} className="text-white" />
            </div>
          </div>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">{title}</h1>

          <div className="flex items-center gap-2">
            {isOffline && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md text-[11px] font-medium">
                <WifiOff size={11} /> Offline
              </span>
            )}
            <ProfileSwitcher />
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={doLogout}
              className="md:hidden w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
              aria-label="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) - icon only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-30 bg-white dark:bg-[#111111] shadow-[0_-1px_0_0_#f1f5f9] dark:shadow-[0_-1px_0_0_#1f2937]">
        <div className="flex">
          {tabs.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center py-3 transition-colors ${
                  isActive ? 'text-[#5E6AD2]' : 'text-gray-400 dark:text-gray-500'
                }`
              }
              aria-label={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
      </nav>

      <HelpButton />
      <AIChat />
    </div>
  )
}
