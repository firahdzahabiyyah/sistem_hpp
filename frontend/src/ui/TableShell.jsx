import React from 'react'

export default function TableShell({ children, toolbar, title, empty }) {
  return (
    <div className="card overflow-hidden">
      {(title || toolbar) && (
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {toolbar && <div className="flex items-center gap-2 flex-shrink-0">{toolbar}</div>}
        </div>
      )}
      <div className="overflow-x-auto scrollbar-thin">
        {children ? (
          <table className="w-full text-sm">{children}</table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium text-slate-400">{empty || 'Belum ada data'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
