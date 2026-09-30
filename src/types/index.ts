export type ModalidadeType = 'Pilates' | 'Muay Thai' | 'Spinning'
export type ModoFilaType = 'AUTOMATICO' | 'CORRIDA'
export type UserRole = 'aluno' | 'admin'

export interface Configuracoes {
  tempoLimiteCancelamentoMinutos: number
  modoFilaEspera: ModoFilaType
  diasAntecedenciaAgendamento: number
  permiteRecorrencia: boolean
}

export interface Professor {
  id: string
  nome: string
  modalidades: ModalidadeType[]
  foto?: string
}

export interface BookingDia {
  inscritos: string[]
  filaEspera: string[]
}

export interface Aula {
  id: string
  modalidade: ModalidadeType
  professorId: string
  horario: string
  diasSemana: string[]
  vagasTotais: number
  // Per-day bookings — key is day name ("Segunda", "Terça", etc.)
  bookingsPorDia: Record<string, BookingDia>
}

export interface Usuario {
  id: string
  nome: string
  idade: number
  celular: string
  email: string
  statusPlano: 'Ativo' | 'Inativo'
  role?: UserRole
}

export interface Mensagem {
  id: string
  de: string
  para: string
  texto: string
  timestamp: string
  lida: boolean
}

export interface Aviso {
  id: string
  titulo: string
  corpo: string
  timestamp: string
  autorId: string
}

export type AttendanceStatus = 'present' | 'absent'

export interface AppData {
  configuracoes: Configuracoes
  professores: Professor[]
  aulas: Aula[]
  usuarios: Usuario[]
  mensagens: Mensagem[]
  comunidadeAvisos: Aviso[]
  attendance: Record<string, Record<string, AttendanceStatus>>
}
