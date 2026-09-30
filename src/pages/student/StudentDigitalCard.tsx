import { Dumbbell, Mail, Phone, User } from 'lucide-react'
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
        <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="black" />
      ) : null)}
    </svg>
  )
}

export default function StudentDigitalCard() {
  const { currentUser } = useApp()
  if (!currentUser) return null

  const validade = new Date()
  validade.setMonth(validade.getMonth() + 3)

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Sua carteirinha</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apresente na catraca para ter acesso</p>
      </div>

      {/* Credit-card style card */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: '1.586 / 1' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white p-6 dots-pattern">
          <div className="relative h-full flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Dumbbell size={14} />
                </div>
                <span className="font-semibold text-sm tracking-tight">FitCore</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Aluno</span>
            </div>

            {/* Middle row */}
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.nome} size="lg" className="ring-2 ring-white/20" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Titular</p>
                <p className="font-semibold text-base leading-tight mt-0.5 truncate">{currentUser.nome}</p>
                <p className="font-mono text-xs text-white/70 mt-1">ID {currentUser.id.toUpperCase()}</p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Plano</p>
                <p className="text-sm font-medium mt-0.5">{currentUser.statusPlano}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Válido até</p>
                <p className="text-sm font-medium mt-0.5">{validade.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR access */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white p-1.5 shadow-sm">
          <QRPattern text={currentUser.id} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Acesso rápido</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">Escaneie na catraca</p>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-2">
            {currentUser.id.toUpperCase()}-{Date.now().toString(36).slice(-4).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Dados de contato</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span>{currentUser.email}</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400" />
            <span>{currentUser.celular}</span>
          </li>
          <li className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span>{currentUser.idade} anos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
