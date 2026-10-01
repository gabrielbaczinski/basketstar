import type { AppData } from '../types'

export const initialData: AppData = {
  configuracoes: {
    tempoLimiteCancelamentoMinutos: 60,
    modoFilaEspera: 'AUTOMATICO',
    diasAntecedenciaAgendamento: 7,
    permiteRecorrencia: true,
  },
  professores: [
    { id: 'p1', nome: 'Amanda Rodrigues',     modalidades: ['Pilates', 'Spinning', 'Yoga'] },
    { id: 'p2', nome: 'Camila Nascimento',    modalidades: ['Muay Thai', 'Boxe'] },
    { id: 'p3', nome: 'Rafael Monteiro',      modalidades: ['Funcional', 'Crossfit'] },
    { id: 'p4', nome: 'Beatriz Almeida',      modalidades: ['Zumba', 'Dança'] },
  ],
  aulas: [
    // Pilates — Amanda
    { id: 'a1', modalidade: 'Pilates', professorId: 'p1',
      horario: '07:00', diasSemana: ['Segunda', 'Quarta', 'Sexta'], vagasTotais: 10,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u3','u4'], filaEspera: [] },
        Quarta:  { inscritos: ['u1','u2','u5'], filaEspera: [] },
        Sexta:   { inscritos: ['u2','u3','u4','u5','u6'], filaEspera: [] },
      },
    },
    { id: 'a2', modalidade: 'Pilates', professorId: 'p1',
      horario: '08:00', diasSemana: ['Segunda', 'Quarta'], vagasTotais: 6,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u3','u4','u5','u6','admin1'], filaEspera: ['u7','u8'] },
        Quarta:  { inscritos: ['u1','u2','u3'], filaEspera: [] },
      },
    },
    { id: 'a3', modalidade: 'Pilates', professorId: 'p1',
      horario: '18:00', diasSemana: ['Terça', 'Quinta'], vagasTotais: 8,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u2','u3'], filaEspera: [] },
        'Quinta': { inscritos: ['u2','u3','u4','u5'], filaEspera: [] },
      },
    },

    // Muay Thai — Camila
    { id: 'a4', modalidade: 'Muay Thai', professorId: 'p2',
      horario: '07:30', diasSemana: ['Segunda', 'Quarta', 'Sexta'], vagasTotais: 15,
      bookingsPorDia: {
        Segunda: { inscritos: ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12'], filaEspera: [] },
        Quarta:  { inscritos: ['u1','u2','u3','u4'], filaEspera: [] },
        Sexta:   { inscritos: ['u1','u2','u3','u4','u5','u6','u7','u8'], filaEspera: [] },
      },
    },
    { id: 'a5', modalidade: 'Muay Thai', professorId: 'p2',
      horario: '19:00', diasSemana: ['Terça', 'Quinta'], vagasTotais: 15,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u1','u6','u3','u4','u7','u8'], filaEspera: [] },
        'Quinta': { inscritos: ['u1','u6'], filaEspera: [] },
      },
    },
    { id: 'a6', modalidade: 'Muay Thai', professorId: 'p2',
      horario: '20:00', diasSemana: ['Segunda', 'Quarta'], vagasTotais: 10,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u3','u4','u5','u6','admin1','u7','u8','u9','u10'], filaEspera: ['u11','u12','u13'] },
        Quarta:  { inscritos: ['u2','u3','u4','u5','u6','admin1','u7','u8'], filaEspera: [] },
      },
    },

    // Boxe — Camila
    { id: 'a7', modalidade: 'Boxe', professorId: 'p2',
      horario: '06:00', diasSemana: ['Terça', 'Quinta', 'Sábado'], vagasTotais: 12,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u3','u4','u5'], filaEspera: [] },
        'Quinta': { inscritos: ['u3','u4','u5','u6','u7'], filaEspera: [] },
        'Sábado': { inscritos: ['u3','u4','u5','u6','u7','u8','u9','u10','u11','u12'], filaEspera: ['u13'] },
      },
    },

    // Spinning — Amanda
    { id: 'a8', modalidade: 'Spinning', professorId: 'p1',
      horario: '06:30', diasSemana: ['Segunda', 'Quarta', 'Sexta'], vagasTotais: 12,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u3','u4','u5','u6','u7','u8','u9','u10'], filaEspera: [] },
        Quarta:  { inscritos: ['u2','u3','u4','u5'], filaEspera: [] },
        Sexta:   { inscritos: ['u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12'], filaEspera: ['u14'] },
      },
    },
    { id: 'a9', modalidade: 'Spinning', professorId: 'p1',
      horario: '12:00', diasSemana: ['Terça', 'Quinta'], vagasTotais: 8,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u2','u3','u4','u5','u6','admin1','u7','u8'], filaEspera: ['u9','u10'] },
        'Quinta': { inscritos: ['u2','u3'], filaEspera: [] },
      },
    },
    { id: 'a10', modalidade: 'Spinning', professorId: 'p1',
      horario: '18:30', diasSemana: ['Terça', 'Quinta'], vagasTotais: 12,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u1','u3','u5'], filaEspera: [] },
        'Quinta': { inscritos: ['u1','u3','u5','u7','u9'], filaEspera: [] },
      },
    },

    // Yoga — Amanda
    { id: 'a11', modalidade: 'Yoga', professorId: 'p1',
      horario: '09:00', diasSemana: ['Terça', 'Quinta'], vagasTotais: 10,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u2','u4','u6'], filaEspera: [] },
        'Quinta': { inscritos: ['u2','u4','u6','u8'], filaEspera: [] },
      },
    },
    { id: 'a12', modalidade: 'Yoga', professorId: 'p1',
      horario: '19:30', diasSemana: ['Segunda', 'Quarta'], vagasTotais: 10,
      bookingsPorDia: {
        Segunda: { inscritos: ['u1','u3','u5','u7'], filaEspera: [] },
        Quarta:  { inscritos: ['u1','u3','u5'], filaEspera: [] },
      },
    },

    // Funcional — Rafael
    { id: 'a13', modalidade: 'Funcional', professorId: 'p3',
      horario: '06:00', diasSemana: ['Segunda', 'Quarta', 'Sexta'], vagasTotais: 14,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u4','u6','u8','u10'], filaEspera: [] },
        Quarta:  { inscritos: ['u2','u4','u6'], filaEspera: [] },
        Sexta:   { inscritos: ['u2','u4','u6','u8','u10','u12'], filaEspera: [] },
      },
    },
    { id: 'a14', modalidade: 'Funcional', professorId: 'p3',
      horario: '17:30', diasSemana: ['Terça', 'Quinta'], vagasTotais: 14,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u3','u5','u7','u9'], filaEspera: [] },
        'Quinta': { inscritos: ['u3','u5','u7','u9','u11','u13'], filaEspera: [] },
      },
    },

    // Crossfit — Rafael
    { id: 'a15', modalidade: 'Crossfit', professorId: 'p3',
      horario: '20:00', diasSemana: ['Terça', 'Quinta'], vagasTotais: 10,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u3','u5','u7','u9','u11','u13','u2','u4','u6','admin1'], filaEspera: ['u8','u10'] },
        'Quinta': { inscritos: ['u3','u5','u7'], filaEspera: [] },
      },
    },
    { id: 'a16', modalidade: 'Crossfit', professorId: 'p3',
      horario: '10:00', diasSemana: ['Sábado'], vagasTotais: 12,
      bookingsPorDia: {
        'Sábado': { inscritos: ['u2','u4','u6','u8','u10'], filaEspera: [] },
      },
    },

    // Zumba — Beatriz
    { id: 'a17', modalidade: 'Zumba', professorId: 'p4',
      horario: '19:00', diasSemana: ['Segunda', 'Quarta', 'Sexta'], vagasTotais: 20,
      bookingsPorDia: {
        Segunda: { inscritos: ['u2','u3','u4','u5','u6','u7'], filaEspera: [] },
        Quarta:  { inscritos: ['u2','u3','u4','u5'], filaEspera: [] },
        Sexta:   { inscritos: ['u2','u3','u4','u5','u6','u7','u8','u9','u10'], filaEspera: [] },
      },
    },
    { id: 'a18', modalidade: 'Dança', professorId: 'p4',
      horario: '20:30', diasSemana: ['Terça', 'Quinta'], vagasTotais: 15,
      bookingsPorDia: {
        'Terça':  { inscritos: ['u3','u4','u5','u6','u7'], filaEspera: [] },
        'Quinta': { inscritos: ['u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15'], filaEspera: ['u16'] },
      },
    },
  ],
  usuarios: [
    { id: 'u1',    nome: 'Gabriel Santana',   idade: 22, celular: '(41) 99999-9999', email: 'gabriel@email.com',  statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u2',    nome: 'Maria Silva',       idade: 35, celular: '(41) 98888-8888', email: 'maria@email.com',    statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u3',    nome: 'João Pereira',      idade: 28, celular: '(41) 97777-7777', email: 'joao@email.com',     statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u4',    nome: 'Ana Lima',          idade: 31, celular: '(41) 96666-6666', email: 'ana@email.com',      statusPlano: 'Inativo', role: 'aluno' },
    { id: 'u5',    nome: 'Carlos Rocha',      idade: 45, celular: '(41) 95555-5555', email: 'carlos@email.com',   statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u6',    nome: 'Fernanda Costa',    idade: 27, celular: '(41) 94444-4444', email: 'fernanda@email.com', statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u7',    nome: 'Lucas Martins',     idade: 24, celular: '(41) 94111-1111', email: 'lucas@email.com',    statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'u8',    nome: 'Isabela Ferreira',  idade: 29, celular: '(41) 94222-2222', email: 'isabela@email.com',  statusPlano: 'Ativo',   role: 'aluno' },
    { id: 'admin1',nome: 'Admin Academia',    idade: 30, celular: '(41) 93333-3333', email: 'admin@academia.com', statusPlano: 'Ativo',   role: 'admin' },
  ],
  mensagens: [
    { id: 'm1', de: 'u1', para: 'admin1', texto: 'Olá! Queria saber sobre o horário de Pilates.', timestamp: '2026-09-28T10:00:00Z', lida: true },
    { id: 'm2', de: 'admin1', para: 'u1', texto: 'Olá Gabriel! As aulas de Pilates são às 07h, 08h e 18h. Fique à vontade para agendar!', timestamp: '2026-09-28T10:30:00Z', lida: false },
  ],
  comunidadeAvisos: [
    { id: 'av1', titulo: 'Feriado nacional — Academia fechada', corpo: 'Informamos que no próximo feriado nacional a academia estará fechada. As aulas serão retomadas normalmente no dia seguinte.', timestamp: '2026-09-25T09:00:00Z', autorId: 'admin1' },
    { id: 'av2', titulo: 'Novas turmas de Zumba e Dança', corpo: 'Abrimos vagas para turmas de Zumba (Seg/Qua/Sex 19h) e Dança (Ter/Qui 20h30) com a professora Beatriz. Vagas limitadas, agende já!', timestamp: '2026-09-27T14:00:00Z', autorId: 'admin1' },
    { id: 'av3', titulo: 'Crossfit aos sábados', corpo: 'A partir deste mês temos aulas de Crossfit todo sábado às 10h com o professor Rafael. Garanta sua vaga!', timestamp: '2026-09-29T08:00:00Z', autorId: 'admin1' },
  ],
  attendance: {},
}
