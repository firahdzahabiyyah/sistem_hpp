import React from 'react'

const sizes = {
  xs: { icon: 'w-5 h-5', text: 'text-lg' },
  sm: { icon: 'w-6 h-6', text: 'text-lg' },
  md: { icon: 'w-8 h-8', text: 'text-2xl' },
  lg: { icon: 'w-10 h-10', text: 'text-3xl' },
}

export default function Logo({ size = 'sm', showText = true, dark = false, center = false }) {
  const s = sizes[size] || sizes.sm
  const strokeClass = dark ? 'text-indigo-400' : 'text-indigo-600'

  return (
    <div className={`flex items-center ${center ? 'justify-center' : ''} gap-2.5`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${s.icon} ${strokeClass}`}>
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-6" />
      </svg>
      {showText && (
        <div className="flex items-baseline gap-0">
          <span className={`font-extrabold tracking-[0.08em] ${dark ? 'text-gray-100' : 'text-gray-900'}`}
            style={{ fontFamily: "'Comfortaa', ui-sans-serif, system-ui, sans-serif" }}>
            UMKM
          </span>
          <span className={`font-light tracking-[0.08em] ${strokeClass}`}
            style={{ fontFamily: "'Comfortaa', ui-sans-serif, system-ui, sans-serif" }}>
            INVENTRA
          </span>
        </div>
      )}
    </div>
  )
}
