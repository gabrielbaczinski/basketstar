import type { Aula, BookingDia } from '../types'

export function getBookingDia(aula: Aula, dia: string): BookingDia {
  return aula.bookingsPorDia[dia] ?? { inscritos: [], filaEspera: [] }
}

export function getVagasDisponiveisDia(aula: Aula, dia: string): number {
  const total = Number(aula.vagasTotais) || 0
  return Math.max(0, total - getBookingDia(aula, dia).inscritos.length)
}

export function isInscritoDia(aula: Aula, dia: string, userId: string): boolean {
  return getBookingDia(aula, dia).inscritos.includes(userId)
}

export function isNaFilaDia(aula: Aula, dia: string, userId: string): boolean {
  return getBookingDia(aula, dia).filaEspera.includes(userId)
}

export function getAllInscritos(aula: Aula): string[] {
  const all = new Set<string>()
  Object.values(aula.bookingsPorDia).forEach(b => b.inscritos.forEach(id => all.add(id)))
  return Array.from(all)
}

export function getMediaOcupacaoPct(aula: Aula): number {
  const dias = aula.diasSemana
  if (dias.length === 0) return 0
  const vagas = Number(aula.vagasTotais) || 0
  if (vagas === 0) return 0
  const total = dias.reduce((sum, dia) => sum + getBookingDia(aula, dia).inscritos.length, 0)
  return total / dias.length / vagas
}

export function getMaxOcupados(aula: Aula): number {
  return aula.diasSemana.reduce((max, dia) => Math.max(max, getBookingDia(aula, dia).inscritos.length), 0)
}
