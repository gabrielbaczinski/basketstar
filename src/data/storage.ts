import type { AppData, Aula } from '../types'
import { initialData } from './mockData'

const STORAGE_KEY = 'gym_app_data'
const SESSION_KEY = 'gym_current_user'

/** Validate loaded data has the expected shape; coerce numbers; drop corrupted aulas */
function sanitize(data: AppData): AppData {
  if (!data || !Array.isArray(data.aulas) || !Array.isArray(data.usuarios)) return initialData

  const aulas: Aula[] = data.aulas
    .filter(a => a && typeof a.id === 'string' && Array.isArray(a.diasSemana))
    .map(a => {
      const vagasTotais = Math.max(0, Math.floor(Number(a.vagasTotais) || 0))
      const bookingsPorDia: Aula['bookingsPorDia'] = {}
      a.diasSemana.forEach(dia => {
        const b = a.bookingsPorDia?.[dia]
        bookingsPorDia[dia] = {
          inscritos: Array.isArray(b?.inscritos) ? b!.inscritos.filter((x): x is string => typeof x === 'string') : [],
          filaEspera: Array.isArray(b?.filaEspera) ? b!.filaEspera.filter((x): x is string => typeof x === 'string') : [],
        }
      })
      return { ...a, vagasTotais, bookingsPorDia }
    })

  return { ...data, aulas, attendance: data.attendance ?? {} }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return sanitize(JSON.parse(raw))
  } catch {
    // corrupted — fall through to defaults
  }
  return initialData
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetAppData(): AppData {
  localStorage.removeItem(STORAGE_KEY)
  return initialData
}

export function getCurrentUserId(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setCurrentUser(userId: string): void {
  sessionStorage.setItem(SESSION_KEY, userId)
}

export function clearCurrentUser(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
