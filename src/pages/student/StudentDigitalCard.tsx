import { Dumbbell, Mail, Phone, User, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/ui/Avatar'

function QRPattern({ text }: { text: string }) {
  const size = 21
  const cells: boolean[] = []
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 131 + text.charCodeAt(i)) >>> 0
  for (let i = 0; i < size * size; i++) {
    seed = (1103515245 * seed + 12345) >>> 0
    cells.push((seed & 1) === 1)
  }
  const setBlock = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      const inner = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)
      cells[(r + dr) * size + (c + dc)] = inner
    }
  }
  setBlock(0, 0); setBlock(0, size - 7); setBlock(size - 7, 0)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => on ? (
        <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="#111" />
      ) : null)}
    </svg>
  )
}

export default function StudentDigitalCard() {
  const { currentUser } = useApp()
  if (!currentUser) return null

  const validade = new Date()
  validade.setMonth(validade.getMonth() + 3)
  const isAtivo = currentUser.statusPlano === 'Ativo'

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Carteirinha</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Apresente na entrada para ter acesso</p>
      </div>

      {/* ── Premium card ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1.586 / 1' }}>
        {/* Gradient background — vibrant indigo, visible in both themes */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#3730A3] to-[#4F46E5]" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 dots-pattern opacity-40" />
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]" />

        <div className="relative h-full flex flex-col justify-between p-5 text-white">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <Dumbbell size={15} className="text-white" />
              </div>
              <span className="font-bold text-[15px] tracking-tight">FitCore</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] uppercase tracking-[0.15em] text-white/60 font-medium">Membro</span>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isAtivo ? 'bg-emerald-400/25 text-emerald-200 ring-1 ring-emerald-400/30' : 'bg-red-400/25 text-red-200 ring-1 ring-red-400/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {currentUser.statusPlano}
              </div>
            </div>
          </div>

          {/* Middle row — avatar + name */}
          <div className="flex items-center gap-3.5">
            <Avatar name={currentUser.nome} size="lg" className="ring-2 ring-white/30 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/55 font-medium mb-0.5">Titular</p>
              <p className="font-bold text-[16px] leading-tight truncate">{currentUser.nome}</p>
              <p className="font-mono text-[11px] text-white/50 mt-0.5 tracking-wider">
                #{currentUser.id.toUpperCase().slice(-8)}
              </p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] text-white/55 font-medium">Plano</p>
              <p className="text-[13px] font-semibold mt-0.5">{currentUser.statusPlano}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.12em] text-white/55 font-medium">Válido até</p>
              <p className="text-[13px] font-semibold mt-0.5">
                {validade.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── QR Code ── */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4 flex items-center gap-4">
        <div className="w-[88px] h-[88px] shrink-0 rounded-lg overflow-hidden bg-white p-2 shadow-[0_0_0_1px_#E5E7EB] dark:shadow-[0_0_0_1px_#2A2A30]">
          <QRPattern text={currentUser.id} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={12} className="text-[#5E6AD2]" />
            <p className="text-[11px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Acesso rápido</p>
          </div>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Escaneie na catraca para registrar sua entrada.
          </p>
          <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500 mt-2 tracking-wider">
            {currentUser.id.toUpperCase()}-{Date.now().toString(36).slice(-4).toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Contact info ── */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-4">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Dados de contato</p>
        <ul className="space-y-2.5">
          <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] dark:bg-[#1F1F23] flex items-center justify-center shrink-0">
              <Mail size={13} className="text-gray-400" />
            </div>
            <span className="truncate">{currentUser.email}</span>
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] dark:bg-[#1F1F23] flex items-center justify-center shrink-0">
              <Phone size={13} className="text-gray-400" />
            </div>
            <span>{currentUser.celular}</span>
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] dark:bg-[#1F1F23] flex items-center justify-center shrink-0">
              <User size={13} className="text-gray-400" />
            </div>
            <span>{currentUser.idade} anos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
