import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-[#5E6AD2]' : 'bg-gray-300 dark:bg-[#2A2A30]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && <span className="text-sm text-gray-700 dark:text-gray-300 select-none">{label}</span>}
    </label>
  )
}
