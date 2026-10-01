import type { TourStep } from '../context/TourContext'

export const adminAulasTour: TourStep[] = [
  {
    target: 'admin-nova-aula',
    title: 'Criar nova aula',
    body: 'Clique aqui para criar uma nova turma. Defina a modalidade, professor, horário, dias da semana e total de vagas.',
    placement: 'bottom',
  },
  {
    target: 'admin-importar-csv',
    title: 'Importar planilha',
    body: 'Importe sua grade de aulas existente via arquivo CSV. Baixe o modelo de template para preencher e subir.',
    placement: 'bottom',
  },
  {
    target: 'admin-aulas-table',
    title: 'Grade de aulas',
    body: 'Veja todas as turmas ativas com a ocupação em tempo real. Use "Editar" para alterar vagas ou professor, e "Chamada" para registrar a presença dos alunos.',
    placement: 'top',
  },
]

export const studentAulasTour: TourStep[] = [
  {
    target: 'student-filtros',
    title: 'Filtros de aulas',
    body: 'Use os filtros para encontrar aulas por modalidade, horário preferido ou professor específico.',
    placement: 'bottom',
  },
  {
    target: 'student-dias',
    title: 'Selecionar dia',
    body: 'Escolha o dia da semana para ver as turmas disponíveis naquela data.',
    placement: 'bottom',
  },
  {
    target: 'student-aulas-list',
    title: 'Aulas disponíveis',
    body: 'Cada card mostra o professor, horário e vagas disponíveis. Clique em "Agendar" para reservar sua vaga ou entrar na fila de espera.',
    placement: 'top',
  },
]

export const pageTours: Record<string, Record<string, TourStep[]>> = {
  aluno: {
    '/aulas': studentAulasTour,
  },
  admin: {
    '/aulas': adminAulasTour,
  },
}
