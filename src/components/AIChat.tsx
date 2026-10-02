import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, CalendarCheck, CalendarX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getBookingDia, getVagasDisponiveisDia } from '../utils/aulaUtils'

// ── Message types ─────────────────────────────────────────────────────────────

interface BookOption {
  aulaId: string
  dia: string
  label: string
}

interface Msg {
  id: number
  role: 'user' | 'bot'
  text: string
  options?: BookOption[]
  optionAction?: 'book' | 'cancel'
  confirm?: BookOption & { action: 'book' | 'cancel' }
  acted?: boolean
}

// ── Normalização ──────────────────────────────────────────────────────────────

const DIA_NORM: Record<string, string> = {
  seg: 'Segunda', segunda: 'Segunda',
  ter: 'Terça', terca: 'Terça',
  qua: 'Quarta', quarta: 'Quarta',
  qui: 'Quinta', quinta: 'Quinta',
  sex: 'Sexta', sexta: 'Sexta',
  sab: 'Sábado', sabado: 'Sábado',
  dom: 'Domingo', domingo: 'Domingo',
}

const MOD_KEYS: [RegExp, string][] = [
  [/pilates/, 'Pilates'],
  [/muay|muaythai/, 'Muay Thai'],
  [/\bboxe?\b/, 'Boxe'],
  [/spin(ning)?|bike/, 'Spinning'],
  [/yoga/, 'Yoga'],
  [/funcional|functional/, 'Funcional'],
  [/cross(fit)?/, 'Crossfit'],
  [/zumba/, 'Zumba'],
  [/dan[cç]|dance/, 'Dança'],
]

const DOW_TO_DIA: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
  4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
}

const DIA_SHORT: Record<string, string> = {
  Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui',
  Sexta: 'Sex', Sábado: 'Sáb', Domingo: 'Dom',
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function extractDia(t: string): string | undefined {
  for (const [key, val] of Object.entries(DIA_NORM)) {
    if (new RegExp(`\\b${key}\\b`).test(t)) return val
  }
  if (/\bhoje\b/.test(t)) return DOW_TO_DIA[new Date().getDay()]
  if (/\bamanha\b/.test(t)) return DOW_TO_DIA[(new Date().getDay() + 1) % 7]
}

function extractMod(t: string): string | undefined {
  for (const [re, val] of MOD_KEYS) {
    if (re.test(t)) return val
  }
}

function extractHora(t: string): string | undefined {
  const m = t.match(/\b(\d{1,2})(?:h|:)(\d{2})?\b/)
  if (!m) return undefined
  const h = (m[1] ?? '0').padStart(2, '0')
  const min = (m[2] ?? '00').padStart(2, '0')
  return `${h}:${min}`
}

function fmtDias(dias: string[]) {
  return dias.map(d => DIA_SHORT[d] ?? d).join('/')
}

// ── ID helper ─────────────────────────────────────────────────────────────────

let _id = 0
function nextId() { return ++_id }

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIChat() {
  const { data, activeView, currentUser, bookClassDia, cancelClassDia, joinWaitlistDia } = useApp()

  const greeting = activeView === 'admin'
    ? 'Olá! Posso te ajudar com ocupação das aulas, dados de alunos e análise de turmas.'
    : 'Oi! Posso consultar horários, verificar vagas e agendar aulas para você. O que deseja?'

  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: nextId(), role: 'bot', text: greeting },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  // Stores the last suggested booking so "sim/ok" can confirm it
  const pendingBookRef = useRef<BookOption | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  useEffect(() => {
    setMsgs([{ id: nextId(), role: 'bot', text: greeting }])
    pendingBookRef.current = null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView])

  const pushBot = (partial: Omit<Msg, 'id' | 'role'>) => {
    setMsgs(m => [...m, { ...partial, id: nextId(), role: 'bot' }])
  }

  // ── Intent handlers ──────────────────────────────────────────────────────────

  function handleMySchedule() {
    if (!currentUser) return pushBot({ text: 'Você não está logado.' })
    const booked: Array<{ aula: typeof data.aulas[0]; dia: string }> = []
    for (const aula of data.aulas) {
      for (const dia of aula.diasSemana) {
        if (getBookingDia(aula, dia).inscritos.includes(currentUser.id)) {
          booked.push({ aula, dia })
        }
      }
    }
    if (booked.length === 0) {
      return pushBot({ text: 'Você ainda não tem aulas agendadas. Quer que eu te ajude a escolher uma?' })
    }
    const lines = booked.map(({ aula, dia }) => {
      const prof = data.professores.find(p => p.id === aula.professorId)
      return `• ${aula.modalidade} — ${dia} às ${aula.horario} (${prof?.nome ?? ''})`
    })
    pushBot({ text: `Suas aulas agendadas (${booked.length}):\n${lines.join('\n')}` })
  }

  function handleListAll() {
    const byMod = new Map<string, typeof data.aulas>()
    for (const a of data.aulas) {
      if (!byMod.has(a.modalidade)) byMod.set(a.modalidade, [])
      byMod.get(a.modalidade)!.push(a)
    }
    const lines: string[] = []
    byMod.forEach((aulas, mod) => {
      const horarios = aulas.map(a => `${a.horario} (${fmtDias(a.diasSemana)})`).join(', ')
      lines.push(`• ${mod}: ${horarios}`)
    })
    pushBot({ text: `Grade de aulas disponíveis:\n${lines.join('\n')}\n\nQual modalidade quer agendar?` })
  }

  function handleListMod(modalidade: string, dia?: string) {
    const aulas = data.aulas.filter(a => a.modalidade === modalidade)
    if (aulas.length === 0) return pushBot({ text: `Não temos aulas de ${modalidade} na grade.` })
    const prof = data.professores.find(p => p.id === aulas[0]!.professorId)

    if (dia) {
      // Specific day — find the slot and show confirm card directly
      const opts: BookOption[] = []
      for (const a of aulas) {
        if (!a.diasSemana.includes(dia)) continue
        const b = getBookingDia(a, dia)
        if (b.inscritos.includes(currentUser?.id ?? '')) {
          return pushBot({ text: `Você já está inscrito em ${modalidade} na ${dia} às ${a.horario}.` })
        }
        const livres = getVagasDisponiveisDia(a, dia)
        const vagasTxt = livres > 0 ? `${livres} vaga${livres !== 1 ? 's' : ''}` : 'fila de espera'
        opts.push({
          aulaId: a.id,
          dia,
          label: `${modalidade} — ${dia} às ${a.horario} com ${prof?.nome ?? ''} (${vagasTxt})`,
        })
      }
      if (opts.length === 0) return pushBot({ text: `Não há ${modalidade} na ${dia}.` })
      if (opts.length === 1) {
        pendingBookRef.current = opts[0]!
        return pushBot({ text: 'Encontrei esta aula. Quer agendar?', confirm: { ...opts[0]!, action: 'book' } })
      }
      return pushBot({ text: `${opts.length} turmas de ${modalidade} na ${dia}:`, options: opts, optionAction: 'book' })
    }

    // No day — list all with availability, offer options if few choices
    const lines: string[] = []
    const bookableOpts: BookOption[] = []
    for (const a of aulas) {
      for (const d of a.diasSemana) {
        const b = getBookingDia(a, d)
        const livres = getVagasDisponiveisDia(a, d)
        const inscrito = currentUser && b.inscritos.includes(currentUser.id)
        const naFila = currentUser && b.filaEspera.includes(currentUser.id)
        const status = inscrito ? '✓ inscrito' : naFila ? '⏳ na fila' : livres > 0 ? `${livres} vaga${livres !== 1 ? 's' : ''}` : 'lotada'
        lines.push(`• ${d} às ${a.horario} — ${status}`)
        if (!inscrito && !naFila) {
          const vagasTxt = livres > 0 ? `${livres} vaga${livres !== 1 ? 's' : ''}` : 'fila de espera'
          bookableOpts.push({ aulaId: a.id, dia: d, label: `${d} às ${a.horario} (${vagasTxt})` })
        }
      }
    }

    if (bookableOpts.length === 1) {
      pendingBookRef.current = { ...bookableOpts[0]!, label: `${modalidade} — ${bookableOpts[0]!.label.replace('às', 'às')} com ${prof?.nome ?? ''}` }
    }

    const summary = `${modalidade} com ${prof?.nome ?? ''}:\n${lines.join('\n')}`
    if (bookableOpts.length > 0 && bookableOpts.length <= 4) {
      // Mostrar opções clicáveis
      const opts = bookableOpts.map(o => ({
        ...o,
        label: `${modalidade} — ${o.label} com ${prof?.nome ?? ''}`,
      }))
      return pushBot({ text: `${summary}\n\nQual dia você quer agendar?`, options: opts, optionAction: 'book' })
    }

    pushBot({ text: `${summary}\n\nEm qual dia prefere? É só me dizer!` })
  }

  function handleAvailability(modalidade?: string) {
    if (!currentUser) return pushBot({ text: 'Você não está logado.' })
    const aulas = modalidade ? data.aulas.filter(a => a.modalidade === modalidade) : data.aulas
    const available: string[] = []
    for (const a of aulas) {
      for (const dia of a.diasSemana) {
        const b = getBookingDia(a, dia)
        const livres = a.vagasTotais - b.inscritos.length
        if (livres > 0 && !b.inscritos.includes(currentUser.id)) {
          available.push(`• ${a.modalidade} — ${dia} às ${a.horario} (${livres} vaga${livres !== 1 ? 's' : ''})`)
        }
      }
    }
    if (available.length === 0) {
      return pushBot({ text: modalidade
        ? `Todas as aulas de ${modalidade} estão lotadas ou você já está inscrito.`
        : 'Todas as aulas estão lotadas no momento.' })
    }
    const shown = available.slice(0, 8)
    pushBot({ text: `Aulas com vagas${modalidade ? ` de ${modalidade}` : ''}:\n${shown.join('\n')}${available.length > 8 ? `\n…e mais ${available.length - 8} opções.` : ''}\n\nQuer agendar alguma?` })
  }

  function handleBook(modalidade?: string, dia?: string, horario?: string) {
    if (!currentUser) return pushBot({ text: 'Você não está logado.' })
    if (!modalidade && !dia) {
      return pushBot({ text: 'Qual modalidade e dia você prefere? Ex: "pilates segunda" ou "yoga quinta 9h".' })
    }

    let candidates = data.aulas
    if (modalidade) candidates = candidates.filter(a => a.modalidade === modalidade)

    const opts: BookOption[] = []
    for (const a of candidates) {
      const dias = dia ? a.diasSemana.filter(d => d === dia) : a.diasSemana
      for (const d of dias) {
        if (horario && a.horario !== horario) continue
        const b = getBookingDia(a, d)
        if (b.inscritos.includes(currentUser.id)) continue
        const livres = getVagasDisponiveisDia(a, d)
        const prof = data.professores.find(p => p.id === a.professorId)
        const vagasTxt = livres > 0 ? `${livres} vaga${livres !== 1 ? 's' : ''}` : 'fila de espera'
        opts.push({
          aulaId: a.id,
          dia: d,
          label: `${a.modalidade} — ${d} às ${a.horario} com ${prof?.nome ?? ''} (${vagasTxt})`,
        })
      }
    }

    if (opts.length === 0) {
      return pushBot({ text: `Não encontrei${modalidade ? ` aulas de ${modalidade}` : ' aulas'}${dia ? ` na ${dia}` : ''} disponíveis. Você já pode estar inscrito ou as turmas estão lotadas.` })
    }
    if (opts.length === 1) {
      pendingBookRef.current = opts[0]!
      return pushBot({ text: 'Encontrei esta aula para você:', confirm: { ...opts[0]!, action: 'book' } })
    }
    pushBot({
      text: `Encontrei ${opts.length} opção${opts.length !== 1 ? 'ões' : ''}${modalidade ? ` de ${modalidade}` : ''}. Qual você quer?`,
      options: opts.slice(0, 6),
      optionAction: 'book',
    })
  }

  function handleCancel(modalidade?: string, dia?: string) {
    if (!currentUser) return pushBot({ text: 'Você não está logado.' })
    const booked: BookOption[] = []
    for (const a of data.aulas) {
      if (modalidade && a.modalidade !== modalidade) continue
      for (const d of a.diasSemana) {
        if (dia && d !== dia) continue
        const b = getBookingDia(a, d)
        const naFila = b.filaEspera.includes(currentUser.id)
        if (!b.inscritos.includes(currentUser.id) && !naFila) continue
        const prof = data.professores.find(p => p.id === a.professorId)
        booked.push({
          aulaId: a.id,
          dia: d,
          label: `${a.modalidade} — ${d} às ${a.horario} com ${prof?.nome ?? ''}${naFila ? ' (fila de espera)' : ''}`,
        })
      }
    }
    if (booked.length === 0) {
      return pushBot({ text: modalidade
        ? `Você não está inscrito em ${modalidade}${dia ? ` na ${dia}` : ''}.`
        : 'Você não tem aulas agendadas para cancelar.' })
    }
    if (booked.length === 1) {
      return pushBot({ text: 'Confirmar cancelamento?', confirm: { ...booked[0]!, action: 'cancel' } })
    }
    pushBot({ text: 'Qual aula você quer cancelar?', options: booked.slice(0, 6), optionAction: 'cancel' })
  }

  function handleAdminQuery(t: string) {
    const mod = extractMod(t)

    if (/ocupa|taxa|media|lotad|capacid/.test(t)) {
      if (mod) {
        const aulas = data.aulas.filter(a => a.modalidade === mod)
        if (aulas.length === 0) return pushBot({ text: `Não encontrei aulas de ${mod}.` })
        const lines = aulas.map(a => {
          const total = a.diasSemana.reduce((s, d) => s + getBookingDia(a, d).inscritos.length, 0)
          const cap = a.vagasTotais * a.diasSemana.length
          const pct = cap > 0 ? Math.round(total / cap * 100) : 0
          return `• ${a.horario} (${fmtDias(a.diasSemana)}): ${total}/${cap} — ${pct}%`
        })
        return pushBot({ text: `Ocupação de ${mod}:\n${lines.join('\n')}` })
      }
      const stats = data.aulas.map(a => {
        const total = a.diasSemana.reduce((s, d) => s + getBookingDia(a, d).inscritos.length, 0)
        const cap = a.vagasTotais * a.diasSemana.length
        return { nome: `${a.modalidade} ${a.horario}`, pct: cap > 0 ? Math.round(total / cap * 100) : 0 }
      })
      const avg = Math.round(stats.reduce((s, x) => s + x.pct, 0) / stats.length)
      const top = [...stats].sort((a, b) => b.pct - a.pct).slice(0, 4)
      return pushBot({ text: `Taxa média de ocupação: ${avg}%\n\nTop turmas:\n${top.map(x => `• ${x.nome}: ${x.pct}%`).join('\n')}` })
    }

    if (/alun|usuari|ativ|inativ|cadastr/.test(t)) {
      const ativos = data.usuarios.filter(u => u.role === 'aluno' && u.statusPlano === 'Ativo').length
      const inativos = data.usuarios.filter(u => u.role === 'aluno' && u.statusPlano === 'Inativo').length
      return pushBot({ text: `Alunos cadastrados: ${ativos + inativos}\n• Ativos: ${ativos}\n• Inativos: ${inativos}\n\nGerencie na aba Usuários.` })
    }

    if (mod) {
      const aulas = data.aulas.filter(a => a.modalidade === mod)
      if (aulas.length === 0) return pushBot({ text: `Não temos ${mod} na grade.` })
      const lines = aulas.map(a => {
        const prof = data.professores.find(p => p.id === a.professorId)
        const total = a.diasSemana.reduce((s, d) => s + getBookingDia(a, d).inscritos.length, 0)
        const cap = a.vagasTotais * a.diasSemana.length
        return `• ${a.horario} (${fmtDias(a.diasSemana)}) — ${prof?.nome ?? ''} — ${total}/${cap} inscritos`
      })
      return pushBot({ text: `Turmas de ${mod}:\n${lines.join('\n')}` })
    }

    if (/grade|aulas|turmas|horario/.test(t)) {
      const byMod = new Map<string, typeof data.aulas>()
      for (const a of data.aulas) {
        if (!byMod.has(a.modalidade)) byMod.set(a.modalidade, [])
        byMod.get(a.modalidade)!.push(a)
      }
      const lines: string[] = []
      byMod.forEach((aulas, mod) => {
        lines.push(`• ${mod}: ${aulas.map(a => `${a.horario} (${fmtDias(a.diasSemana)})`).join(', ')}`)
      })
      return pushBot({ text: `Grade atual:\n${lines.join('\n')}` })
    }

    pushBot({ text: 'Posso te ajudar com:\n• Taxa de ocupação por modalidade\n• Total de alunos ativos\n• Grade de turmas\n\nEx: "ocupação do pilates" ou "quantos alunos ativos?"' })
  }

  // ── Action execution ─────────────────────────────────────────────────────────

  const executeBook = (opt: BookOption, msgId: number) => {
    pendingBookRef.current = null
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, acted: true } : msg))
    const result = bookClassDia(opt.aulaId, opt.dia)
    if (result === 'full') {
      return pushBot({
        text: 'A aula está lotada. Deseja entrar na fila de espera?',
        confirm: { ...opt, label: opt.label.replace(/\(\d+ vagas?\)/, '(fila de espera)'), action: 'book' },
      })
    }
    const texts: Record<string, string> = {
      booked: `Agendado! Você está confirmado em ${opt.label.split('(')[0]?.trimEnd()}.`,
      waitlisted: 'Você entrou na fila de espera. Será avisado quando uma vaga abrir.',
      already_booked: 'Você já está inscrito nessa aula.',
      conflict: 'Você já tem outra aula nesse horário.',
      inactive: 'Seu plano está inativo. Entre em contato com a academia.',
      too_far: 'Esta aula ainda não está disponível para agendamento. Tente mais perto da data.',
    }
    pushBot({ text: texts[result] ?? 'Não foi possível agendar. Tente pela página de Aulas.' })
  }

  const executeJoinWaitlist = (opt: BookOption, msgId: number) => {
    pendingBookRef.current = null
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, acted: true } : msg))
    joinWaitlistDia(opt.aulaId, opt.dia)
    pushBot({ text: `Você entrou na fila de espera para ${opt.label.split('(')[0]?.trimEnd()}. Avisaremos quando uma vaga abrir.` })
  }

  const executeCancel = (opt: BookOption, msgId: number) => {
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, acted: true } : msg))
    const result = cancelClassDia(opt.aulaId, opt.dia)
    const texts: Record<string, string> = {
      ok: `Cancelado. ${opt.label.split('com')[0]?.trimEnd()} foi removida da sua agenda.`,
      too_late: `Não é possível cancelar agora — prazo mínimo de ${data.configuracoes.tempoLimiteCancelamentoMinutos} min.`,
      removed_from_waitlist: 'Você saiu da fila de espera.',
      not_found: 'Não encontrei esse agendamento.',
    }
    pushBot({ text: texts[result] ?? 'Não foi possível cancelar. Tente pela página de Aulas.' })
  }

  const dismiss = (msgId: number) => {
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, acted: true } : msg))
  }

  const pickOption = (opt: BookOption, msgId: number, action: 'book' | 'cancel') => {
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, acted: true } : msg))
    pushBot({
      text: action === 'book' ? 'Confirmar agendamento?' : 'Confirmar cancelamento?',
      confirm: { ...opt, action },
    })
  }

  // ── Main dispatcher ───────────────────────────────────────────────────────────

  const respond = (text: string) => {
    const t = norm(text)
    const dia = extractDia(t)
    const mod = extractMod(t)
    const hora = extractHora(t)

    if (activeView === 'admin') return handleAdminQuery(t)

    // Affirmative response — confirm pending suggestion
    if (/^(sim|ok|quero|pode|claro|pode ser|va|vou|bora|yes|isso|agend)$/.test(t.trim())) {
      const pending = pendingBookRef.current
      if (pending) {
        pendingBookRef.current = null
        return pushBot({ text: 'Confirmar agendamento?', confirm: { ...pending, action: 'book' } })
      }
      return pushBot({ text: 'Qual aula você quer agendar? Me diga a modalidade e o dia. Ex: "pilates segunda".' })
    }

    if (/minha.*(agenda|aulas|horario)|meus agendamentos|o que tenho|quando tenho|minhas aulas/.test(t)) {
      return handleMySchedule()
    }

    if (/cancel|remov|sair da/.test(t)) return handleCancel(mod, dia)

    // Booking intent — explicit trigger words
    const bookIntent = /agend|reserv|inscrev|marcar/.test(t)
      || (/(?:quero|gostaria|pode|tem como)\b/.test(t) && (mod != null || dia != null))
    if (bookIntent) return handleBook(mod, dia, hora)

    if (/vaga|lotad|disponiv|livre|cheio|tem.*lugar/.test(t)) return handleAvailability(mod)

    // Modalidade detected — list/show that class (BEFORE generic list-all)
    if (mod) return handleListMod(mod, dia)

    // Day only — show available classes for that day
    if (dia) return handleBook(undefined, dia, hora)

    // Generic grade — only when no mod/day found
    if (/grade|todas.*aulas|ver.*aulas|listar.*aulas|horarios|horario|aulas/.test(t)) return handleListAll()

    if (/ola|oi\b|bom dia|boa tarde|boa noite/.test(t)) {
      return pushBot({ text: `Olá, ${currentUser?.nome.split(' ')[0] ?? ''}! Posso agendar aulas, mostrar sua agenda ou verificar vagas disponíveis.` })
    }

    pushBot({ text: 'Posso te ajudar com:\n• "minha agenda"\n• "pilates segunda"\n• "agendar yoga quinta"\n• "cancelar muay thai"\n• "tem vaga de spinning?"\n\nÉ só me dizer!' })
  }

  // ── Send ──────────────────────────────────────────────────────────────────────

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMsgs(m => [...m, { id: nextId(), role: 'user', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      respond(text)
    }, 500)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-12 h-12 rounded-full text-white flex items-center justify-center transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #AF52DE 0%, #5E6AD2 100%)',
          boxShadow: open ? 'none' : '0 4px 16px rgba(94,106,210,0.30)',
        }}
        aria-label="Chat com IA"
      >
        <Sparkles size={19} />
      </button>

      {open && (
        <div
          className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm ios-card flex flex-col overflow-hidden animate-scale-in"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 hairline-b shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-ios flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #AF52DE 0%, #5E6AD2 100%)' }}
              >
                <Sparkles size={14} />
              </div>
              <div>
                <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-tight">Assistente IA</p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">
                  {activeView === 'admin' ? 'Gestão · FitCore' : 'Agendamentos · FitCore'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full ios-fill-2 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-ios-bg dark:bg-ios-dbg">
            {msgs.map((m) => (
              <div key={m.id}>
                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 text-footnote leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'text-white rounded-[16px] rounded-br-[4px]'
                        : 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel rounded-[16px] rounded-bl-[4px] shadow-ios-1'
                    }`}
                    style={m.role === 'user' ? { background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)' } : undefined}
                  >
                    {m.text}
                  </div>
                </div>

                {/* Confirm card */}
                {!m.acted && m.confirm && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2 px-1 leading-snug">
                      {m.confirm.label}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const isFila = m.confirm!.label.includes('fila')
                          if (m.confirm!.action === 'book') {
                            if (isFila) executeJoinWaitlist(m.confirm!, m.id)
                            else executeBook(m.confirm!, m.id)
                          } else {
                            executeCancel(m.confirm!, m.id)
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-caption1 font-semibold text-white transition-all active:scale-95"
                        style={{ background: m.confirm.action === 'book' ? 'var(--brand)' : '#FF3B30' }}
                      >
                        {m.confirm.action === 'book'
                          ? <><CalendarCheck size={13} />{m.confirm.label.includes('fila') ? 'Entrar na fila' : 'Confirmar'}</>
                          : <><CalendarX size={13} />Cancelar aula</>}
                      </button>
                      <button onClick={() => dismiss(m.id)} className="flex-1 ios-btn-gray !py-2 !text-caption1">
                        Não agora
                      </button>
                    </div>
                  </div>
                )}

                {/* Options picker */}
                {!m.acted && m.options && (
                  <div className="mt-2 space-y-1">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => pickOption(opt, m.id, m.optionAction ?? 'book')}
                        className="w-full text-left px-3 py-2 ios-fill-2 rounded-ios text-caption1 text-ios-label dark:text-ios-dlabel hover:ios-fill-1 transition-colors leading-snug active:scale-[0.98]"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-ios-dbg-tert rounded-[16px] rounded-bl-[4px] shadow-ios-1 px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: 'rgba(60,60,67,0.3)', animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2 bg-white dark:bg-ios-dbg-elev hairline-t shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={activeView === 'admin' ? 'Ex: ocupação do pilates…' : 'Ex: pilates segunda, minha agenda…'}
              className="ios-input !rounded-full !py-2"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
