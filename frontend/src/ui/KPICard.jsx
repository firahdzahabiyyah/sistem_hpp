import React from 'react'

export default function KPICard({ title, value, delta, icon, color = 'blue' }) {
  const iconBgMap = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    violet: 'bg-violet-100 text-violet-600',
  }

  return (
    <div className="card-hover p-5 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight">{value}</p>
          {delta && (
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {delta}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBgMap[color] || iconBgMap.blue} transition-transform duration-200 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
