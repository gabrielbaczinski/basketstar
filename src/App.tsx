import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
            <Route path="*" element={<Navigate to="/" replace />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
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
