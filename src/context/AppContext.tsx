import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AppData, Usuario, Aula, Aviso, Mensagem, Configuracoes, AttendanceStatus } from '../types'
import { loadData, saveData, getCurrentUserId, setCurrentUser, clearCurrentUser, resetAppData } from '../data/storage'
import { getBookingDia } from '../utils/aulaUtils'

type BookResult = 'booked' | 'waitlisted' | 'full' | 'already_booked' | 'inactive'
type LoginResult = 'ok' | 'inactive' | 'not_found'

interface AppContextType {
  data: AppData
  currentUser: Usuario | null
  isDark: boolean
  isOffline: boolean
  activeView: 'aluno' | 'admin'
  login: (userId: string) => LoginResult
  logout: () => void
  toggleDark: () => void
  setActiveView: (view: 'aluno' | 'admin') => void
  // Per-day booking (new)
  bookClassDia: (aulaId: string, dia: string) => BookResult
  cancelClassDia: (aulaId: string, dia: string) => boolean
  joinWaitlistDia: (aulaId: string, dia: string) => void
  updateConfiguracoes: (cfg: Configuracoes) => void
  addAviso: (titulo: string, corpo: string) => void
  deleteAviso: (id: string) => void
  sendMensagem: (para: string, texto: string) => void
  markAttendance: (aulaId: string, userId: string, present: boolean, date?: string) => void
  getAttendance: (aulaId: string, date?: string) => Record<string, AttendanceStatus>
  addUsuario: (u: Omit<Usuario, 'id'>) => void
  updateUsuarioStatus: (userId: string, status: 'Ativo' | 'Inativo') => void
  updateAula: (aula: Aula) => void
  addAula: (aula: Omit<Aula, 'id'>) => void
  deleteAula: (aulaId: string) => void
  resetDemo: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [activeView, setActiveViewState] = useState<'aluno' | 'admin'>('aluno')
  const [currentUserId, setCurrentUserId] = useState<string | null>(getCurrentUserId)

  const currentUser = currentUserId ? data.usuarios.find(u => u.id === currentUserId) ?? null : null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  useEffect(() => {
    const up = () => setIsOffline(false)
    const down = () => setIsOffline(true)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  const updateData = useCallback((updater: (d: AppData) => AppData) => {
    setData(prev => { const next = updater(prev); saveData(next); return next })
  }, [])

  const login = useCallback((userId: string): LoginResult => {
    const user = data.usuarios.find(u => u.id === userId)
    if (!user) return 'not_found'
    // Alunos com plano inativo não entram; admins sempre podem acessar.
    if (user.role !== 'admin' && user.statusPlano === 'Inativo') return 'inactive'
    setCurrentUser(userId)
    setCurrentUserId(userId)
    setActiveViewState(user.role === 'admin' ? 'admin' : 'aluno')
    return 'ok'
  }, [data.usuarios])

  const logout = useCallback(() => { clearCurrentUser(); setCurrentUserId(null) }, [])
  const toggleDark = useCallback(() => setIsDark(d => !d), [])
  const setActiveView = useCallback((view: 'aluno' | 'admin') => setActiveViewState(view), [])

  const bookClassDia = useCallback((aulaId: string, dia: string): BookResult => {
    if (!currentUserId) return 'already_booked'
    const me = data.usuarios.find(u => u.id === currentUserId)
    if (me && me.role !== 'admin' && me.statusPlano === 'Inativo') return 'inactive'
    let result: BookResult | null = null
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        if (!a.diasSemana.includes(dia)) return a
        const booking = getBookingDia(a, dia)
        if (booking.inscritos.includes(currentUserId)) { result = 'already_booked'; return a }
        if (booking.filaEspera.includes(currentUserId)) { result = 'waitlisted'; return a }
        const cap = Math.max(0, Math.floor(Number(a.vagasTotais) || 0))
        if (booking.inscritos.length < cap) {
          result = 'booked'
          return {
            ...a,
            bookingsPorDia: {
              ...a.bookingsPorDia,
              [dia]: { ...booking, inscritos: [...booking.inscritos, currentUserId] },
            },
          }
        }
        result = 'full'
        return a
      })
      return { ...d, aulas }
    })
    // If result is still null, aula/dia couldn't be matched — treat as a transient error, not "full".
    return result ?? 'already_booked'
  }, [currentUserId, updateData, data.usuarios])

  const cancelClassDia = useCallback((aulaId: string, dia: string): boolean => {
    if (!currentUserId) return false
    let ok = false
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        const booking = getBookingDia(a, dia)
        if (!booking.inscritos.includes(currentUserId)) return a
        ok = true
        let inscritos = booking.inscritos.filter(id => id !== currentUserId)
        const filaEspera = [...booking.filaEspera]
        if (d.configuracoes.modoFilaEspera === 'AUTOMATICO' && filaEspera.length > 0) {
          inscritos = [...inscritos, filaEspera.shift()!]
        }
        return {
          ...a,
          bookingsPorDia: { ...a.bookingsPorDia, [dia]: { inscritos, filaEspera } },
        }
      })
      return { ...d, aulas }
    })
    return ok
  }, [currentUserId, updateData])

  const joinWaitlistDia = useCallback((aulaId: string, dia: string) => {
    if (!currentUserId) return
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        const booking = getBookingDia(a, dia)
        if (booking.filaEspera.includes(currentUserId) || booking.inscritos.includes(currentUserId)) return a
        return {
          ...a,
          bookingsPorDia: {
            ...a.bookingsPorDia,
            [dia]: { ...booking, filaEspera: [...booking.filaEspera, currentUserId] },
          },
        }
      })
      return { ...d, aulas }
    })
  }, [currentUserId, updateData])

  const updateConfiguracoes = useCallback((cfg: Configuracoes) => {
    updateData(d => ({ ...d, configuracoes: cfg }))
  }, [updateData])

  const addAviso = useCallback((titulo: string, corpo: string) => {
    if (!currentUserId) return
    const aviso: Aviso = { id: `av${Date.now()}`, titulo, corpo, timestamp: new Date().toISOString(), autorId: currentUserId }
    updateData(d => ({ ...d, comunidadeAvisos: [aviso, ...d.comunidadeAvisos] }))
  }, [currentUserId, updateData])

  const deleteAviso = useCallback((id: string) => {
    updateData(d => ({ ...d, comunidadeAvisos: d.comunidadeAvisos.filter(a => a.id !== id) }))
  }, [updateData])

  const sendMensagem = useCallback((para: string, texto: string) => {
    if (!currentUserId) return
    const msg: Mensagem = { id: `m${Date.now()}`, de: currentUserId, para, texto, timestamp: new Date().toISOString(), lida: false }
    updateData(d => ({ ...d, mensagens: [...d.mensagens, msg] }))
  }, [currentUserId, updateData])

  const markAttendance = useCallback((aulaId: string, userId: string, present: boolean, date?: string) => {
    const key = `${aulaId}_${date ?? todayKey()}`
    updateData(d => {
      const attendance = { ...(d.attendance ?? {}) }
      attendance[key] = { ...(attendance[key] ?? {}), [userId]: present ? 'present' : 'absent' }
      return { ...d, attendance }
    })
  }, [updateData])

  const getAttendance = useCallback((aulaId: string, date?: string): Record<string, AttendanceStatus> => {
    return data.attendance?.[`${aulaId}_${date ?? todayKey()}`] ?? {}
  }, [data.attendance])

  const addUsuario = useCallback((u: Omit<Usuario, 'id'>) => {
    const newUser: Usuario = { ...u, id: `u${Date.now()}${Math.random().toString(36).slice(2, 6)}` }
    updateData(d => ({ ...d, usuarios: [...d.usuarios, newUser] }))
  }, [updateData])

  const updateUsuarioStatus = useCallback((userId: string, status: 'Ativo' | 'Inativo') => {
    updateData(d => ({ ...d, usuarios: d.usuarios.map(u => u.id === userId ? { ...u, statusPlano: status } : u) }))
  }, [updateData])

  const updateAula = useCallback((aula: Aula) => {
    updateData(d => ({ ...d, aulas: d.aulas.map(a => a.id === aula.id ? aula : a) }))
  }, [updateData])

  const addAula = useCallback((aulaData: Omit<Aula, 'id'>) => {
    const newAula: Aula = { ...aulaData, id: `a${Date.now()}${Math.random().toString(36).slice(2, 5)}` }
    updateData(d => ({ ...d, aulas: [...d.aulas, newAula] }))
  }, [updateData])

  const deleteAula = useCallback((aulaId: string) => {
    updateData(d => ({ ...d, aulas: d.aulas.filter(a => a.id !== aulaId) }))
  }, [updateData])

  const resetDemo = useCallback(() => {
    const fresh = resetAppData()
    setData(fresh)
  }, [])

  return (
    <AppContext.Provider value={{
      data, currentUser, isDark, isOffline, activeView,
      login, logout, toggleDark, setActiveView,
      bookClassDia, cancelClassDia, joinWaitlistDia,
      updateConfiguracoes, addAviso, deleteAviso, sendMensagem,
      markAttendance, getAttendance, addUsuario, updateUsuarioStatus, updateAula, addAula, deleteAula,
      resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
