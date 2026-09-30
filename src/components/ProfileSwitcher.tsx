import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function ProfileSwitcher() {
  const { activeView, setActiveView, currentUser } = useApp()
  const navigate = useNavigate()

  if (currentUser?.role !== 'admin') return null

  const set = (v: 'aluno' | 'admin') => {
    setActiveView(v)
    navigate('/')
  }

  const baseCls = 'text-xs font-medium px-3 py-1.5 rounded-md transition-colors'
  const activeCls = 'bg-[#F4F4F5] dark:bg-[#1F1F23] text-gray-900 dark:text-white'
  const inactiveCls = 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'

  return (
    <div className="inline-flex gap-1">
      <button
        onClick={() => set('aluno')}
        className={`${baseCls} ${activeView === 'aluno' ? activeCls : inactiveCls}`}
      >
        Aluno
      </button>
      <button
        onClick={() => set('admin')}
        className={`${baseCls} ${activeView === 'admin' ? activeCls : inactiveCls}`}
      >
        Admin
      </button>
    </div>
  )
}
