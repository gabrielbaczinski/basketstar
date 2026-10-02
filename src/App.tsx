import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentClasses from './pages/student/StudentClasses'
import StudentDigitalCard from './pages/student/StudentDigitalCard'
import StudentCommunity from './pages/student/StudentCommunity'
import StudentChat from './pages/student/StudentChat'
import StudentProfile from './pages/student/StudentProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminClasses from './pages/admin/AdminClasses'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCommunity from './pages/admin/AdminCommunity'
import AdminMessages from './pages/admin/AdminMessages'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
      <p className="text-[56px] font-bold text-ios-label-3 dark:text-ios-dlabel-3 leading-none tabular-nums">404</p>
      <p className="text-title3 text-ios-label dark:text-ios-dlabel">Página não encontrada</p>
      <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 max-w-xs">
        Este endereço não existe ou não está disponível no seu perfil.
      </p>
      <button onClick={() => navigate('/', { replace: true })} className="ios-btn-primary mt-2">
        Voltar ao início
      </button>
    </div>
  )
}

function AppRoutes() {
  const { currentUser, activeView } = useApp()
  if (!currentUser) return <LoginPage />
  return (
    <MainLayout>
      <Routes>
        {activeView === 'aluno' ? (
          <>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/aulas" element={<StudentClasses />} />
            <Route path="/carteirinha" element={<StudentDigitalCard />} />
            <Route path="/perfil" element={<StudentProfile />} />
            <Route path="/comunidade" element={<StudentCommunity />} />
            <Route path="/chat" element={<StudentChat />} />
            <Route path="*" element={<NotFoundPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/aulas" element={<AdminClasses />} />
            <Route path="/usuarios" element={<AdminUsers />} />
            <Route path="/comunidade" element={<AdminCommunity />} />
            <Route path="/mensagens" element={<AdminMessages />} />
            <Route path="/relatorios" element={<AdminReports />} />
            <Route path="/configuracoes" element={<AdminSettings />} />
            <Route path="*" element={<NotFoundPage />} />
          </>
        )}
      </Routes>
    </MainLayout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}
