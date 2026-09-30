import type { AppData } from '../types'
import { initialData } from './mockData'

const STORAGE_KEY = 'gym_app_data'
const SESSION_KEY = 'gym_current_user'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
  return initialData
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
