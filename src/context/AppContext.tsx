import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AppData, Usuario, Aula, Aviso, Mensagem, Configuracoes, AttendanceStatus } from '../types'
import { loadData, saveData, getCurrentUserId, setCurrentUser, clearCurrentUser } from '../data/storage'

interface AppContextType {
  data: AppData
  currentUser: Usuario | null
  isDark: boolean
  isOffline: boolean
  activeView: 'aluno' | 'admin'
  login: (userId: string) => void
  logout: () => void
  toggleDark: () => void
  setActiveView: (view: 'aluno' | 'admin') => void
  bookClass: (aulaId: string) => 'booked' | 'waitlisted' | 'full' | 'already_booked'
  cancelClass: (aulaId: string) => boolean
  joinWaitlist: (aulaId: string) => void
  updateConfiguracoes: (cfg: Configuracoes) => void
  addAviso: (titulo: string, corpo: string) => void
  deleteAviso: (id: string) => void
  sendMensagem: (para: string, texto: string) => void
  markAttendance: (aulaId: string, userId: string, present: boolean, date?: string) => void
  getAttendance: (aulaId: string, date?: string) => Record<string, AttendanceStatus>
  addUsuario: (u: Omit<Usuario, 'id'>) => void
  updateAula: (aula: Aula) => void
}

const AppContext = createContext<AppContextType | null>(null)

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const loaded = loadData()
    // Migration: ensure attendance field exists on older persisted data
    if (!loaded.attendance) loaded.attendance = {}
    return loaded
  })
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [activeView, setActiveViewState] = useState<'aluno' | 'admin'>('aluno')
  const [currentUserId, setCurrentUserId] = useState<string | null>(getCurrentUserId)

  const currentUser = currentUserId ? data.usuarios.find(u => u.id === currentUserId) || null : null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateData = useCallback((updater: (d: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [])

  const login = useCallback((userId: string) => {
    setCurrentUser(userId)
    setCurrentUserId(userId)
    const user = data.usuarios.find(u => u.id === userId)
    if (user?.role === 'admin') setActiveViewState('admin')
    else setActiveViewState('aluno')
  }, [data.usuarios])

  const logout = useCallback(() => {
    clearCurrentUser()
    setCurrentUserId(null)
  }, [])

  const toggleDark = useCallback(() => setIsDark(d => !d), [])

  const setActiveView = useCallback((view: 'aluno' | 'admin') => setActiveViewState(view), [])

  const bookClass = useCallback((aulaId: string): 'booked' | 'waitlisted' | 'full' | 'already_booked' => {
    if (!currentUserId) return 'full'
    let result: 'booked' | 'waitlisted' | 'full' | 'already_booked' = 'full'
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        if (a.inscritos.includes(currentUserId)) { result = 'already_booked'; return a }
        if (a.filaEspera.includes(currentUserId)) { result = 'waitlisted'; return a }
        if (a.vagasOcupadas < a.vagasTotais) {
          result = 'booked'
          return { ...a, vagasOcupadas: a.vagasOcupadas + 1, inscritos: [...a.inscritos, currentUserId] }
        }
        result = 'full'
        return a
      })
      return { ...d, aulas }
    })
    return result
  }, [currentUserId, updateData])

  const cancelClass = useCallback((aulaId: string): boolean => {
    if (!currentUserId) return false
    let ok = false
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        if (!a.inscritos.includes(currentUserId)) return a
        ok = true
        const inscritos = a.inscritos.filter(id => id !== currentUserId)
        let vagasOcupadas = a.vagasOcupadas - 1
        const filaEspera = [...a.filaEspera]
        if (d.configuracoes.modoFilaEspera === 'AUTOMATICO' && filaEspera.length > 0) {
          const proximo = filaEspera.shift()!
          inscritos.push(proximo)
          vagasOcupadas++
        }
        return { ...a, inscritos, vagasOcupadas, filaEspera }
      })
      return { ...d, aulas }
    })
    return ok
  }, [currentUserId, updateData])

  const joinWaitlist = useCallback((aulaId: string) => {
    if (!currentUserId) return
    updateData(d => {
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        if (a.filaEspera.includes(currentUserId) || a.inscritos.includes(currentUserId)) return a
        return { ...a, filaEspera: [...a.filaEspera, currentUserId] }
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
    const dayKey = date ?? todayKey()
    const key = `${aulaId}_${dayKey}`
    updateData(d => {
      const attendance = { ...(d.attendance ?? {}) }
      const forKey = { ...(attendance[key] ?? {}) }
      forKey[userId] = present ? 'present' : 'absent'
      attendance[key] = forKey
      return { ...d, attendance }
    })
  }, [updateData])

  const getAttendance = useCallback((aulaId: string, date?: string): Record<string, AttendanceStatus> => {
    const dayKey = date ?? todayKey()
    const key = `${aulaId}_${dayKey}`
    return data.attendance?.[key] ?? {}
  }, [data.attendance])

  const addUsuario = useCallback((u: Omit<Usuario, 'id'>) => {
    const newUser: Usuario = { ...u, id: `u${Date.now()}${Math.random().toString(36).slice(2, 6)}` }
    updateData(d => ({ ...d, usuarios: [...d.usuarios, newUser] }))
  }, [updateData])

  const updateAula = useCallback((aula: Aula) => {
    updateData(d => ({ ...d, aulas: d.aulas.map(a => a.id === aula.id ? aula : a) }))
  }, [updateData])

  return (
    <AppContext.Provider value={{
      data, currentUser, isDark, isOffline, activeView,
      login, logout, toggleDark, setActiveView,
      bookClass, cancelClass, joinWaitlist,
      updateConfiguracoes, addAviso, deleteAviso, sendMensagem,
      markAttendance, getAttendance, addUsuario, updateAula
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
