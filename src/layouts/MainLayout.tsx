import type React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Dumbbell, LayoutDashboard, Calendar, Megaphone, MessageCircle,
  CalendarDays, Users, Inbox, BarChart3, Settings2, Sun, Moon, WifiOff, User as UserIcon,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TourProvider } from '../context/TourContext'
import ProfileSwitcher from '../components/ProfileSwitcher'
import UserMenu from '../components/UserMenu'
import AIChat from '../components/AIChat'
import HelpButton from '../components/HelpButton'
import TourOverlay from '../components/TourOverlay'

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
interface NavItem { to: string; label: string; icon: IconComponent }

// Desktop nav (carteirinha moved to UserMenu)
const studentNavDesktop: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: Calendar },
  { to: '/comunidade', label: 'Feed', icon: Megaphone },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
]

// Mobile bottom tabs — carteirinha vive dentro do perfil
const studentTabsMobile: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/aulas', label: 'Aulas', icon: Calendar },
  { to: '/comunidade', label: 'Feed', icon: Megaphone },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
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
    : { '/': 'Início', '/aulas': 'Aulas', '/carteirinha': 'Carteirinha', '/comunidade': 'Feed', '/chat': 'Chat', '/perfil': 'Perfil' }
  return map[pathname] ?? 'FitCore'
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleDark, activeView, isOffline } = useApp()
  const location = useLocation()
  const isAdminView = activeView === 'admin'
  const nav = isAdminView ? adminNav : studentNavDesktop
  const tabs = isAdminView ? adminTabs : studentTabsMobile
  const title = pageTitle(location.pathname, isAdminView)

  return (
    <TourProvider>
      <div className="h-screen overflow-hidden bg-ios-bg dark:bg-ios-dbg text-ios-label dark:text-ios-dlabel flex flex-col relative">
        {/* Ambient aurora background (behind everything) */}
        <div className="aurora-bg" aria-hidden="true" />

        {/* ─────────── Desktop top header bar ─────────── */}
        <header className="relative hidden md:flex shrink-0 h-[58px] ios-glass hairline-b items-center px-5 lg:px-7 z-30 gap-5">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 rounded-ios flex items-center justify-center text-white transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                boxShadow: '0 4px 12px rgba(94,106,210,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              }}
            >
              <Dumbbell size={16} strokeWidth={2.2} />
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="font-semibold text-callout tracking-tight">FitCore</span>
              <span className="text-caption2 font-semibold text-ios-label-3 dark:text-ios-dlabel-3 uppercase tracking-wider">
                {isAdminView ? 'Studio' : 'Member'}
              </span>
            </div>
          </NavLink>

          {/* Divider */}
          <span className="hidden lg:block w-px h-6 bg-ios-separator dark:bg-ios-dseparator" />

          {/* Horizontal pill navigation */}
          <nav className="flex-1 min-w-0 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {nav.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {({ isActive }) => (
                  <span
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-subhead font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-tint-500/12 dark:bg-tint-500/22 text-tint-700 dark:text-tint-200'
                        : 'text-ios-label-2 dark:text-ios-dlabel-2 hover:bg-ios-fill-3 dark:hover:bg-white/5 hover:text-ios-label dark:hover:text-ios-dlabel'
                    }`}
                  >
                    <item.icon size={15} strokeWidth={isActive ? 2.4 : 1.9} />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden lg:inline hidden">{item.label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {isOffline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sys-orange/14 text-sys-orange rounded-full text-caption2 font-semibold">
                <WifiOff size={10} /> Offline
              </span>
            )}
            <ProfileSwitcher />
            <div className="pl-1 ml-1 border-l border-ios-separator dark:border-ios-dseparator">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* ─────────── Mobile top bar — native iOS style ─────────── */}
        <header className="relative md:hidden shrink-0 h-[52px] ios-glass-heavy flex items-center px-4 z-30 hairline-b">
          <div className="w-10">
            {location.pathname === '/' && (
              <div
                className="w-7 h-7 rounded-ios-sm flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
                  boxShadow: '0 2px 6px rgba(94,106,210,0.3)',
                }}
              >
                <Dumbbell size={13} strokeWidth={2.2} />
              </div>
            )}
          </div>

          <h1 className="flex-1 text-center text-headline text-ios-label dark:text-ios-dlabel tracking-tight">
            {location.pathname === '/' ? 'FitCore' : title}
          </h1>

          <div className="w-10 flex items-center justify-end gap-1">
            {isOffline && <WifiOff size={14} className="text-sys-orange" />}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-full text-ios-label-2 dark:text-ios-dlabel-2 flex items-center justify-center active:bg-ios-fill-2"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* ─────────── Main content area ─────────── */}
        <main className="relative flex-1 overflow-y-auto pb-[88px] md:pb-6">
          <div className="animate-fade-up">
            {children}
          </div>
        </main>

        {/* ─────────── Mobile bottom tab bar ─────────── */}
        <nav
          className="fixed bottom-0 left-0 right-0 md:hidden z-40 ios-glass-heavy hairline-t"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex h-[60px]">
            {tabs.slice(0, 5).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-[3px] transition-all relative ${
                    isActive ? 'text-tint-500' : 'text-ios-label-3 dark:text-ios-dlabel-3'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}>
                      <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.4 : 1.8} />
                    </span>
                    <span className={`text-caption2 font-semibold leading-none tracking-tight ${isActive ? 'text-tint-500' : 'text-ios-label-3 dark:text-ios-dlabel-3'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <HelpButton />

        <div className="hidden md:block">
          <AIChat />
        </div>

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
