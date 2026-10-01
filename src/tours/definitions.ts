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
    title: 'Filtre e ordene',
    body: 'Filtre as aulas pela modalidade que você pratica e escolha como ordenar: por horário, vagas disponíveis, modalidade ou professor.',
    placement: 'bottom',
  },
  {
    target: 'student-dias',
    title: 'Escolha o dia',
    body: 'Toque no seletor de dia para abrir o calendário da semana e navegar entre dias com o nome completo e a data.',
    placement: 'bottom',
  },
  {
    target: 'student-aulas-list',
    title: 'Agende sua vaga',
    body: 'As aulas são agrupadas por período (manhã, tarde, noite). Toque em "Agendar" para abrir o modal de confirmação com todos os detalhes antes de confirmar sua inscrição.',
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
