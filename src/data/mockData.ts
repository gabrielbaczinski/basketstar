import type { AppData } from '../types'

export const initialData: AppData = {
  configuracoes: {
    tempoLimiteCancelamentoMinutos: 60,
    modoFilaEspera: 'AUTOMATICO',
    diasAntecedenciaAgendamento: 7,
    permiteRecorrencia: true
  },
  professores: [
    { id: 'p1', nome: 'Profa. Amanda', modalidades: ['Pilates', 'Spinning'] },
    { id: 'p2', nome: 'Profa. Camila', modalidades: ['Muay Thai'] }
  ],
  aulas: [
    {
      id: 'a1',
      modalidade: 'Pilates',
      professorId: 'p1',
      horario: '08:00',
      diasSemana: ['Segunda', 'Quarta'],
      vagasTotais: 5,
      vagasOcupadas: 5,
      inscritos: ['u1', 'u2', 'u3', 'u4', 'u5'],
      filaEspera: ['u6']
    },
    {
      id: 'a2',
      modalidade: 'Muay Thai',
      professorId: 'p2',
      horario: '19:00',
      diasSemana: ['Terça', 'Quinta'],
      vagasTotais: 15,
      vagasOcupadas: 8,
      inscritos: ['u1', 'u6'],
      filaEspera: []
    },
    {
      id: 'a3',
      modalidade: 'Spinning',
      professorId: 'p1',
      horario: '07:00',
      diasSemana: ['Segunda', 'Quarta', 'Sexta'],
      vagasTotais: 12,
      vagasOcupadas: 10,
      inscritos: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
      filaEspera: []
    },
    {
      id: 'a4',
      modalidade: 'Pilates',
      professorId: 'p1',
      horario: '10:00',
      diasSemana: ['Terça', 'Quinta'],
      vagasTotais: 8,
      vagasOcupadas: 3,
      inscritos: ['u2', 'u3', 'u4'],
      filaEspera: []
    },
    {
      id: 'a5',
      modalidade: 'Muay Thai',
      professorId: 'p2',
      horario: '07:30',
      diasSemana: ['Segunda', 'Quarta', 'Sexta'],
      vagasTotais: 15,
      vagasOcupadas: 12,
      inscritos: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12'],
      filaEspera: []
    }
  ],
  usuarios: [
    { id: 'u1', nome: 'Gabriel Santana', idade: 22, celular: '(41) 99999-9999', email: 'gabriel@email.com', statusPlano: 'Ativo', role: 'aluno' },
    { id: 'u2', nome: 'Maria Silva', idade: 35, celular: '(41) 98888-8888', email: 'maria@email.com', statusPlano: 'Ativo', role: 'aluno' },
    { id: 'u3', nome: 'João Pereira', idade: 28, celular: '(41) 97777-7777', email: 'joao@email.com', statusPlano: 'Ativo', role: 'aluno' },
    { id: 'u4', nome: 'Ana Lima', idade: 31, celular: '(41) 96666-6666', email: 'ana@email.com', statusPlano: 'Inativo', role: 'aluno' },
    { id: 'u5', nome: 'Carlos Rocha', idade: 45, celular: '(41) 95555-5555', email: 'carlos@email.com', statusPlano: 'Ativo', role: 'aluno' },
    { id: 'u6', nome: 'Fernanda Costa', idade: 27, celular: '(41) 94444-4444', email: 'fernanda@email.com', statusPlano: 'Ativo', role: 'aluno' },
    { id: 'admin1', nome: 'Admin Academia', idade: 30, celular: '(41) 93333-3333', email: 'admin@academia.com', statusPlano: 'Ativo', role: 'admin' }
  ],
  mensagens: [
    { id: 'm1', de: 'u1', para: 'admin1', texto: 'Olá! Queria saber sobre o horário de Pilates.', timestamp: '2026-09-28T10:00:00Z', lida: true },
    { id: 'm2', de: 'admin1', para: 'u1', texto: 'Olá Gabriel! As aulas de Pilates são às 08h e 10h. Fique à vontade para agendar!', timestamp: '2026-09-28T10:30:00Z', lida: false }
  ],
  comunidadeAvisos: [
    { id: 'av1', titulo: 'Feriado Nacional - Academia Fechada', corpo: 'Informamos que no próximo feriado nacional a academia estará fechada. As aulas serão retomadas normalmente no dia seguinte.', timestamp: '2026-09-25T09:00:00Z', autorId: 'admin1' },
    { id: 'av2', titulo: 'Nova turma de Spinning disponível!', corpo: 'Abrimos vagas para a nova turma de Spinning às 19h30 nas terças e quintas-feiras. Aproveite e agende já sua vaga!', timestamp: '2026-09-27T14:00:00Z', autorId: 'admin1' }
  ],
  attendance: {}
}
