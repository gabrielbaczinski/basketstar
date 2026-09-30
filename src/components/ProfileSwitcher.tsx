import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

interface Props { mobile?: boolean }

export default function ProfileSwitcher({ mobile }: Props) {
  const { activeView, setActiveView, currentUser } = useApp()
  const navigate = useNavigate()

  if (currentUser?.role !== 'admin') return null

  const set = (v: 'aluno' | 'admin') => {
    setActiveView(v)
    navigate('/')
  }

  if (mobile) {
    return (
      <div className="inline-flex items-center bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full p-0.5">
        <button
          onClick={() => set('aluno')}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all ${
            activeView === 'aluno'
              ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Aluno
        </button>
        <button
          onClick={() => set('admin')}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all ${
            activeView === 'admin'
              ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Admin
        </button>
      </div>
    )
  }

  const baseCls = 'text-xs font-medium px-3 py-1.5 rounded-md transition-colors'
  const activeCls = 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white'
  const inactiveCls = 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'

  return (
    <div className="inline-flex gap-1">
      <button onClick={() => set('aluno')} className={`${baseCls} ${activeView === 'aluno' ? activeCls : inactiveCls}`}>
        Aluno
      </button>
      <button onClick={() => set('admin')} className={`${baseCls} ${activeView === 'admin' ? activeCls : inactiveCls}`}>
        Admin
      </button>
    </div>
  )
}
