import { useMemo, useState, useRef } from 'react'
import { Search, Plus, Upload, Sparkles, FileText, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Usuario } from '../../types'
import Badge from '../../components/ui/Badge'
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
    nome: '', idade: 18, celular: '', email: '', statusPlano: 'Ativo', role: 'aluno'
  })

  const alunos = useMemo(() => {
    const list = data.usuarios.filter(u => u.role === 'aluno')
    const term = q.trim().toLowerCase()
    if (!term) return list
    return list.filter(u => u.nome.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.celular.includes(term))
  }, [data.usuarios, q])

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
    // Keep ALL rows for actual import; preview slices later
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
    reader.onload = e => {
      const text = String(e.target?.result ?? '')
      parseCSV(text)
    }
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
    // Build column index by target field
    const colIndex: Record<string, number> = {}
    headers.forEach((h, i) => {
      const target = mapping[h]
      if (target && target !== 'ignorar' && colIndex[target] === undefined) {
        colIndex[target] = i
      }
    })

    let imported = 0
    let skipped = 0
    rows.forEach(row => {
      const nome = colIndex.nome !== undefined ? row[colIndex.nome]?.trim() : ''
      const email = colIndex.email !== undefined ? row[colIndex.email]?.trim() : ''
      const celular = colIndex.celular !== undefined ? row[colIndex.celular]?.trim() : ''
      const idadeStr = colIndex.idade !== undefined ? row[colIndex.idade]?.trim() : ''
      const statusStr = colIndex.statusPlano !== undefined ? row[colIndex.statusPlano]?.trim() : ''
      if (!nome || !email) { skipped++; return }
      const idadeNum = Number(idadeStr)
      const statusPlano: 'Ativo' | 'Inativo' = statusStr && statusStr.toLowerCase().startsWith('in') ? 'Inativo' : 'Ativo'
      addUsuario({
        nome,
        email,
        celular: celular || '',
        idade: Number.isFinite(idadeNum) && idadeNum > 0 ? idadeNum : 18,
        statusPlano,
        role: 'aluno',
      })
      imported++
    })

    const skippedMsg = skipped > 0 ? ` (${skipped} ignoradas)` : ''
    showToast(`${imported} ${imported === 1 ? 'aluno importado' : 'alunos importados'}${skippedMsg}.`, 'success')
    setCsvPreview(null)
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Usuários</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cadastro e gerenciamento de alunos</p>
        </div>
        <button
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> Novo aluno
        </button>
      </div>

      {/* CSV Import area */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5 text-center cursor-pointer transition-colors ${
          drag ? 'shadow-[0_0_0_2px_#5E6AD2]' : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1E]'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          hidden
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-8 h-8 rounded-md bg-[#EEF0FD] dark:bg-[#5E6AD2]/15 text-[#5E6AD2] flex items-center justify-center">
            <Upload size={16} />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Arraste um CSV ou clique para importar</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
            <Sparkles size={11} /> Mapeamento automático de colunas via IA
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nome, email ou celular"
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
        />
      </div>

      {/* Users table (desktop) */}
      <div className="hidden md:block bg-white dark:bg-[#111111] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-gray-400 dark:text-gray-500 tracking-wider font-medium">
                <th className="px-5 py-3 font-medium">Aluno</th>
                <th className="px-5 py-3 font-medium">Idade</th>
                <th className="px-5 py-3 font-medium">Celular</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plano</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((u, idx) => (
                <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-[#1A1A1E] transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60 dark:bg-[#141414]' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.nome} size="sm" />
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.idade}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{u.celular}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge variant={u.statusPlano === 'Ativo' ? 'success' : 'danger'}>{u.statusPlano}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-2 md:hidden">
        {alunos.map(u => (
          <div key={u.id} className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Avatar name={u.nome} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{u.celular}</p>
              </div>
              <Badge variant={u.statusPlano === 'Ativo' ? 'success' : 'danger'}>{u.statusPlano}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* New user modal */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo aluno" footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpenNew(false)}
            className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
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
              <TextInput value={form.celular} onChange={v => setForm(f => ({ ...f, celular: v }))} placeholder="(41) 90000-0000" />
            </Field>
          </div>
          <Field label="Email">
            <TextInput type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          </Field>
          <Field label="Status do plano">
            <select
              value={form.statusPlano}
              onChange={e => setForm(f => ({ ...f, statusPlano: e.target.value as 'Ativo' | 'Inativo' }))}
              className="w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
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
          <button
            onClick={() => setCsvPreview(null)}
            className="bg-[#F4F4F5] dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmImport}
            className="bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <Check size={14} /> Confirmar importação
          </button>
        </div>
      }>
        {csvPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#EEF0FD] dark:bg-[#5E6AD2]/15 text-[#5E6AD2] dark:text-[#8B95E5] text-sm">
              <Sparkles size={14} /> A IA identificou automaticamente as colunas. Ajuste se necessário.
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">Mapeamento de colunas</p>
              <div className="grid gap-2 md:grid-cols-2">
                {csvPreview.headers.map(h => (
                  <div key={h} className="flex items-center gap-2 p-2.5 bg-[#FAFAFA] dark:bg-[#0D0D0D] rounded-lg">
                    <FileText size={13} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{h}</span>
                    <select
                      value={csvPreview.mapping[h]}
                      onChange={e => setCsvPreview(p => p ? { ...p, mapping: { ...p.mapping, [h]: e.target.value } } : p)}
                      className="text-xs bg-white dark:bg-[#1A1A1E] rounded-md px-2 py-1 text-gray-800 dark:text-gray-100 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:outline-none"
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
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">
                Prévia ({csvPreview.rows.length} {csvPreview.rows.length === 1 ? 'linha' : 'linhas'})
              </p>
              <div className="overflow-x-auto rounded-lg bg-[#FAFAFA] dark:bg-[#0D0D0D] p-3 max-h-64">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 dark:text-gray-500">
                      {csvPreview.headers.map(h => <th key={h} className="px-2 py-1 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.slice(0, 8).map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => <td key={j} className="px-2 py-1 text-gray-700 dark:text-gray-300">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.rows.length > 8 && (
                  <p className="text-xs text-gray-400 mt-2 px-2">
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
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white dark:bg-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30] focus:shadow-[0_0_0_2px_#5E6AD2] outline-none transition-shadow"
    />
  )
}
