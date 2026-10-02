import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail, Phone, Calendar, User as UserIcon, CreditCard, KeyRound,
  Bell, HelpCircle, LogOut, Moon, Sun, ChevronRight, RotateCcw, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'

export default function StudentProfile() {
  const { currentUser, logout, isDark, toggleDark, resetDemo, brandColor, setBrandColor } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [resetConfirm, setResetConfirm] = useState(false)
  if (!currentUser) return null

  const isAtivo = currentUser.statusPlano === 'Ativo'
  const doLogout = () => { logout(); navigate('/') }

  return (
    <div className="page-narrow pt-4 md:pt-5 pb-6">
      {/* Hero header */}
      <div className="flex flex-col items-center text-center mb-5 pt-2">
        <div className="relative mb-3">
          <Avatar name={currentUser.nome} size="2xl" />
          <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ring-2 ring-white dark:ring-ios-dbg flex items-center justify-center ${isAtivo ? 'bg-sys-green' : 'bg-sys-red'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
          </span>
        </div>
        <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">
          {currentUser.nome}
        </h1>
        <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1.5">
          {currentUser.email}
        </p>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption1 font-semibold ${
            isAtivo ? 'bg-sys-green/14 text-sys-green' : 'bg-sys-red/14 text-sys-red'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? 'bg-sys-green' : 'bg-sys-red'}`} />
          Plano {currentUser.statusPlano}
        </span>
      </div>

      {/* Highlighted: Carteirinha */}
      <Link
        to="/carteirinha"
        className="ios-card flex items-center gap-3 p-4 mb-4 transition-shadow hover:shadow-ios-3"
      >
        <div
          className="w-11 h-11 rounded-ios flex items-center justify-center text-white shrink-0"
          style={{ background: 'var(--brand)' }}
        >
          <CreditCard size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel">Carteirinha digital</p>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-0.5">
            Apresente na catraca para acesso
          </p>
        </div>
        <ChevronRight size={16} className="text-ios-label-3 dark:text-ios-dlabel-3 shrink-0" />
      </Link>

      {/* Informações pessoais */}
      <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
        Informações pessoais
      </p>
      <div className="ios-card-flat overflow-hidden mb-4">
        <InfoRow icon={<Mail size={14} />} label="Email" value={currentUser.email} />
        <InfoRow icon={<Phone size={14} />} label="Celular" value={currentUser.celular} mono />
        <InfoRow icon={<Calendar size={14} />} label="Idade" value={`${currentUser.idade} anos`} />
        <InfoRow icon={<UserIcon size={14} />} label="Membro desde" value="—" />
      </div>

      {/* Cor do sistema */}
      <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
        Personalização
      </p>
      <div className="ios-card p-4 mb-4">
        <p className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel mb-1">Cor do sistema</p>
        <p className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 mb-3">Altera botões, bordas e destaques em todo o app.</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Laranja', value: '#E55A2B' },
            { label: 'Azul',   value: '#007AFF' },
            { label: 'Roxo',   value: '#5E6AD2' },
            { label: 'Verde',  value: '#0CA679' },
            { label: 'Rosa',   value: '#FF2D55' },
            { label: 'Cinza',  value: '#6C6C70' },
          ].map(c => (
            <button
              key={c.value}
              onClick={() => setBrandColor(c.value)}
              title={c.label}
              className="w-8 h-8 rounded-full transition-all active:scale-90 shrink-0"
              style={{
                background: c.value,
                boxShadow: brandColor === c.value
                  ? `0 0 0 2px white, 0 0 0 4px ${c.value}`
                  : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Preferências */}
      <p className="text-caption2 font-semibold uppercase tracking-wider text-ios-label-3 dark:text-ios-dlabel-3 mb-2 px-1">
        Preferências
      </p>
      <div className="ios-card-flat overflow-hidden mb-4">
        <RowButton
          icon={isDark ? <Sun size={14} /> : <Moon size={14} />}
          label={isDark ? 'Tema claro' : 'Tema escuro'}
          onClick={toggleDark}
        />
        <RowButton
          icon={<Bell size={14} />}
          label="Notificações"
          onClick={() => showToast('Em breve.', 'info')}
        />
        <RowButton
          icon={<KeyRound size={14} />}
          label="Trocar senha"
          onClick={() => showToast('Em breve.', 'info')}
        />
        <RowButton
          icon={<HelpCircle size={14} />}
          label="Ajuda"
          onClick={() => showToast('Use o botão de ajuda flutuante.', 'info')}
        />
      </div>

      {/* Dev tools */}
      {import.meta.env.DEV && (
        <div className="ios-card-flat overflow-hidden mb-4">
          <RowButton
            icon={<RotateCcw size={14} />}
            label="Resetar dados demo"
            onClick={() => setResetConfirm(true)}
          />
        </div>
      )}

      {resetConfirm && (
        <Modal
          open
          onClose={() => setResetConfirm(false)}
          title="Resetar dados demo"
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={() => setResetConfirm(false)} className="ios-btn-gray">Cancelar</button>
              <button
                onClick={() => { resetDemo(); showToast('Dados demo restaurados.', 'success'); setResetConfirm(false) }}
                className="bg-sys-red text-white text-footnote font-semibold px-4 py-2 rounded-full transition-colors hover:brightness-110"
              >
                Resetar
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sys-orange/14 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-sys-orange" />
            </div>
            <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">
              Todos os dados serão restaurados para o estado inicial. Você será desconectado. Esta ação não pode ser desfeita.
            </p>
          </div>
        </Modal>
      )}

      {/* Logout */}
      <button
        onClick={doLogout}
        className="w-full ios-card-flat flex items-center justify-center gap-2 py-3 text-footnote font-semibold text-sys-red hover:bg-sys-red/5 transition-colors"
      >
        <LogOut size={14} /> Sair
      </button>

      <p className="text-caption2 text-ios-label-4 dark:text-ios-dlabel-4 text-center mt-4">
        FitCore &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}

function InfoRow({
  icon, label, value, mono,
}: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean
}) {
  return (
    <div className="ios-list-row flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px]">
      <span className="w-7 h-7 rounded-full ios-fill-1 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 shrink-0">
        {icon}
      </span>
      <span className="text-footnote text-ios-label dark:text-ios-dlabel flex-1 min-w-0">{label}</span>
      <span className={`text-footnote font-medium truncate text-ios-label-2 dark:text-ios-dlabel-2 ${mono ? 'font-mono tabular-nums' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function RowButton({
  icon, label, onClick,
}: {
  icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="ios-list-row w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] text-left hover:bg-ios-fill-3 dark:hover:bg-white/5 transition-colors"
    >
      <span className="w-7 h-7 rounded-full ios-fill-1 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 shrink-0">
        {icon}
      </span>
      <span className="text-footnote font-medium text-ios-label dark:text-ios-dlabel flex-1">{label}</span>
      <ChevronRight size={14} className="text-ios-label-3 dark:text-ios-dlabel-3 shrink-0" />
    </button>
  )
}
