import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Toggle from '../../components/ui/Toggle'
import { useToast } from '../../context/ToastContext'
import type { Configuracoes } from '../../types'

const CANCEL_OPTIONS: { label: string; value: number }[] = [
  { label: 'Flexível (sem limite)', value: 0 },
  { label: '30 minutos antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 }
]

export default function AdminSettings() {
  const { data, updateConfiguracoes } = useApp()
  const { showToast } = useToast()
  const [cfg, setCfg] = useState<Configuracoes>(data.configuracoes)

  const save = () => {
    updateConfiguracoes(cfg)
    showToast('Configurações salvas.', 'success')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Regras de agendamento e fila de espera</p>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Política de cancelamento</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Tempo mínimo de antecedência para cancelar uma aula sem penalidade</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CANCEL_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                cfg.tempoLimiteCancelamentoMinutos === opt.value
                  ? 'bg-[#EEF0FD] dark:bg-[#5E6AD2]/15'
                  : 'bg-[#FAFAFA] dark:bg-[#0D0D0D] hover:bg-gray-100 dark:hover:bg-[#1A1A1E]'
              }`}
            >
              <input
                type="radio"
                name="cancel"
                checked={cfg.tempoLimiteCancelamentoMinutos === opt.value}
                onChange={() => setCfg(c => ({ ...c, tempoLimiteCancelamentoMinutos: opt.value }))}
                className="w-4 h-4 accent-[#5E6AD2]"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Modo da fila de espera</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Como as vagas são liberadas quando alguém cancela</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => setCfg(c => ({ ...c, modoFilaEspera: 'AUTOMATICO' }))}
            className={`p-4 rounded-lg text-left transition-colors ${
              cfg.modoFilaEspera === 'AUTOMATICO'
                ? 'bg-[#EEF0FD] dark:bg-[#5E6AD2]/15'
                : 'bg-[#FAFAFA] dark:bg-[#0D0D0D] hover:bg-gray-100 dark:hover:bg-[#1A1A1E]'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Automático</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Promove o primeiro da fila automaticamente</p>
          </button>
          <button
            onClick={() => setCfg(c => ({ ...c, modoFilaEspera: 'CORRIDA' }))}
            className={`p-4 rounded-lg text-left transition-colors ${
              cfg.modoFilaEspera === 'CORRIDA'
                ? 'bg-[#EEF0FD] dark:bg-[#5E6AD2]/15'
                : 'bg-[#FAFAFA] dark:bg-[#0D0D0D] hover:bg-gray-100 dark:hover:bg-[#1A1A1E]'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Corrida</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Todos da fila são notificados. Primeiro a clicar leva.</p>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Antecedência para agendamento</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Quantos dias no futuro o aluno pode agendar</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={30}
            value={cfg.diasAntecedenciaAgendamento}
            onChange={e => setCfg(c => ({ ...c, diasAntecedenciaAgendamento: Number(e.target.value) }))}
            className="flex-1 accent-[#5E6AD2]"
          />
          <span className="w-20 text-right text-sm font-medium text-gray-900 dark:text-white">
            {cfg.diasAntecedenciaAgendamento} dia{cfg.diasAntecedenciaAgendamento !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Permitir recorrência</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Alunos podem agendar aulas semanais recorrentes automaticamente</p>
          </div>
          <Toggle checked={cfg.permiteRecorrencia} onChange={v => setCfg(c => ({ ...c, permiteRecorrencia: v }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={13} /> Salvar configurações
        </button>
      </div>
    </div>
  )
}
