import React, { useState, useEffect, useMemo } from 'react'
import api from './api'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

const parseCurrency = (value) => parseFloat(value.replace(/[^0-9]/g, '')) || 0

export default function App() {
  const [tab, setTab] = useState('pre')
  const [preRows, setPreRows] = useState([
    { name: 'Ayam', usage: 100, unit: 'g', net_weight: 1000, gross_weight: 1200, price: 50000, cost_price: 0 }
  ])
  const [productRows, setProductRows] = useState([])
  const [portions, setPortions] = useState(1)
  const [ingredients, setIngredients] = useState([])
  const [preLabel, setPreLabel] = useState('Bahan Mentah')
  const [productLabel, setProductLabel] = useState('Produk Jadi')

  const [products, setProducts] = useState([])
  const [labors, setLabors] = useState([])
  const [overheads, setOverheads] = useState([])
  const [marginPct, setMarginPct] = useState(30)
  const [productName, setProductName] = useState('')

  useEffect(() => {
    api.getIngredients().then(setIngredients).catch(() => setIngredients([]))
    api.getLabor().then(setLabors).catch(() => setLabors([]))
    api.getOverheads().then(setOverheads).catch(() => {})
    api.getProducts().then(setProducts).catch(() => [])
  }, [])

  const getCurrent = () => tab === 'product' ? productRows : preRows
  const setCurrent = (v) => tab === 'product' ? setProductRows(v) : setPreRows(v)

  const updateRow = (i, field, val) => {
    const copy = [...getCurrent()]
    if (field === 'name' || field === 'unit') {
      copy[i][field] = val
    } else {
      copy[i][field] = parseFloat(val) || 0
    }
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setCurrent(copy)
  }

  const addRow = () => setCurrent([...getCurrent(), { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])

  const deleteRow = (i) => setCurrent(getCurrent().filter((_, idx) => idx !== i))

  const saveRecipe = async () => {
    const payload = { name: preLabel, details: preRows }
    try {
      const res = await api.createRecipe(payload)
      alert('Resep tersimpan! Total: Rp ' + formatCurrency(res.total || 0))
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const saveProduct = async () => {
    if (!productName.trim()) {
      alert('Masukkan nama produk terlebih dahulu!')
      return
    }
    const payload = { name: productName, details: productRows, portions }
    try {
      const res = await api.createProduct(payload)
      alert('Produk tersimpan! Total: Rp ' + formatCurrency(res.total || 0))
      setProductName('')
      api.getProducts().then(setProducts).catch(() => [])
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const [laborForm, setLaborForm] = useState({ employee_name: '', salary: 0, work_days: 1 })

  const saveLabor = async () => {
    if (!laborForm.employee_name.trim()) {
      alert('Masukkan nama pegawai!')
      return
    }
    try {
      const res = await api.createLabor(laborForm)
      setLabors([...labors, res])
      setLaborForm({ employee_name: '', salary: 0, work_days: 1 })
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const deleteLabor = async (id) => {
    try {
      await api.deleteLabor(id)
      setLabors(labors.filter(l => l.id !== id))
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const updateLaborRow = async (id, field, val) => {
    const row = labors.find(r => r.id === id)
    if (!row) return
    const updated = { ...row }
    if (field === 'employee_name') {
      updated[field] = val
    } else if (field === 'work_days') {
      updated[field] = parseInt(val) || 1
    } else {
      updated[field] = parseFloat(val) || 0
    }
    updated.cost_per_day = updated.work_days > 0 ? updated.salary / updated.work_days : 0
    try {
      const res = await api.updateLabor(id, updated)
      setLabors(labors.map(r => r.id === id ? res : r))
    } catch (e) {
      console.error(e)
    }
  }

  const [overheadForm, setOverheadForm] = useState({ name: '', total_cost: 0, duration_days: 1 })

  const saveOverhead = async () => {
    if (!overheadForm.name.trim()) {
      alert('Masukkan nama overhead!')
      return
    }
    try {
      const res = await api.createOverhead(overheadForm)
      setOverheads([...overheads, res])
      setOverheadForm({ name: '', total_cost: 0, duration_days: 1 })
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const deleteOverhead = async (id) => {
    try {
      await api.deleteOverhead(id)
      setOverheads(overheads.filter(o => o.id !== id))
    } catch (e) {
      alert('Gagal: ' + (e.message || e))
    }
  }

  const updateOverheadRow = async (id, field, val) => {
    const row = overheads.find(r => r.id === id)
    if (!row) return
    const updated = { ...row }
    if (field === 'name') {
      updated[field] = val
    } else if (field === 'duration_days') {
      updated[field] = parseInt(val) || 1
    } else {
      updated[field] = parseFloat(val) || 0
    }
    updated.cost_per_day = updated.duration_days > 0 ? updated.total_cost / updated.duration_days : 0
    try {
      const res = await api.updateOverhead(id, updated)
      setOverheads(overheads.map(r => r.id === id ? res : r))
    } catch (e) {
      console.error(e)
    }
  }

  const calculations = useMemo(() => {
    const foodCost = getCurrent().reduce((s, r) => s + (r.cost_price || 0), 0)
    const laborDaily = labors.reduce((s, l) => s + (l.cost_per_day || 0), 0)
    const overheadDaily = overheads.reduce((s, o) => s + (o.cost_per_day || 0), 0)
    const totalDaily = foodCost + laborDaily + overheadDaily
    const portion = portions > 0 ? portions : 1
    const hppPerUnit = portion > 0 ? totalDaily / portion : 0
    const breakEven = hppPerUnit
    const minPrice = hppPerUnit * 1.1
    const sellingPrice = hppPerUnit * (1 + marginPct / 100)

    return {
      foodCost,
      laborDaily,
      overheadDaily,
      totalDaily,
      hppPerUnit,
      breakEven,
      minPrice,
      sellingPrice
    }
  }, [preRows, productRows, labors, overheads, portions, tab, marginPct])

  const currentRows = getCurrent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900">Kalkulator HPP</h1>
          <p className="text-slate-500 mt-2 text-lg">Hitung Harga Pokok Produksi dengan akurat</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 w-fit">
              <button
                onClick={() => setTab('pre')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${tab === 'pre' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Bahan Mentah
              </button>
              <button
                onClick={() => setTab('product')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${tab === 'product' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Produk Jadi
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {tab === 'pre' ? '1' : '2'}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">{tab === 'pre' ? preLabel : productLabel}</h2>
                      <p className="text-sm text-slate-500">Daftar bahan yang digunakan</p>
                    </div>
                  </div>
                  <input
                    value={tab === 'pre' ? preLabel : productLabel}
                    onChange={(e) => tab === 'pre' ? setPreLabel(e.target.value) : setProductLabel(e.target.value)}
                    className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3">Nama Bahan</th>
                      <th className="px-4 py-3 w-24">Pemakaian</th>
                      <th className="px-4 py-3 w-20">Satuan</th>
                      <th className="px-4 py-3 w-28">Berat Bersih</th>
                      <th className="px-4 py-3 w-28">Berat Kotor</th>
                      <th className="px-4 py-3 w-32">Harga</th>
                      <th className="px-4 py-3 w-32 text-right">Cost</th>
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-amber-50/30 transition-colors">
                        <td className="px-4 py-3 text-center text-slate-400">{i + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={r.name}
                            onChange={(e) => updateRow(i, 'name', e.target.value)}
                            placeholder="Nama bahan"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={r.usage}
                            onChange={(e) => updateRow(i, 'usage', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={r.unit}
                            onChange={(e) => updateRow(i, 'unit', e.target.value)}
                            placeholder="satuan"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={r.net_weight}
                            onChange={(e) => updateRow(i, 'net_weight', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            value={r.gross_weight}
                            onChange={(e) => updateRow(i, 'gross_weight', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                            <input
                              type="number"
                              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                              value={r.price}
                              onChange={(e) => updateRow(i, 'price', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-amber-700">
                          Rp {formatCurrency(r.cost_price)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => deleteRow(i)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center gap-3">
                <button
                  onClick={addRow}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Baris
                </button>
                {tab === 'product' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <label className="text-sm text-slate-600 font-medium">Porsi:</label>
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      value={portions}
                      onChange={(e) => setPortions(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
                {tab === 'pre' ? (
                  <button
                    onClick={saveRecipe}
                    className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg ml-auto"
                  >
                    Simpan Resep
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nama produk"
                    />
                    <button
                      onClick={saveProduct}
                      className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Simpan Produk
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">3</div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Tenaga Kerja</h2>
                      <p className="text-sm text-slate-500">Biaya operasional harian</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Nama Pegawai"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm"
                      value={laborForm.employee_name}
                      onChange={(e) => setLaborForm({ ...laborForm, employee_name: e.target.value })}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                      <input
                        type="number"
                        placeholder="Gaji"
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm"
                        value={laborForm.salary || ''}
                        onChange={(e) => setLaborForm({ ...laborForm, salary: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Hari"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm"
                        value={laborForm.work_days}
                        onChange={(e) => setLaborForm({ ...laborForm, work_days: parseInt(e.target.value) || 1 })}
                      />
                      <button
                        onClick={saveLabor}
                        className="px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-3 py-2 text-center w-10">No</th>
                          <th className="px-3 py-2">Nama</th>
                          <th className="px-3 py-2">Gaji</th>
                          <th className="px-3 py-2">Hari</th>
                          <th className="px-3 py-2 text-right">Cost/Hari</th>
                          <th className="px-3 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {labors.map((l, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-rose-50/30 transition-colors">
                            <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-2 py-1">
                              <input
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                value={l.employee_name}
                                onChange={(e) => updateLaborRow(l.id, 'employee_name', e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                value={l.salary}
                                onChange={(e) => updateLaborRow(l.id, 'salary', e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                value={l.work_days}
                                onChange={(e) => updateLaborRow(l.id, 'work_days', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-rose-700 font-medium">
                              Rp {formatCurrency(l.cost_per_day)}
                            </td>
                            <td className="px-2 py-1">
                              <button
                                onClick={() => deleteLabor(l.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">4</div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Overhead</h2>
                      <p className="text-sm text-slate-500">Biaya tidak langsung</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Nama Overhead"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm col-span-1"
                      value={overheadForm.name}
                      onChange={(e) => setOverheadForm({ ...overheadForm, name: e.target.value })}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                      <input
                        type="number"
                        placeholder="Biaya"
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm"
                        value={overheadForm.total_cost || ''}
                        onChange={(e) => setOverheadForm({ ...overheadForm, total_cost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Hari"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm"
                        value={overheadForm.duration_days}
                        onChange={(e) => setOverheadForm({ ...overheadForm, duration_days: parseInt(e.target.value) || 1 })}
                      />
                      <button
                        onClick={saveOverhead}
                        className="px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                          <th className="px-3 py-2 text-center w-10">No</th>
                          <th className="px-3 py-2">Nama</th>
                          <th className="px-3 py-2">Total</th>
                          <th className="px-3 py-2">Hari</th>
                          <th className="px-3 py-2 text-right">Cost/Hari</th>
                          <th className="px-3 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {overheads.map((o, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                            <td className="px-3 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-2 py-1">
                              <input
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                                value={o.name}
                                onChange={(e) => updateOverheadRow(o.id, 'name', e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                                value={o.total_cost}
                                onChange={(e) => updateOverheadRow(o.id, 'total_cost', e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                                value={o.duration_days}
                                onChange={(e) => updateOverheadRow(o.id, 'duration_days', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-violet-700 font-medium">
                              Rp {formatCurrency(o.cost_per_day)}
                            </td>
                            <td className="px-2 py-1">
                              <button
                                onClick={() => deleteOverhead(o.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Hasil Perhitungan
                  </h2>
                  <p className="text-amber-100 text-sm mt-1">Ringkasan biaya produksi</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Biaya Bahan (Food Cost)</span>
                    <span className="font-semibold text-slate-800">Rp {formatCurrency(calculations.foodCost)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Biaya Tenaga Kerja</span>
                    <span className="font-semibold text-slate-800">Rp {formatCurrency(calculations.laborDaily)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Biaya Overhead</span>
                    <span className="font-semibold text-slate-800">Rp {formatCurrency(calculations.overheadDaily)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-amber-50 -mx-6 px-6 rounded-b-2xl">
                    <span className="font-semibold text-amber-900">Total Biaya Harian</span>
                    <span className="font-bold text-xl text-amber-700">Rp {formatCurrency(calculations.totalDaily)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-rose-500 to-rose-600">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Harga Pokok Produksi
                  </h2>
                  <p className="text-rose-100 text-sm mt-1">HPP per unit/porsi</p>
                </div>

                <div className="p-6 text-center">
                  <div className="text-5xl font-bold text-rose-600 mb-2">Rp {formatCurrency(calculations.hppPerUnit)}</div>
                  <p className="text-slate-500 text-sm">per {portions} porsi</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Break Even</p>
                      <p className="font-semibold text-slate-700">Rp {formatCurrency(calculations.breakEven)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Min. Harga</p>
                      <p className="font-semibold text-amber-600">Rp {formatCurrency(calculations.minPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Rekomendasi Harga Jual
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Tentukan margin keuntungan</p>
                </div>

                <div className="px-6 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Margin</span>
                    <span className="text-3xl font-bold text-amber-400">{marginPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={marginPct}
                    onChange={(e) => setMarginPct(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="p-6 pt-4">
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <p className="text-slate-300 text-sm mb-1">Harga Rekomendasi</p>
                    <p className="text-4xl font-bold text-white">Rp {formatCurrency(calculations.sellingPrice)}</p>
                  </div>
                  <button
                    onClick={saveProduct}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Simpan Produk
                  </button>
                </div>
              </div>

              {products.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Produk Tersimpan</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {products.slice(-5).reverse().map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                        <span className="text-amber-600 font-semibold text-sm">Rp {formatCurrency(p.total_food_cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}