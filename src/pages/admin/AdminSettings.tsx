import { useState } from 'react'
import { Save, Clock, Users2, CalendarRange, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Toggle from '../../components/ui/Toggle'
import { useToast } from '../../context/ToastContext'
import type { Configuracoes } from '../../types'

const CANCEL_OPTIONS: { label: string; description: string; value: number }[] = [
  { label: 'Flexível', description: 'Sem limite', value: 0 },
  { label: '30 min', description: '30 min antes', value: 30 },
  { label: '1 hora', description: '1h antes', value: 60 },
  { label: '2 horas', description: '2h antes', value: 120 },
]

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-8 h-8 rounded-ios flex items-center justify-center text-white shrink-0"
        style={{
          background: 'linear-gradient(135deg, #5E6AD2 0%, #818CF8 100%)',
          boxShadow: '0 3px 8px rgba(94,106,210,0.26)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-footnote font-semibold text-ios-label dark:text-ios-dlabel leading-tight">{title}</h3>
        <p className="text-caption2 text-ios-label-2 dark:text-ios-dlabel-2">{subtitle}</p>
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const { data, updateConfiguracoes } = useApp()
  const { showToast } = useToast()
  const [cfg, setCfg] = useState<Configuracoes>(data.configuracoes)

  const save = () => {
    updateConfiguracoes(cfg)
    showToast('Configurações salvas.', 'success')
  }

  return (
    <div className="page-narrow pt-4 md:pt-5 pb-6">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-title2 md:text-title1 text-ios-label dark:text-ios-dlabel leading-none">Configurações</h1>
          <p className="text-caption1 text-ios-label-2 dark:text-ios-dlabel-2 mt-1">
            Regras de agendamento e fila de espera
          </p>
        </div>
        <button onClick={save} className="ios-btn-primary">
          <Save size={13} /> Salvar
        </button>
      </div>

      {/* 2-column grid on desktop — denser */}
      <div className="grid gap-3 md:grid-cols-2">

        {/* Cancellation policy */}
        <div className="ios-card p-4">
          <SectionHeader icon={<Clock size={14} />} title="Cancelamento" subtitle="Antecedência mínima" />
          <div className="grid gap-1.5 grid-cols-2">
            {CANCEL_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex flex-col gap-0.5 p-2.5 rounded-ios cursor-pointer transition-all ${
                  cfg.tempoLimiteCancelamentoMinutos === opt.value
                    ? 'bg-tint-500/10 dark:bg-tint-500/16'
                    : 'ios-fill-3 hover:ios-fill-2'
                }`}
                style={cfg.tempoLimiteCancelamentoMinutos === opt.value ? { boxShadow: 'inset 0 0 0 1.5px #5E6AD2' } : undefined}
              >
                <input
                  type="radio"
                  name="cancel"
                  checked={cfg.tempoLimiteCancelamentoMinutos === opt.value}
                  onChange={() => setCfg(c => ({ ...c, tempoLimiteCancelamentoMinutos: opt.value }))}
                  className="sr-only"
                />
                <p className={`text-footnote font-semibold ${
                  cfg.tempoLimiteCancelamentoMinutos === opt.value
                    ? 'text-tint-700 dark:text-tint-300'
                    : 'text-ios-label dark:text-ios-dlabel'
                }`}>
                  {opt.label}
                </p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3">
                  {opt.description}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Waitlist mode */}
        <div className="ios-card p-4">
          <SectionHeader icon={<Users2 size={14} />} title="Fila de espera" subtitle="Como as vagas são liberadas" />
          <div className="grid gap-1.5">
            {[
              { value: 'AUTOMATICO', label: 'Automático', desc: 'Promove o primeiro da fila' },
              { value: 'CORRIDA', label: 'Corrida', desc: 'Todos notificados, 1º a clicar leva' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setCfg(c => ({ ...c, modoFilaEspera: opt.value as 'AUTOMATICO' | 'CORRIDA' }))}
                className={`p-2.5 rounded-ios text-left transition-all ${
                  cfg.modoFilaEspera === opt.value
                    ? 'bg-tint-500/10 dark:bg-tint-500/16'
                    : 'ios-fill-3 hover:ios-fill-2'
                }`}
                style={cfg.modoFilaEspera === opt.value ? { boxShadow: 'inset 0 0 0 1.5px #5E6AD2' } : undefined}
              >
                <p className={`text-footnote font-semibold ${
                  cfg.modoFilaEspera === opt.value
                    ? 'text-tint-700 dark:text-tint-300'
                    : 'text-ios-label dark:text-ios-dlabel'
                }`}>
                  {opt.label}
                </p>
                <p className="text-caption2 text-ios-label-3 dark:text-ios-dlabel-3 mt-0.5 leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Advance days */}
        <div className="ios-card p-4">
          <SectionHeader icon={<CalendarRange size={14} />} title="Antecedência" subtitle="Dias no futuro" />
          <div className="flex items-center gap-3 px-1">
            <input
              type="range"
              min={1}
              max={30}
              value={cfg.diasAntecedenciaAgendamento}
              onChange={e => setCfg(c => ({ ...c, diasAntecedenciaAgendamento: Number(e.target.value) }))}
              className="flex-1"
            />
            <div className="w-16 text-right">
              <span className="text-title3 font-bold text-ios-label dark:text-ios-dlabel tabular-nums">
                {cfg.diasAntecedenciaAgendamento}
              </span>
              <span className="text-caption1 text-ios-label-3 dark:text-ios-dlabel-3 ml-1">
                {cfg.diasAntecedenciaAgendamento !== 1 ? 'dias' : 'dia'}
              </span>
            </div>
          </div>
        </div>

        {/* Recurrence */}
        <div className="ios-card p-4">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader icon={<RefreshCw size={14} />} title="Recorrência" subtitle="Agendamento semanal auto" />
            <Toggle checked={cfg.permiteRecorrencia} onChange={v => setCfg(c => ({ ...c, permiteRecorrencia: v }))} />
          </div>
        </div>
      </div>
    </div>
  )
}
