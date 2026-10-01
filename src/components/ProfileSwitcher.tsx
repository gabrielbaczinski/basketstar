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
      <div className="inline-flex items-center ios-glass-heavy rounded-full p-0.5 shadow-ios-2">
        {(['aluno', 'admin'] as const).map(v => (
          <button
            key={v}
            onClick={() => set(v)}
            className={`text-caption1 font-semibold px-3.5 py-1 rounded-full transition-all duration-150 ${
              activeView === v
                ? 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel shadow-ios-1'
                : 'text-ios-label-2 dark:text-ios-dlabel-2'
            }`}
          >
            {v === 'aluno' ? 'Aluno' : 'Admin'}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center ios-fill-2 rounded-full p-0.5">
      {(['aluno', 'admin'] as const).map(v => (
        <button
          key={v}
          onClick={() => set(v)}
          className={`text-caption1 font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150 ${
            activeView === v
              ? 'bg-white dark:bg-ios-dbg-tert text-ios-label dark:text-ios-dlabel shadow-ios-1'
              : 'text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel'
          }`}
        >
          {v === 'aluno' ? 'Aluno' : 'Admin'}
        </button>
      ))}
    </div>
  )
}
