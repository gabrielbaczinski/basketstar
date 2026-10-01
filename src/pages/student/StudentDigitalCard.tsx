import { useState } from 'react'
import { Dumbbell, Mail, Phone, Calendar, ScanLine, Share2, Download, Smartphone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'

/** Deterministic faux-QR renderer — just visual, not a real decoder */
function QRPattern({ text }: { text: string }) {
  const size = 25
  const cells: boolean[] = []
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 131 + text.charCodeAt(i)) >>> 0
  for (let i = 0; i < size * size; i++) {
    seed = (1103515245 * seed + 12345) >>> 0
    cells.push((seed & 1) === 1)
  }
  const setFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      const outer = dr === 0 || dr === 6 || dc === 0 || dc === 6
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
      cells[(r + dr) * size + (c + dc)] = outer || inner
    }
  }
  setFinder(0, 0); setFinder(0, size - 7); setFinder(size - 7, 0)
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % size} y={Math.floor(i / size)} width={1.02} height={1.02} fill="#0A0A14" /> : null,
      )}
    </svg>
  )
}

function Chip() {
  return (
    <svg viewBox="0 0 40 32" className="w-10 h-8" aria-hidden="true">
      <defs>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8E7A3" />
          <stop offset="45%" stopColor="#D4B86A" />
          <stop offset="100%" stopColor="#8A6E2E" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="39" height="31" rx="5" fill="url(#chipGrad)" stroke="rgba(0,0,0,0.15)" />
      <path
        d="M 6 11 H 15 M 6 16 H 15 M 6 21 H 15 M 25 11 H 34 M 25 16 H 34 M 25 21 H 34 M 15 6 V 26 M 25 6 V 26"
        stroke="rgba(60,45,10,0.45)"
        strokeWidth="0.9"
        fill="none"
      />
      <rect x="15" y="11" width="10" height="10" rx="1.2" fill="rgba(0,0,0,0.08)" />
    </svg>
  )
}

export default function StudentDigitalCard() {
  const { currentUser } = useApp()
  const { showToast } = useToast()
  const [flipped, setFlipped] = useState(false)
  if (!currentUser) return null

  const validade = new Date()
  validade.setMonth(validade.getMonth() + 3)
  const isAtivo = currentUser.statusPlano === 'Ativo'
  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)

  const memberId = currentUser.id.toUpperCase().slice(-8).padStart(8, '0')
  const grouped = `${memberId.slice(0, 4)} ${memberId.slice(4, 8)}`

  const handleShare = async () => {
    const text = `Minha carteirinha FitCore — #${memberId}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Carteirinha FitCore', text }) } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text)
      showToast('ID copiado para a área de transferência.', 'success')
    }
  }

  return (
    <div className="page-narrow pt-4 md:pt-5 pb-4 md:pb-5">
      {/* Compact header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Carteirinha</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">Apresente na catraca para acesso</p>
        </div>
      </div>

      {/* Desktop-only hint: carteirinha é melhor pelo celular */}
      <div className="hidden md:flex items-center gap-2.5 mb-4 px-3.5 py-2.5 bg-tint-500/10 dark:bg-tint-500/14 text-tint-700 dark:text-tint-300 text-caption1 rounded-ios-md">
        <Smartphone size={14} className="shrink-0" />
        <span className="flex-1">Esta carteirinha é usada no catraca pelo celular. Abra pelo seu smartphone para apresentar.</span>
      </div>

      {/* Grid: card + compact info side-by-side on desktop, stacked on mobile */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:items-start">

        {/* ── Card (max 360px on desktop, full on mobile) ── */}
        <div
          className="relative cursor-pointer group"
          style={{ perspective: '1600px' }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            className="relative w-full transition-transform duration-700 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              aspectRatio: '1.586 / 1',
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-ios-xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                boxShadow:
                  '0 20px 48px -14px rgba(31,37,69,0.5), 0 8px 20px -8px rgba(94,106,210,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.14)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(130% 100% at 0% 0%, #4B55B8 0%, #2F3677 45%, #1F2545 100%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background:
                    'radial-gradient(45% 60% at 100% 0%, rgba(236,72,153,0.42) 0%, transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(129,140,248,0.45) 0%, transparent 55%)',
                }}
              />
              <div className="absolute inset-0 dots-pattern opacity-50" />
              <div className="absolute inset-0 holo-shimmer" />
              <div
                className="absolute inset-0 rounded-ios-xl"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08) 100%)',
                }}
              />

              <div className="relative h-full flex flex-col justify-between p-4 text-white">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-ios flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%)',
                        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Dumbbell size={14} strokeWidth={2.2} />
                    </div>
                    <div className="leading-tight">
                      <p className="font-bold text-[13px] tracking-tight">FitCore</p>
                      <p className="text-[9px] font-medium text-white/55 uppercase tracking-[0.14em]">Membership</p>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                      isAtivo ? 'bg-emerald-400/22 text-emerald-100' : 'bg-red-400/22 text-red-100'
                    }`}
                    style={{ boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.22)' }}
                  >
                    <span className={`w-1 h-1 rounded-full animate-pulse-soft ${isAtivo ? 'bg-emerald-300' : 'bg-red-300'}`} />
                    {isAtivo ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                {/* Middle: chip */}
                <div className="flex items-end justify-between">
                  <Chip />
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/55 font-medium">Plano</p>
                    <p className="text-[11px] font-semibold mt-0.5">{currentUser.statusPlano}</p>
                  </div>
                </div>

                {/* Bottom */}
                <div>
                  <p className="font-mono text-[14px] font-semibold tracking-[0.2em] text-white/95 mb-2 tabular-nums"
                     style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    {grouped}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] uppercase tracking-[0.14em] text-white/55 font-medium">Titular</p>
                      <p className="font-semibold text-[12px] leading-tight truncate uppercase tracking-wide mt-0.5">
                        {currentUser.nome}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[8px] uppercase tracking-[0.14em] text-white/55 font-medium">Válido</p>
                      <p className="text-[11px] font-semibold mt-0.5 tabular-nums">
                        {validade.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-ios-xl overflow-hidden"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                boxShadow: '0 20px 48px -14px rgba(31,37,69,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.14)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(100% 100% at 50% 0%, #2F3677 0%, #1F2545 60%, #0D1030 100%)',
                }}
              />
              <div className="absolute inset-0 dots-pattern opacity-40" />
              <div className="absolute left-0 right-0 top-4 h-8 bg-black/60" />
              <div className="relative h-full flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-ios-md p-2 shadow-ios-3">
                  <div className="w-24 h-24">
                    <QRPattern text={currentUser.id} />
                  </div>
                </div>
                <p className="text-white/70 text-caption2 mt-2 font-mono tracking-wider">#{memberId}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 mt-2">
            Toque no cartão para virar
          </p>
        </div>

        {/* ── Right column (desktop) / below (mobile) ── */}
        <div className="min-w-0 space-y-3">

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFlipped(f => !f)}
              className="ios-card-flat flex items-center justify-center gap-2 py-2.5 text-caption1 font-semibold text-tint-600 dark:text-tint-300 transition-colors active:scale-[0.98]"
            >
              <ScanLine size={14} /> {flipped ? 'Ver frente' : 'Ver QR'}
            </button>
            <button
              onClick={handleShare}
              className="ios-card-flat flex items-center justify-center gap-2 py-2.5 text-caption1 font-semibold text-tint-600 dark:text-tint-300 transition-colors active:scale-[0.98]"
            >
              <Share2 size={14} /> Compartilhar
            </button>
          </div>

          {/* Contact info — compact */}
          <div>
            <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-1.5 px-1">
              Pessoal
            </p>
            <div className="ios-card-flat overflow-hidden">
              <InfoRow icon={<Mail size={13} />} label="Email" value={currentUser.email} />
              <InfoRow icon={<Phone size={13} />} label="Celular" value={currentUser.celular} mono />
              <InfoRow icon={<Calendar size={13} />} label="Idade" value={`${currentUser.idade} anos`} />
            </div>
          </div>

          {/* Membership — compact */}
          <div>
            <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-1.5 px-1">
              Associação
            </p>
            <div className="ios-card-flat overflow-hidden">
              <InfoRow label="Membro desde" value={since.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} />
              <InfoRow label="Vencimento" value={validade.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} highlight={isAtivo ? 'green' : 'red'} />
              <InfoRow label="ID" value={memberId} mono />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">
            <Download size={11} />
            <span>Disponível offline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon, label, value, mono, highlight,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  mono?: boolean
  highlight?: 'green' | 'red'
}) {
  const valCls = highlight === 'green'
    ? 'text-sys-green'
    : highlight === 'red'
      ? 'text-sys-red'
      : 'text-ios-label dark:text-ios-dlabel'

  return (
    <div className="ios-list-row flex items-center gap-2.5 px-3.5 py-2 min-h-[40px]">
      {icon && (
        <span className="w-6 h-6 rounded-full ios-fill-1 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 shrink-0">
          {icon}
        </span>
      )}
      <span className="text-footnote text-ios-label dark:text-ios-dlabel flex-1 min-w-0">{label}</span>
      <span className={`text-footnote font-semibold truncate ${mono ? 'font-mono tabular-nums' : ''} ${valCls}`}>
        {value}
      </span>
    </div>
  )
}
