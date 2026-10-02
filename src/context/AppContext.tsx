import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AppData, Usuario, Aula, Aviso, Mensagem, Configuracoes, AttendanceStatus, Professor } from '../types'
import { loadData, saveData, getCurrentUserId, setCurrentUser, clearCurrentUser, resetAppData } from '../data/storage'
import { getBookingDia } from '../utils/aulaUtils'

type BookResult = 'booked' | 'waitlisted' | 'full' | 'already_booked' | 'inactive' | 'conflict' | 'too_far'
type LoginResult = 'ok' | 'inactive' | 'not_found'
type CancelResult = 'ok' | 'too_late' | 'not_found' | 'removed_from_waitlist'

const DIA_TO_DOW: Record<string, number> = {
  'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6,
}

interface AppContextType {
  data: AppData
  currentUser: Usuario | null
  isDark: boolean
  isOffline: boolean
  activeView: 'aluno' | 'admin'
  brandColor: string
  setBrandColor: (color: string) => void
  login: (userId: string) => LoginResult
  logout: () => void
  toggleDark: () => void
  setActiveView: (view: 'aluno' | 'admin') => void
  // Per-day booking (new)
  bookClassDia: (aulaId: string, dia: string) => BookResult
  cancelClassDia: (aulaId: string, dia: string) => CancelResult
  joinWaitlistDia: (aulaId: string, dia: string) => void
  updateConfiguracoes: (cfg: Configuracoes) => void
  addAviso: (titulo: string, corpo: string) => void
  deleteAviso: (id: string) => void
  sendMensagem: (para: string, texto: string) => void
  markAttendance: (aulaId: string, userId: string, present: boolean, date?: string) => void
  getAttendance: (aulaId: string, date?: string) => Record<string, AttendanceStatus>
  addUsuario: (u: Omit<Usuario, 'id'>) => Usuario
  signupAndLogin: (u: Omit<Usuario, 'id' | 'role' | 'statusPlano'>) => Usuario
  updateUsuarioStatus: (userId: string, status: 'Ativo' | 'Inativo') => void
  updateAula: (aula: Aula) => void
  addAula: (aula: Omit<Aula, 'id'>) => void
  deleteAula: (aulaId: string) => void
  addProfessor: (nome: string) => Professor
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
  const [brandColor, setBrandColorState] = useState(() => localStorage.getItem('brandColor') ?? '#E55A2B')

  const currentUser = currentUserId ? data.usuarios.find(u => u.id === currentUserId) ?? null : null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  useEffect(() => {
    document.documentElement.style.setProperty('--brand', brandColor)
    localStorage.setItem('brandColor', brandColor)
  }, [brandColor])

  const setBrandColor = useCallback((color: string) => setBrandColorState(color), [])

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
    // Block if user already has a confirmed booking at the same time on the same day
    const targetAula = data.aulas.find(a => a.id === aulaId)
    if (targetAula) {
      const hasConflict = data.aulas.some(a => {
        if (a.id === aulaId) return false
        if (a.horario !== targetAula.horario) return false
        return a.bookingsPorDia[dia]?.inscritos.includes(currentUserId) ?? false
      })
      if (hasConflict) return 'conflict'

      const limit = data.configuracoes.diasAntecedenciaAgendamento
      if (limit > 0) {
        const todayDow = new Date().getDay()
        const classDow = DIA_TO_DOW[dia] ?? -1
        if (classDow >= 0) {
          const daysUntil = classDow >= todayDow ? classDow - todayDow : 7 - (todayDow - classDow)
          if (daysUntil > limit) return 'too_far'
        }
      }
    }
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

  const cancelClassDia = useCallback((aulaId: string, dia: string): CancelResult => {
    if (!currentUserId) return 'not_found'

    const aula = data.aulas.find(a => a.id === aulaId)
    const booking = aula ? getBookingDia(aula, dia) : null
    const isInFila = booking?.filaEspera.includes(currentUserId) ?? false

    // Deadline only applies when removing from inscritos, not from waitlist.
    if (!isInFila && aula) {
      const limite = data.configuracoes.tempoLimiteCancelamentoMinutos
      // limite === 0 means no restriction (always cancellable).
      if (limite > 0) {
        const now = new Date()
        const todayDow = now.getDay()
        const classDow = DIA_TO_DOW[dia] ?? -1
        if (todayDow === classDow) {
          const [h, m] = aula.horario.split(':').map(Number)
          const classMinutes = (h ?? 0) * 60 + (m ?? 0)
          const nowMinutes = now.getHours() * 60 + now.getMinutes()
          if (nowMinutes >= classMinutes - limite) return 'too_late'
        }
      }
    }

    let result: CancelResult = 'not_found'
    updateData(d => {
      const notifMsgs: Mensagem[] = []
      const aulas = d.aulas.map(a => {
        if (a.id !== aulaId) return a
        const b = getBookingDia(a, dia)

        // Remove from waitlist
        if (b.filaEspera.includes(currentUserId)) {
          result = 'removed_from_waitlist'
          return {
            ...a,
            bookingsPorDia: {
              ...a.bookingsPorDia,
              [dia]: { ...b, filaEspera: b.filaEspera.filter(id => id !== currentUserId) },
            },
          }
        }

        // Remove from inscritos and promote waitlist if automatic
        if (!b.inscritos.includes(currentUserId)) return a
        result = 'ok'
        let inscritos = b.inscritos.filter(id => id !== currentUserId)
        const filaEspera = [...b.filaEspera]
        if (d.configuracoes.modoFilaEspera === 'AUTOMATICO' && filaEspera.length > 0) {
          const promoted = filaEspera.shift()!
          inscritos = [...inscritos, promoted]
          notifMsgs.push({
            id: `m${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
            de: 'admin1',
            para: promoted,
            texto: `Boa notícia! Uma vaga abriu em ${a.modalidade} — ${dia} ${a.horario} e você foi confirmado(a). Até lá!`,
            timestamp: new Date().toISOString(),
            lida: false,
          })
        }
        return {
          ...a,
          bookingsPorDia: { ...a.bookingsPorDia, [dia]: { inscritos, filaEspera } },
        }
      })
      return { ...d, aulas, mensagens: [...d.mensagens, ...notifMsgs] }
    })
    return result
  }, [currentUserId, data.aulas, data.configuracoes, updateData])

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

  const addUsuario = useCallback((u: Omit<Usuario, 'id'>): Usuario => {
    const newUser: Usuario = { ...u, id: `u${Date.now()}${Math.random().toString(36).slice(2, 6)}` }
    updateData(d => ({ ...d, usuarios: [...d.usuarios, newUser] }))
    return newUser
  }, [updateData])

  const updateUsuarioStatus = useCallback((userId: string, status: 'Ativo' | 'Inativo') => {
    updateData(d => ({ ...d, usuarios: d.usuarios.map(u => u.id === userId ? { ...u, statusPlano: status } : u) }))
  }, [updateData])

  const signupAndLogin = useCallback((u: Omit<Usuario, 'id' | 'role' | 'statusPlano'>): Usuario => {
    const newUser: Usuario = {
      ...u,
      id: `u${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      role: 'aluno',
      statusPlano: 'Ativo',
    }
    updateData(d => ({ ...d, usuarios: [...d.usuarios, newUser] }))
    // Login directly — bypasses the data.usuarios lookup race.
    setCurrentUser(newUser.id)
    setCurrentUserId(newUser.id)
    setActiveViewState('aluno')
    return newUser
  }, [updateData])

  const updateAula = useCallback((aula: Aula) => {
    updateData(d => {
      const old = d.aulas.find(a => a.id === aula.id)
      const newCap = Math.max(0, Math.floor(Number(aula.vagasTotais) || 0))
      const oldCap = Math.max(0, Math.floor(Number(old?.vagasTotais) || 0))
      // Auto-promote waitlist when capacity increases and mode is automatic
      let updated = aula
      if (newCap > oldCap && d.configuracoes.modoFilaEspera === 'AUTOMATICO') {
        const newBookings = { ...aula.bookingsPorDia }
        aula.diasSemana.forEach(dia => {
          const booking = newBookings[dia] ?? { inscritos: [], filaEspera: [] }
          const available = newCap - booking.inscritos.length
          if (available > 0 && booking.filaEspera.length > 0) {
            const promoted = booking.filaEspera.slice(0, available)
            newBookings[dia] = {
              inscritos: [...booking.inscritos, ...promoted],
              filaEspera: booking.filaEspera.slice(promoted.length),
            }
          }
        })
        updated = { ...aula, bookingsPorDia: newBookings }
      }
      return { ...d, aulas: d.aulas.map(a => a.id === aula.id ? updated : a) }
    })
  }, [updateData])

  const addAula = useCallback((aulaData: Omit<Aula, 'id'>) => {
    const newAula: Aula = { ...aulaData, id: `a${Date.now()}${Math.random().toString(36).slice(2, 5)}` }
    updateData(d => ({ ...d, aulas: [...d.aulas, newAula] }))
  }, [updateData])

  const deleteAula = useCallback((aulaId: string) => {
    updateData(d => ({ ...d, aulas: d.aulas.filter(a => a.id !== aulaId) }))
  }, [updateData])

  const addProfessor = useCallback((nome: string): Professor => {
    const newProf: Professor = {
      id: `p${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      nome: nome.trim(),
      modalidades: [],
    }
    updateData(d => ({ ...d, professores: [...d.professores, newProf] }))
    return newProf
  }, [updateData])

  const resetDemo = useCallback(() => {
    const fresh = resetAppData()
    setData(fresh)
    clearCurrentUser()
    setCurrentUserId(null)
  }, [])

  return (
    <AppContext.Provider value={{
      data, currentUser, isDark, isOffline, activeView, brandColor, setBrandColor,
      login, logout, toggleDark, setActiveView,
      bookClassDia, cancelClassDia, joinWaitlistDia,
      updateConfiguracoes, addAviso, deleteAviso, sendMensagem,
      markAttendance, getAttendance, addUsuario, signupAndLogin, updateUsuarioStatus, updateAula, addAula, deleteAula, addProfessor,
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
