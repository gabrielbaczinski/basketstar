import { useMemo, useState, useRef } from 'react'
import { Search, Plus, Upload, Sparkles, FileText, Check, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Usuario } from '../../types'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'

interface CSVPreview {
  headers: string[]
  rows: string[][]
  mapping: Record<string, string>
}

export default function AdminUsers() {
  const { data, addUsuario } = useApp()
  const { showToast } = useToast()
  const [q, setQ] = useState('')
  const [openNew, setOpenNew] = useState(false)
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Omit<Usuario, 'id'>>({
    nome: '', idade: 18, celular: '', email: '', statusPlano: 'Ativo', role: 'aluno',
  })

  const alunos = useMemo(() => {
    const list = data.usuarios.filter(u => u.role === 'aluno')
    const term = q.trim().toLowerCase()
    if (!term) return list
    return list.filter(u =>
      u.nome.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.celular.includes(term)
    )
  }, [data.usuarios, q])

  const totalAlunos = data.usuarios.filter(u => u.role === 'aluno').length
  const ativos = data.usuarios.filter(u => u.role === 'aluno' && u.statusPlano === 'Ativo').length

  const submit = () => {
    if (!form.nome.trim() || !form.email.trim()) {
      showToast('Preencha nome e email.', 'warning')
      return
    }
    addUsuario(form)
    showToast('Aluno cadastrado com sucesso.', 'success')
    setOpenNew(false)
    setForm({ nome: '', idade: 18, celular: '', email: '', statusPlano: 'Ativo', role: 'aluno' })
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (lines.length === 0) return
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()))
    const mapping: Record<string, string> = {}
    headers.forEach(h => {
      const lh = h.toLowerCase()
      if (lh.includes('nome') || lh.includes('name')) mapping[h] = 'nome'
      else if (lh.includes('email') || lh.includes('e-mail')) mapping[h] = 'email'
      else if (lh.includes('cel') || lh.includes('phone') || lh.includes('telefone')) mapping[h] = 'celular'
      else if (lh.includes('idade') || lh.includes('age')) mapping[h] = 'idade'
      else if (lh.includes('plano') || lh.includes('status')) mapping[h] = 'statusPlano'
      else mapping[h] = 'ignorar'
    })
    setCsvPreview({ headers, rows, mapping })
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => parseCSV(String(e.target?.result ?? ''))
    reader.readAsText(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const confirmImport = () => {
    if (!csvPreview) return
    const { headers, rows, mapping } = csvPreview
    const colIndex: Record<string, number> = {}
    headers.forEach((h, i) => {
      const target = mapping[h]
      if (target && target !== 'ignorar' && colIndex[target] === undefined) colIndex[target] = i
    })
    let imported = 0; let skipped = 0
    rows.forEach(row => {
      const nome = colIndex.nome !== undefined ? row[colIndex.nome]?.trim() : ''
      const email = colIndex.email !== undefined ? row[colIndex.email]?.trim() : ''
      const celular = colIndex.celular !== undefined ? row[colIndex.celular]?.trim() : ''
      const idadeStr = colIndex.idade !== undefined ? row[colIndex.idade]?.trim() : ''
      const statusStr = colIndex.statusPlano !== undefined ? row[colIndex.statusPlano]?.trim() : ''
      if (!nome || !email) { skipped++; return }
      const idadeNum = Number(idadeStr)
      const statusPlano: 'Ativo' | 'Inativo' = statusStr?.toLowerCase().startsWith('in') ? 'Inativo' : 'Ativo'
      addUsuario({ nome, email, celular: celular || '', idade: Number.isFinite(idadeNum) && idadeNum > 0 ? idadeNum : 18, statusPlano, role: 'aluno' })
      imported++
    })
    showToast(`${imported} ${imported === 1 ? 'aluno importado' : 'alunos importados'}${skipped > 0 ? ` (${skipped} ignorados)` : ''}.`, 'success')
    setCsvPreview(null)
  }

  return (
    <div className="page-container pt-4 md:pt-5 pb-6 space-y-4">
      {/* Header with action buttons */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Usuários</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Cadastro e gerenciamento de alunos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="ios-btn-gray"
          >
            <Upload size={13} /> Importar CSV
          </button>
          <button onClick={() => setOpenNew(true)} className="ios-btn-primary">
            <Plus size={14} strokeWidth={2.6} /> Novo aluno
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            hidden
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Compact stats pills */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: totalAlunos, color: '#5E6AD2' },
          { label: 'Ativos', value: ativos, color: '#34C759' },
          { label: 'Inativos', value: totalAlunos - ativos, color: '#FF3B30' },
          { label: 'Busca', value: alunos.length, color: '#FF9500' },
        ].map(s => (
          <div key={s.label} className="ios-card p-3 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-ios flex items-center justify-center shrink-0 text-white"
              style={{
                background: `linear-gradient(135deg, ${s.color} 0%, ${s.color}CC 100%)`,
                boxShadow: `0 3px 8px ${s.color}44, inset 0 0 0 0.5px rgba(255,255,255,0.22)`,
              }}
            >
              <Users size={13} />
            </div>
            <div className="min-w-0">
              <p className="text-footnote font-bold text-ios-label dark:text-ios-dlabel tabular-nums leading-none">
                {s.value}
              </p>
              <p className="text-caption2 font-medium text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5 truncate">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone + Search in a single row */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative transition-all ${drag ? 'ring-2 ring-tint-500 rounded-ios-md' : ''}`}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-label-3 dark:text-ios-dlabel-3 pointer-events-none" size={15} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={drag ? 'Solte o arquivo CSV aqui para importar…' : 'Buscar por nome, email ou celular — ou arraste um CSV'}
          className="ios-input !pl-11 !rounded-ios-md"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block ios-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-footnote">
            <thead>
              <tr className="hairline-b">
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Aluno</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Idade</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Celular</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Email</th>
                <th className="px-5 py-2.5 text-left text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3">Plano</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`hover:bg-ios-fill-3 dark:hover:bg-white/5 transition-colors ${idx > 0 ? 'hairline-b' : ''}`}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.nome} size="sm" />
                      <span className="text-callout font-semibold text-ios-label dark:text-ios-dlabel">
                        {u.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-footnote text-ios-label-2 dark:text-ios-dlabel-2 tabular-nums">{u.idade}</td>
                  <td className="px-5 py-2.5 text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 font-mono">{u.celular}</td>
                  <td className="px-5 py-2.5 text-footnote text-ios-label-2 dark:text-ios-dlabel-2">{u.email}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption1 font-semibold ${
                      u.statusPlano === 'Ativo'
                        ? 'bg-sys-green/12 text-sys-green'
                        : 'bg-sys-red/12 text-sys-red'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.statusPlano === 'Ativo' ? 'bg-sys-green' : 'bg-sys-red'}`} />
                      {u.statusPlano}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {alunos.map(u => (
          <div key={u.id} className="ios-card p-4 flex items-center gap-3">
            <Avatar name={u.nome} />
            <div className="flex-1 min-w-0">
              <p className="text-callout font-semibold text-ios-label dark:text-ios-dlabel truncate">
                {u.nome}
              </p>
              <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 truncate">{u.email}</p>
              <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 font-mono">{u.celular}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption2 font-bold shrink-0 ${
              u.statusPlano === 'Ativo'
                ? 'bg-sys-green/12 text-sys-green'
                : 'bg-sys-red/12 text-sys-red'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${u.statusPlano === 'Ativo' ? 'bg-sys-green' : 'bg-sys-red'}`} />
              {u.statusPlano}
            </span>
          </div>
        ))}
      </div>

      {/* New user modal */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo aluno" footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setOpenNew(false)} className="ios-btn-gray">Cancelar</button>
          <button onClick={submit} className="ios-btn-primary">Cadastrar</button>
        </div>
      }>
        <div className="space-y-3">
          <Field label="Nome completo">
            <TextInput value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade">
              <TextInput type="number" value={String(form.idade)} onChange={v => setForm(f => ({ ...f, idade: Number(v) }))} />
            </Field>
            <Field label="Celular">
              <TextInput value={form.celular} onChange={v => setForm(f => ({ ...f, celular: v }))} placeholder="(41) 9 0000-0000" />
            </Field>
          </div>
          <Field label="Email">
            <TextInput type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          </Field>
          <Field label="Status do plano">
            <select
              value={form.statusPlano}
              onChange={e => setForm(f => ({ ...f, statusPlano: e.target.value as 'Ativo' | 'Inativo' }))}
              className="ios-input"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </Field>
        </div>
      </Modal>

      {/* CSV preview modal */}
      <Modal open={!!csvPreview} onClose={() => setCsvPreview(null)} title="Importação de CSV" size="xl" footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setCsvPreview(null)} className="ios-btn-gray">Cancelar</button>
          <button onClick={confirmImport} className="ios-btn-primary">
            <Check size={14} /> Confirmar importação
          </button>
        </div>
      }>
        {csvPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-ios bg-tint-500/10 text-tint-700 dark:text-tint-300 text-footnote">
              <Sparkles size={13} /> A IA identificou automaticamente as colunas. Ajuste se necessário.
            </div>
            <div>
              <p className="text-caption2 uppercase tracking-wider font-semibold text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
                Mapeamento de colunas
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {csvPreview.headers.map(h => (
                  <div key={h} className="flex items-center gap-2 p-3 ios-fill-3 rounded-ios">
                    <FileText size={13} className="text-ios-label-3 dark:text-ios-dlabel-3 shrink-0" />
                    <span className="text-footnote font-medium text-ios-label dark:text-ios-dlabel flex-1 truncate">
                      {h}
                    </span>
                    <select
                      value={csvPreview.mapping[h]}
                      onChange={e => setCsvPreview(p => p ? { ...p, mapping: { ...p.mapping, [h]: e.target.value } } : p)}
                      className="text-caption1 bg-white dark:bg-ios-dbg-tert rounded-ios-sm px-2 py-1 text-ios-label dark:text-ios-dlabel focus:outline-none"
                      style={{ boxShadow: 'inset 0 0 0 0.5px rgba(60,60,67,0.18)' }}
                    >
                      <option value="nome">Nome</option>
                      <option value="email">Email</option>
                      <option value="celular">Celular</option>
                      <option value="idade">Idade</option>
                      <option value="statusPlano">Plano</option>
                      <option value="ignorar">Ignorar</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-caption2 uppercase tracking-wider font-semibold text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
                Prévia · {csvPreview.rows.length} {csvPreview.rows.length === 1 ? 'linha' : 'linhas'}
              </p>
              <div className="overflow-x-auto rounded-ios ios-fill-3 p-3 max-h-64">
                <table className="min-w-full text-caption1">
                  <thead>
                    <tr className="text-left text-ios-label-3 dark:text-ios-dlabel-3">
                      {csvPreview.headers.map(h => <th key={h} className="px-2 py-1 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.slice(0, 8).map((r, i) => (
                      <tr key={i} className={i > 0 ? 'hairline-t' : ''}>
                        {r.map((c, j) => <td key={j} className="px-2 py-1.5 text-ios-label-2 dark:text-ios-dlabel-2">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.rows.length > 8 && (
                  <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mt-2 px-2">
                    + {csvPreview.rows.length - 8} outras linhas
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-caption2 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 mb-1.5 uppercase tracking-wider px-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="ios-input"
    />
  )
}
