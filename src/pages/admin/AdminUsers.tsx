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

const INPUT_CLS = 'w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow'

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
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Usuários</h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Cadastro e gerenciamento de alunos</p>
        </div>
        <button onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
          <Plus size={14} /> Novo aluno
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de alunos', value: totalAlunos, color: '#5E6AD2' },
          { label: 'Planos ativos', value: ativos, color: '#059669' },
          { label: 'Inativos', value: totalAlunos - ativos, color: '#DC2626' },
          { label: 'Resultado busca', value: alunos.length, color: '#D97706' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}18` }}>
              <Users size={14} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{s.value}</p>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Import */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5 text-center cursor-pointer transition-all ${
          drag ? 'shadow-[0_0_0_2px_#5E6AD2]' : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1E]'
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-9 h-9 rounded-xl bg-[#EEF0FD] dark:bg-[#1F2545] text-[#5E6AD2] flex items-center justify-center mb-1">
            <Upload size={16} />
          </div>
          <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Arraste um CSV ou clique para importar</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 inline-flex items-center gap-1">
            <Sparkles size={11} /> Mapeamento automático de colunas
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nome, email ou celular…"
          className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1A1A1E] rounded-xl text-[13px] text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="shadow-[0_1px_0_0_#F1F5F9] dark:shadow-[0_1px_0_0_#1A1A1E]">
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Aluno</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Idade</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Celular</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Plano</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((u, idx) => (
                <tr key={u.id} className={`hover:bg-[#FAFAFA] dark:hover:bg-[#1A1A1E] transition-colors ${idx > 0 ? 'shadow-[0_-1px_0_0_#F1F5F9] dark:shadow-[0_-1px_0_0_#1A1A1E]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.nome} size="sm" />
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400">{u.idade}</td>
                  <td className="px-5 py-3.5 text-[12px] text-gray-500 dark:text-gray-400 font-mono">{u.celular}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      u.statusPlano === 'Ativo'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${u.statusPlano === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
          <div key={u.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4 flex items-center gap-3">
            <Avatar name={u.nome} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{u.nome}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{u.celular}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
              u.statusPlano === 'Ativo'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-1 h-1 rounded-full ${u.statusPlano === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {u.statusPlano}
            </span>
          </div>
        ))}
      </div>

      {/* New user modal */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo aluno" footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setOpenNew(false)}
            className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={submit}
            className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Cadastrar
          </button>
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
            <select value={form.statusPlano} onChange={e => setForm(f => ({ ...f, statusPlano: e.target.value as 'Ativo' | 'Inativo' }))}
              className={INPUT_CLS}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </Field>
        </div>
      </Modal>

      {/* CSV preview modal */}
      <Modal open={!!csvPreview} onClose={() => setCsvPreview(null)} title="Importação de CSV" size="xl" footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setCsvPreview(null)}
            className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={confirmImport}
            className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors">
            <Check size={14} /> Confirmar importação
          </button>
        </div>
      }>
        {csvPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] text-[#3730A3] dark:text-[#818CF8] text-[13px]">
              <Sparkles size={13} /> A IA identificou automaticamente as colunas. Ajuste se necessário.
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">Mapeamento de colunas</p>
              <div className="grid gap-2 md:grid-cols-2">
                {csvPreview.headers.map(h => (
                  <div key={h} className="flex items-center gap-2 p-2.5 bg-[#F9F9FB] dark:bg-[#0D0D0F] rounded-lg">
                    <FileText size={13} className="text-gray-400 shrink-0" />
                    <span className="text-[13px] font-medium text-gray-900 dark:text-white flex-1 truncate">{h}</span>
                    <select value={csvPreview.mapping[h]}
                      onChange={e => setCsvPreview(p => p ? { ...p, mapping: { ...p.mapping, [h]: e.target.value } } : p)}
                      className="text-xs bg-white dark:bg-[#1A1A1E] rounded-md px-2 py-1 text-gray-800 dark:text-gray-100 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:outline-none">
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
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">
                Prévia · {csvPreview.rows.length} {csvPreview.rows.length === 1 ? 'linha' : 'linhas'}
              </p>
              <div className="overflow-x-auto rounded-lg bg-[#F9F9FB] dark:bg-[#0D0D0F] p-3 max-h-64">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 dark:text-gray-500">
                      {csvPreview.headers.map(h => <th key={h} className="px-2 py-1 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.slice(0, 8).map((r, i) => (
                      <tr key={i} className={i > 0 ? 'shadow-[0_-1px_0_0_#E5E7EB] dark:shadow-[0_-1px_0_0_#1F2937]' : ''}>
                        {r.map((c, j) => <td key={j} className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.rows.length > 8 && (
                  <p className="text-xs text-gray-400 mt-2 px-2">+ {csvPreview.rows.length - 8} outras linhas</p>
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
      <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      className="w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow" />
  )
}
