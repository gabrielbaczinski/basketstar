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
        className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-sys-green' : 'bg-ios-fill-1 dark:bg-ios-dfill-1'
        }`}
      >
        <span
          className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white transition-transform duration-200 ease-out ${
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
          style={{ boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)' }}
        />
      </button>
      {label && <span className="text-callout text-ios-label dark:text-ios-dlabel select-none">{label}</span>}
    </label>
  )
}
