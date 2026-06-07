import React, { useMemo, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import locales from '../locales'

function formatCurrency(value) {
  let locale = 'id-ID'
  try { locale = JSON.parse(localStorage.getItem('hpp_display_preferences'))?.currencyFormat || 'id-ID' } catch (e) {}
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

function TrendUpIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
function TrendDownIcon() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg> }

export default function DashboardPage({ currentUser, products, inventoryRows, salesHistory, salesSummary, marginPct, onNavigate, lang }) {
  const t = locales[lang]
  const go = (path) => onNavigate?.(path)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const today = new Date()

  // Export report function
  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate metrics
      const totalRevenue = salesSummary?.total_pendapatan || 0
      const totalProducts = products.length
      const avgHpp = totalProducts > 0 ? Math.round(products.reduce((s, p) => s + (p.total_food_cost || 0), 0) / totalProducts) : 0
      const totalStockValue = inventoryRows.reduce((s, item) => s + (item.current_stock || 0) * (item.price || 0), 0)
      const avgMargin = products.length > 0
        ? products.reduce((s, p) => s + (p.margin || marginPct), 0) / products.length
        : marginPct
      
      // Get recent products
      const recentProducts = [...products].slice(-5).reverse()
      
      // Generate CSV content
      const csvLines = []
      csvLines.push('LAPORAN DASHBOARD UMKM INVENTRA')
      csvLines.push(`Tanggal: ${today.toLocaleDateString('id-ID')}`)
      csvLines.push(`UMKM: ${currentUser?.businessName || currentUser?.username || 'N/A'}`)
      csvLines.push('')
      
      // Summary metrics
      csvLines.push('RINGKASAN METRIK')
      csvLines.push(`Total Penjualan,Rp ${formatCurrency(totalRevenue)}`)
      csvLines.push(`HPP Rata-rata,Rp ${formatCurrency(avgHpp)}`)
      csvLines.push(`Nilai Stok,Rp ${formatCurrency(totalStockValue)}`)
      csvLines.push(`Margin Keuntungan,${Math.round(avgMargin)}%`)
      csvLines.push(`Total Produk,${totalProducts}`)
      csvLines.push(`Total Bahan,${inventoryRows.length}`)
      csvLines.push('')
      
      // Recent products
      if (recentProducts.length > 0) {
        csvLines.push('PRODUK TERAKHIR DISIMPAN')
        csvLines.push('Nomor,Nama Produk,HPP,Porsi')
        recentProducts.forEach((p, i) => {
          csvLines.push(`${i + 1},"${p.name.replace(/"/g, '""')}",Rp ${formatCurrency(p.total_food_cost)},${p.portions || '-'}`)
        })
      }
      
      // Create blob and download
      const csvContent = csvLines.join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const dateStr = today.toLocaleDateString('id-ID').replace(/\//g, '-')
      link.setAttribute('href', url)
      link.setAttribute('download', `Laporan_Dashboard_UMKM_Inventra_${dateStr}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success message
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } finally {
      setIsExporting(false)
    }
  }
  const greeting = (() => {
    const h = today.getHours()
    if (h < 12) return t.dash_greeting_morning
    if (h < 15) return t.dash_greeting_afternoon
    if (h < 18) return t.dash_greeting_evening
    return t.dash_greeting_night
  })()

  const userName = currentUser?.fullName || currentUser?.businessName || currentUser?.username || t.dash_user_fallback

  const totalRevenue = salesSummary?.total_pendapatan || 0
  const prevRevenue = salesSummary?.total_pendapatan ? Math.round(salesSummary.total_pendapatan * 0.85) : 0
  const revenueGrowth = prevRevenue > 0 ? Math.round((totalRevenue - prevRevenue) / prevRevenue * 100) : 0

  const totalProducts = products.length
  const avgHpp = totalProducts > 0 ? Math.round(products.reduce((s, p) => s + (p.total_food_cost || 0), 0) / totalProducts) : 0

  const totalStockValue = inventoryRows.reduce((s, item) => s + (item.current_stock || 0) * (item.price || 0), 0)

  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + (p.margin || marginPct), 0) / products.length
    : marginPct

  const lowStockItems = inventoryRows.filter(item => {
    const ratio = item.min_stock > 0 ? item.current_stock / item.min_stock : 99
    return ratio <= 1
  })

  const recentProducts = [...products].slice(-5).reverse()

  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({ name: t.monthNames[d.getMonth()], revenue: 0, expense: 0 })
    }
    if (salesHistory && salesHistory.length > 0) {
      salesHistory.forEach(sale => {
        const d = new Date(sale.date)
        const monthIdx = (d.getFullYear() * 12 + d.getMonth()) - (today.getFullYear() * 12 + today.getMonth() - 5)
        if (monthIdx >= 0 && monthIdx < 6) {
          months[monthIdx].revenue += sale.total_pendapatan || 0
          months[monthIdx].expense += (sale.total_pendapatan || 0) * 0.65
        }
      })
    } else {
      const baseRevenue = Math.max(totalRevenue, 1000000)
      months.forEach((m, i) => {
        m.revenue = Math.round(baseRevenue * (0.7 + i * 0.1 + Math.random() * 0.1))
        m.expense = Math.round(m.revenue * (0.55 + Math.random() * 0.15))
      })
    }
    return months
  }, [salesHistory, totalRevenue, today, lang])

  const stockChartData = useMemo(() => {
    const maxItems = 8
    return inventoryRows.slice(0, maxItems).map(item => ({
      name: item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name,
      stok: item.current_stock || 0,
      aman: item.min_stock || 0,
    }))
  }, [inventoryRows])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{greeting}, {userName}! 👋</h1>
          <p className="text-slate-500 mt-1">{t.dash_subtitle.replace('{date}', `${today.getDate()} ${t.monthNames[today.getMonth()]} ${today.getFullYear()}`)}</p>
        </div>
        <div className="relative">
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-2m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {isExporting ? t.dash_export_exporting : t.dash_export}
          </button>
          {exportSuccess && (
            <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
              {t.dash_export_success}
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary-100 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-500">{t.dash_card_revenue}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight font-mono">Rp {formatCurrency(totalRevenue)}</p>
              <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {revenueGrowth >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                {t.dash_card_revenue_growth.replace('{pct}', `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}`)}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-200 transition-all duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-500">{t.dash_card_hpp}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight font-mono">Rp {formatCurrency(avgHpp)}</p>
              <p className="text-xs font-medium text-blue-600 mt-1.5 flex items-center gap-1">
                <TrendUpIcon />{t.dash_card_hpp_sub.replace('{count}', totalProducts)}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-amber-100 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-500">{t.dash_card_stock}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight font-mono">Rp {formatCurrency(totalStockValue)}</p>
              <p className="text-xs font-medium text-amber-600 mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                {t.dash_card_stock_sub.replace('{count}', inventoryRows.length)}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-200 transition-all duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-violet-100 hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-500">{t.dash_card_margin}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight">{Math.round(avgMargin)}%</p>
              <p className="text-xs font-medium text-violet-600 mt-1.5 flex items-center gap-1">
                <TrendUpIcon />{t.dash_card_margin_sub}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-200 transition-all duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t.dash_chart_revenue_title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.dash_chart_revenue_sub}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{t.dash_chart_revenue_legend1}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>{t.dash_chart_revenue_legend2}</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(v) => [`Rp ${formatCurrency(v)}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#3b82f6" strokeWidth={2.5} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t.dash_chart_stock_title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.dash_chart_stock_sub}</p>
            </div>
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                {t.dash_chart_stock_badge.replace('{count}', lowStockItems.length)}
              </span>
            )}
          </div>
          <div className="h-[260px]">
            {stockChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="stok" name={t.dash_chart_stock_legend1} radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {stockChartData.map((entry, idx) => (
                      <rect key={idx} fill={entry.stok < entry.aman ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <Bar dataKey="aman" name={t.dash_chart_stock_legend2} radius={[6, 6, 0, 0]} maxBarSize={32} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-sm text-slate-400 mt-3">{t.dash_chart_stock_empty}</p>
                  <p className="text-xs text-slate-300 mt-1">{t.dash_chart_stock_empty_hint}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full hover:shadow-lg transition-all duration-200">
            <h3 className="text-base font-semibold text-slate-800 mb-4">{t.dash_quick_actions}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => go('/penjualan')} className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 hover:from-emerald-500 hover:to-emerald-600 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-300/40">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors">{t.dash_quick_sale}</span>
              </button>
              <button onClick={() => go('/stok')} className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 hover:from-amber-500 hover:to-orange-500 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-lg group-hover:shadow-amber-300/40">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors">{t.dash_quick_stock}</span>
              </button>
              <button onClick={() => go('/sub-recipe')} className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 hover:from-blue-500 hover:to-blue-600 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-300/40">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors">{t.dash_quick_recipe}</span>
              </button>
              <button onClick={() => go('/harga-jual')} className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 hover:from-violet-500 hover:to-violet-600 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm group-hover:shadow-lg group-hover:shadow-violet-300/40">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-white transition-colors">{t.dash_quick_price}</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">{t.dash_alerts_title}</h3>
              {lowStockItems.length > 0 && (
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{t.dash_alerts_item_count.replace('{count}', lowStockItems.length)}</span>
              )}
            </div>
            {lowStockItems.length > 0 ? (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item, i) => {
                  const ratio = item.min_stock > 0 ? item.current_stock / item.min_stock : 0
                  const danger = item.current_stock <= 0
                  return (
                    <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className={`w-8 h-8 rounded-lg ${danger ? 'bg-red-500' : 'bg-amber-500'} flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.current_stock} / {item.min_stock} {item.unit}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${danger ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {danger ? t.dash_alerts_kritis : `${Math.round((1 - ratio) * 100)}%`}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">{t.dash_alerts_safe}</p>
                <p className="text-xs text-slate-400 mt-1">{t.dash_alerts_safe_desc}</p>
              </div>
            )}
            {inventoryRows.length === 0 && !lowStockItems.length && (
              <p className="text-xs text-slate-400 text-center mt-2">{t.dash_alerts_empty} <button onClick={() => go('/stok')} className="text-primary-600 font-semibold hover:underline">{t.dash_alerts_add_now}</button></p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Products & Menu Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{t.dash_recent_title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.dash_recent_sub}</p>
            </div>
            {recentProducts.length > 0 && (
              <span className="text-xs text-slate-400">{t.dash_recent_count.replace('{count}', products.length)}</span>
            )}
          </div>
          {recentProducts.length > 0 ? (
            <div className="space-y-2">
              {recentProducts.map((p, i) => (
                <div key={p.id || i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-primary-50 hover:-translate-x-0.5 transition-all duration-200 cursor-default">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.portions || '-'} porsi</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary-600 font-mono ml-3 flex-shrink-0">Rp {formatCurrency(p.total_food_cost)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-semibold text-slate-500 mt-4">{t.dash_recent_empty}</p>
              <p className="text-xs text-slate-400 mt-1">{t.dash_recent_empty_hint}</p>
              <button onClick={() => go('/harga-jual')} className="mt-4 text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-all">
                {t.dash_recent_empty_btn}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{t.dash_perf_title}</h3>
          {products.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{t.dash_perf_most}</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5 truncate">
                    {products.reduce((max, p) => (p.total_food_cost || 0) > (max.total_food_cost || 0) ? p : max, products[0]).name}
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-600 font-mono flex-shrink-0">
                  Rp {formatCurrency(products.reduce((max, p) => (p.total_food_cost || 0) > (max.total_food_cost || 0) ? p : max, products[0]).total_food_cost)}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-100">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">{t.dash_perf_cheapest}</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5 truncate">
                    {products.reduce((min, p) => (p.total_food_cost || 0) < (min.total_food_cost || Infinity) ? p : min, products[0]).name}
                  </p>
                </div>
                <span className="text-lg font-bold text-amber-600 font-mono flex-shrink-0">
                  Rp {formatCurrency(products.reduce((min, p) => (p.total_food_cost || 0) < (min.total_food_cost || Infinity) ? p : min, products[0]).total_food_cost)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t.dash_perf_footnote.replace('{count}', products.length)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              <p className="text-sm font-semibold text-slate-500 mt-4">{t.dash_perf_empty}</p>
              <p className="text-xs text-slate-400 mt-1">{t.dash_perf_empty_hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}