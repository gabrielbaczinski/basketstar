import { useState } from 'react'
import { Save, Clock, Users2, CalendarRange, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Toggle from '../../components/ui/Toggle'
import { useToast } from '../../context/ToastContext'
import type { Configuracoes } from '../../types'

const CANCEL_OPTIONS: { label: string; description: string; value: number }[] = [
  { label: 'Flexível', description: 'Sem limite de antecedência', value: 0 },
  { label: '30 minutos', description: 'Mínimo de 30 min antes', value: 30 },
  { label: '1 hora', description: 'Mínimo de 1h antes', value: 60 },
  { label: '2 horas', description: 'Mínimo de 2h antes', value: 120 },
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
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Regras de agendamento e fila de espera</p>
      </div>

      {/* Cancellation policy */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <Clock size={13} className="text-[#5E6AD2]" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Política de cancelamento</h3>
        </div>
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-4 ml-9">Antecedência mínima para cancelar sem penalidade</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CANCEL_OPTIONS.map(opt => (
            <label key={opt.value}
              className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all ${
                cfg.tempoLimiteCancelamentoMinutos === opt.value
                  ? 'bg-[#EEF0FD] dark:bg-[#1F2545] shadow-[0_0_0_1.5px_#5E6AD2]'
                  : 'bg-[#F9F9FB] dark:bg-[#0D0D0F] hover:bg-gray-100 dark:hover:bg-[#1A1A1E]'
              }`}>
              <input type="radio" name="cancel"
                checked={cfg.tempoLimiteCancelamentoMinutos === opt.value}
                onChange={() => setCfg(c => ({ ...c, tempoLimiteCancelamentoMinutos: opt.value }))}
                className="mt-0.5 w-4 h-4 accent-[#5E6AD2] shrink-0" />
              <div>
                <p className={`text-[13px] font-semibold ${cfg.tempoLimiteCancelamentoMinutos === opt.value ? 'text-[#3730A3] dark:text-[#818CF8]' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Waitlist mode */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <Users2 size={13} className="text-[#5E6AD2]" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Modo da fila de espera</h3>
        </div>
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-4 ml-9">Como as vagas são liberadas quando alguém cancela</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: 'AUTOMATICO', label: 'Automático', desc: 'Promove o primeiro da fila sem intervenção' },
            { value: 'CORRIDA', label: 'Corrida', desc: 'Todos são notificados, primeiro a clicar leva' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setCfg(c => ({ ...c, modoFilaEspera: opt.value as 'AUTOMATICO' | 'CORRIDA' }))}
              className={`p-4 rounded-xl text-left transition-all ${
                cfg.modoFilaEspera === opt.value
                  ? 'bg-[#EEF0FD] dark:bg-[#1F2545] shadow-[0_0_0_1.5px_#5E6AD2]'
                  : 'bg-[#F9F9FB] dark:bg-[#0D0D0F] hover:bg-gray-100 dark:hover:bg-[#1A1A1E]'
              }`}>
              <p className={`text-[13px] font-semibold ${cfg.modoFilaEspera === opt.value ? 'text-[#3730A3] dark:text-[#818CF8]' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advance days */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center">
            <CalendarRange size={13} className="text-[#5E6AD2]" />
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Antecedência para agendamento</h3>
        </div>
        <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-5 ml-9">Quantos dias no futuro o aluno pode agendar</p>
        <div className="flex items-center gap-4 px-1">
          <input type="range" min={1} max={30} value={cfg.diasAntecedenciaAgendamento}
            onChange={e => setCfg(c => ({ ...c, diasAntecedenciaAgendamento: Number(e.target.value) }))}
            className="flex-1 accent-[#5E6AD2]" />
          <div className="w-20 text-right">
            <span className="text-[16px] font-bold text-gray-900 dark:text-white tabular-nums">{cfg.diasAntecedenciaAgendamento}</span>
            <span className="text-[12px] text-gray-400 dark:text-gray-500 ml-1">{cfg.diasAntecedenciaAgendamento !== 1 ? 'dias' : 'dia'}</span>
          </div>
        </div>
      </div>

      {/* Recurrence */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] dark:bg-[#1F2545] flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw size={13} className="text-[#5E6AD2]" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Permitir recorrência</h3>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">Alunos podem agendar aulas semanais recorrentes automaticamente</p>
            </div>
          </div>
          <Toggle checked={cfg.permiteRecorrencia} onChange={v => setCfg(c => ({ ...c, permiteRecorrencia: v }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save}
          className="inline-flex items-center gap-1.5 bg-[#5E6AD2] hover:bg-[#4B55B8] active:scale-95 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-all">
          <Save size={13} /> Salvar configurações
        </button>
      </div>
    </div>
  )
}
