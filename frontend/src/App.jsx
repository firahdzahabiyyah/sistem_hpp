import React, { useState, useEffect, useMemo } from 'react'
import api from './api'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
}

export default function App() {
  const [activeTab, setActiveTab] = useState('subrecipe')

  const [subRecipeRows, setSubRecipeRows] = useState([
    { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }
  ])
  const [subRecipeName, setSubRecipeName] = useState('')

  const [foodCostRows, setFoodCostRows] = useState([
    { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }
  ])
  const [productName, setProductName] = useState('')
  const [portions, setPortions] = useState(1)

  const [savedRecipes, setSavedRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [laborRows, setLaborRows] = useState([
    { employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }
  ])
  const [overheadRows, setOverheadRows] = useState([
    { name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }
  ])
  const [marginPct, setMarginPct] = useState(30)

  useEffect(() => {
    api.getRecipes().then(setSavedRecipes).catch(() => [])
    api.getProducts().then(setProducts).catch(() => [])
    api.getLabor().then((data) => {
      if (!data || data.length === 0) {
        setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }])
      } else {
        setLaborRows(data)
      }
    }).catch(() => setLaborRows([{ employee_name: '', salary: 0, work_days: 0, cost_per_day: 0 }]))
    api.getOverheads().then((data) => {
      if (!data || data.length === 0) {
        setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }])
      } else {
        setOverheadRows(data)
      }
    }).catch(() => setOverheadRows([{ name: '', total_cost: 0, duration_days: 0, cost_per_day: 0 }]))
  }, [])

  const updateSubRecipeRow = (i, field, val) => {
    const copy = [...subRecipeRows]
    if (field === 'name' || field === 'unit') {
      copy[i][field] = val
    } else {
      copy[i][field] = parseFloat(val) || 0
    }
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setSubRecipeRows(copy)
  }

  const addSubRecipeRow = () => setSubRecipeRows([...subRecipeRows, { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const deleteSubRecipeRow = (i) => setSubRecipeRows(subRecipeRows.filter((_, idx) => idx !== i))

  const saveSubRecipe = async () => {
    if (!subRecipeName.trim()) { alert('Masukkan nama sub-recipe!'); return }
    const hasData = subRecipeRows.some(r => r.name && r.price > 0)
    if (!hasData) { alert('Masukkan setidaknya satu bahan dengan harga!'); return }
    const payload = { name: subRecipeName, details: subRecipeRows }
    try {
      const res = await api.createRecipe(payload)
      alert(`Sub-Recipe "${subRecipeName}" tersimpan! Total: Rp ${formatCurrency(res.total)}`)
      setSubRecipeName('')
      setSubRecipeRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getRecipes().then(setSavedRecipes).catch(() => [])
    } catch (e) { alert('Gagal: ' + (e.message || e)) }
  }

  const handleFoodCostNameChange = (i, val) => {
    const copy = [...foodCostRows]
    copy[i].name = val
    const matchedRecipe = savedRecipes.find(r => r.name.toLowerCase() === val.toLowerCase())
    if (matchedRecipe) {
      copy[i].price = matchedRecipe.total_cost || 0
      copy[i].cost_price = matchedRecipe.total_cost || 0
    } else {
      copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    }
    setFoodCostRows(copy)
  }

  const updateFoodCostRow = (i, field, val) => {
    const copy = [...foodCostRows]
    if (field === 'name') { handleFoodCostNameChange(i, val); return }
    if (field === 'unit') { copy[i][field] = val }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_price = copy[i].net_weight > 0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setFoodCostRows(copy)
  }

  const addFoodCostRow = () => setFoodCostRows([...foodCostRows, { name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
  const deleteFoodCostRow = (i) => setFoodCostRows(foodCostRows.filter((_, idx) => idx !== i))

  const saveFoodCost = async () => {
    if (!productName.trim()) { alert('Masukkan nama produk!'); return }
    alert('Bahan Baku tersimpan!')
  }

  const updateLaborRow = (i, field, val) => {
    const copy = [...laborRows]
    if (field === 'employee_name') { copy[i][field] = val }
    else if (field === 'work_days') { copy[i][field] = parseInt(val) || 1 }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_per_day = copy[i].work_days > 0 ? copy[i].salary / copy[i].work_days : 0
    setLaborRows(copy)
  }

  const addLaborRow = () => setLaborRows([...laborRows, { employee_name: '', salary: 0, work_days: 1, cost_per_day: 0 }])
  const deleteLaborRow = (i) => setLaborRows(laborRows.filter((_, idx) => idx !== i))

  const saveAllLabor = async () => {
    try {
      for (const labor of laborRows) {
        if (labor.employee_name && labor.salary > 0) {
          if (labor.id) await api.updateLabor(labor.id, labor)
          else await api.createLabor(labor)
        }
      }
      api.getLabor().then(setLaborRows).catch(() => [])
      alert('Tenaga Kerja tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const updateOverheadRow = (i, field, val) => {
    const copy = [...overheadRows]
    if (field === 'name') { copy[i][field] = val }
    else if (field === 'duration_days') { copy[i][field] = parseInt(val) || 1 }
    else { copy[i][field] = parseFloat(val) || 0 }
    copy[i].cost_per_day = copy[i].duration_days > 0 ? copy[i].total_cost / copy[i].duration_days : 0
    setOverheadRows(copy)
  }

  const addOverheadRow = () => setOverheadRows([...overheadRows, { name: '', total_cost: 0, duration_days: 1, cost_per_day: 0 }])
  const deleteOverheadRow = (i) => setOverheadRows(overheadRows.filter((_, idx) => idx !== i))

  const saveAllOverhead = async () => {
    try {
      for (const overhead of overheadRows) {
        if (overhead.name && overhead.total_cost > 0) {
          if (overhead.id) await api.updateOverhead(overhead.id, overhead)
          else await api.createOverhead(overhead)
        }
      }
      api.getOverheads().then(setOverheadRows).catch(() => [])
      alert('Overhead tersimpan!')
    } catch (e) { alert('Gagal: ' + e.message) }
  }

  const saveProduct = async () => {
    if (!productName.trim()) { alert('Masukkan nama produk!'); return }
    const payload = { name: productName, details: foodCostRows, portions }
    try {
      const res = await api.createProduct(payload)
      alert(`Produk "${productName}" tersimpan! Total: Rp ${formatCurrency(res.total)}`)
      setProductName('')
      setFoodCostRows([{ name: '', usage: 0, unit: '', net_weight: 0, gross_weight: 0, price: 0, cost_price: 0 }])
      api.getProducts().then(setProducts).catch(() => [])
    } catch (e) { alert('Gagal: ' + (e.message || e)) }
  }

  const calculations = useMemo(() => {
    const foodCost = foodCostRows.reduce((s, r) => s + (r.cost_price || 0), 0)
    const laborDaily = laborRows.reduce((s, l) => s + (l.cost_per_day || 0), 0)
    const overheadDaily = overheadRows.reduce((s, o) => s + (o.cost_per_day || 0), 0)
    const totalDaily = foodCost + laborDaily + overheadDaily
    const portion = portions > 0 ? portions : 1
    const hppPerUnit = portion > 0 ? totalDaily / portion : 0
    const minPrice = hppPerUnit * 1.1
    const sellingPrice = hppPerUnit * (1 + marginPct / 100)
    return { foodCost, laborDaily, overheadDaily, totalDaily, hppPerUnit, minPrice, sellingPrice }
  }, [foodCostRows, laborRows, overheadRows, portions, marginPct])

  const subRecipeTotal = subRecipeRows.reduce((s, r) => s + (r.cost_price || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900">Kalkulator HPP</h1>
          <p className="text-slate-500 mt-2 text-lg">Hitung Harga Pokok Produksi dengan akurat</p>
        </div>

        <datalist id="recipe-list">
          {savedRecipes.map(r => <option key={r.id} value={r.name} />)}
        </datalist>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 w-fit">
              <button onClick={() => setActiveTab('subrecipe')} className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'subrecipe' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Sub-Recipe</button>
              <button onClick={() => setActiveTab('pricecalc')} className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'pricecalc' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Perhitungan Harga Jual</button>
            </div>

            {activeTab === 'subrecipe' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">1</div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Sub-Recipe</h2>
                      <p className="text-sm text-slate-500">Buat resep dasar (Opor Ayam, Bumbu Dasar, dll)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Sub-Recipe:</label>
                    <input value={subRecipeName} onChange={(e) => setSubRecipeName(e.target.value)} placeholder="Contoh: Opor Ayam, Bumbu Dasar" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-2 py-2 text-center w-8">No</th>
                        <th className="px-2 py-2 min-w-[140px]">Nama Bahan</th>
                        <th className="px-2 py-2 w-16">Pemakaian</th>
                        <th className="px-2 py-2 w-14">Satuan</th>
                        <th className="px-2 py-2 w-20">Berat Bersih</th>
                        <th className="px-2 py-2 w-20">Berat Kotor</th>
                        <th className="px-2 py-2 w-24">Harga</th>
                        <th className="px-2 py-2 w-24 text-right">Cost</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subRecipeRows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-amber-50/30">
                          <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                          <td className="px-1 py-1"><input value={r.name} onChange={(e) => updateSubRecipeRow(i, 'name', e.target.value)} placeholder="Nama bahan" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                          <td className="px-1 py-1"><input type="number" value={r.usage} onChange={(e) => updateSubRecipeRow(i, 'usage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                          <td className="px-1 py-1"><input value={r.unit} onChange={(e) => updateSubRecipeRow(i, 'unit', e.target.value)} placeholder="sat" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                          <td className="px-1 py-1"><input type="number" value={r.net_weight} onChange={(e) => updateSubRecipeRow(i, 'net_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                          <td className="px-1 py-1"><input type="number" value={r.gross_weight} onChange={(e) => updateSubRecipeRow(i, 'gross_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                          <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price} onChange={(e) => updateSubRecipeRow(i, 'price', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></div></td>
                          <td className="px-2 py-2 text-right font-mono font-medium text-amber-700">{formatCurrency(r.cost_price)}</td>
                          <td className="px-1 py-1"><button onClick={() => deleteSubRecipeRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <button onClick={addSubRecipeRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Tambah Baris
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600">Total: <span className="font-bold text-amber-700">{formatCurrency(subRecipeTotal)}</span></div>
                    <button onClick={saveSubRecipe} className="px-5 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-all shadow-md text-sm">Simpan Sub-Recipe</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricecalc' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">2</div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">Bahan Baku (Food Cost)</h2>
                        <p className="text-sm text-slate-500">Biaya bahan untuk menu utama</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Nama Produk:</label>
                      <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Mie Ayam" className="px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700">Porsi:</label>
                      <input type="number" min="1" value={portions} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} className="w-16 px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-2 py-2 text-center w-8">NO</th>
                          <th className="px-2 py-2 min-w-[180px]">NAMA BAHAN</th>
                          <th className="px-2 py-2 w-16">PEMAKAIAN</th>
                          <th className="px-2 py-2 w-14">SATUAN</th>
                          <th className="px-2 py-2 w-20">BERAT BERSIH</th>
                          <th className="px-2 py-2 w-20">BERAT KOTOR</th>
                          <th className="px-2 py-2 w-24">HARGA (RP)</th>
                          <th className="px-2 py-2 w-24 text-right">COST PRICE (RP)</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {foodCostRows.map((r, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-amber-50/30">
                            <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-1 py-1">
                              <input list="recipe-list" value={r.name} onChange={(e) => updateFoodCostRow(i, 'name', e.target.value)} placeholder="Ketik atau pilih" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                            </td>
                            <td className="px-1 py-1"><input type="number" value={r.usage} onChange={(e) => updateFoodCostRow(i, 'usage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                            <td className="px-1 py-1"><input value={r.unit} onChange={(e) => updateFoodCostRow(i, 'unit', e.target.value)} placeholder="sat" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                            <td className="px-1 py-1"><input type="number" value={r.net_weight} onChange={(e) => updateFoodCostRow(i, 'net_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                            <td className="px-1 py-1"><input type="number" value={r.gross_weight} onChange={(e) => updateFoodCostRow(i, 'gross_weight', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></td>
                            <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={r.price} onChange={(e) => updateFoodCostRow(i, 'price', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" /></div></td>
                            <td className="px-2 py-2 text-right font-mono font-medium text-amber-700">{formatCurrency(r.cost_price)}</td>
                            <td className="px-1 py-1"><button onClick={() => deleteFoodCostRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button onClick={addFoodCostRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Tambah Baris
                    </button>
                    <button onClick={saveFoodCost} className="px-5 py-2 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg font-medium hover:bg-amber-200 transition-all text-sm">Simpan Bahan Baku</button>
                  </div>
                </div>

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

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-2 py-2 text-center w-8">NO</th>
                          <th className="px-2 py-2 min-w-[160px]">NAMA PEGAWAI</th>
                          <th className="px-2 py-2 w-28">GAJI</th>
                          <th className="px-2 py-2 w-16">HARI KERJA</th>
                          <th className="px-2 py-2 w-24 text-right">COST/HARI</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {laborRows.map((l, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-rose-50/30">
                            <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-1 py-1"><input value={l.employee_name} onChange={(e) => updateLaborRow(i, 'employee_name', e.target.value)} placeholder="Nama Pegawai" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none" /></td>
                            <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={l.salary} onChange={(e) => updateLaborRow(i, 'salary', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none" /></div></td>
                            <td className="px-1 py-1"><input type="number" value={l.work_days} onChange={(e) => updateLaborRow(i, 'work_days', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-rose-500 outline-none" /></td>
                            <td className="px-2 py-2 text-right font-mono font-medium text-rose-700">{formatCurrency(l.cost_per_day)}</td>
                            <td className="px-1 py-1"><button onClick={() => deleteLaborRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button onClick={addLaborRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Tambah Baris
                    </button>
                    <button onClick={saveAllLabor} className="px-5 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-all shadow-md text-sm">Simpan Tenaga Kerja</button>
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

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-2 py-2 text-center w-8">NO</th>
                          <th className="px-2 py-2 min-w-[160px]">NAMA BIAYA</th>
                          <th className="px-2 py-2 w-28">TOTAL BIAYA</th>
                          <th className="px-2 py-2 w-16">DURASI (HARI)</th>
                          <th className="px-2 py-2 w-24 text-right">COST/HARI</th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {overheadRows.map((o, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-violet-50/30">
                            <td className="px-2 py-2 text-center text-slate-400">{i + 1}</td>
                            <td className="px-1 py-1"><input value={o.name} onChange={(e) => updateOverheadRow(i, 'name', e.target.value)} placeholder="Nama Overhead" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></td>
                            <td className="px-1 py-1"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span><input type="number" value={o.total_cost} onChange={(e) => updateOverheadRow(i, 'total_cost', e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></div></td>
                            <td className="px-1 py-1"><input type="number" value={o.duration_days} onChange={(e) => updateOverheadRow(i, 'duration_days', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 outline-none" /></td>
                            <td className="px-2 py-2 text-right font-mono font-medium text-violet-700">{formatCurrency(o.cost_per_day)}</td>
                            <td className="px-1 py-1"><button onClick={() => deleteOverheadRow(i)} className="text-red-500 hover:text-red-700 p-1 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button onClick={addOverheadRow} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-violet-50 hover:border-violet-300 transition-all flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Tambah Baris
                    </button>
                    <button onClick={saveAllOverhead} className="px-5 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-all shadow-md text-sm">Simpan Overhead</button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={saveProduct} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-lg">
                    Simpan Produk
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Hasil Perhitungan
                  </h2>
                  <p className="text-amber-100 text-xs mt-1">Ringkasan biaya produksi</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-600">Biaya Bahan</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(calculations.foodCost)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-600">Tenaga Kerja</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(calculations.laborDaily)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-600">Overhead</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(calculations.overheadDaily)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-amber-50 -mx-5 px-5 rounded-b-xl">
                    <span className="font-semibold text-amber-900">Total</span>
                    <span className="font-bold text-lg text-amber-700">{formatCurrency(calculations.totalDaily)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-rose-500 to-rose-600">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    HPP per Porsi
                  </h2>
                </div>
                <div className="p-5 text-center">
                  <div className="text-4xl font-bold text-rose-600 mb-1">{formatCurrency(calculations.hppPerUnit)}</div>
                  <p className="text-slate-500 text-xs">per {portions} porsi</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                    <div className="text-center">
                      <p className="text-slate-400">Min. Harga</p>
                      <p className="font-semibold text-amber-600">{formatCurrency(calculations.minPrice)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Break Even</p>
                      <p className="font-semibold text-slate-700">{formatCurrency(calculations.hppPerUnit)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                    Rekomendasi Harga
                  </h2>
                </div>
                <div className="px-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Margin</span>
                    <span className="text-2xl font-bold text-amber-400">{marginPct}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={marginPct} onChange={(e) => setMarginPct(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                </div>
                <div className="p-5 pt-3">
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <p className="text-slate-300 text-sm mb-1">Harga Jual</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(calculations.sellingPrice)}</p>
                  </div>
                </div>
              </div>

              {products.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-700 text-sm">Produk Tersimpan</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {products.slice(-5).reverse().map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                        <span className="font-medium text-slate-700">{p.name}</span>
                        <span className="text-amber-600 font-semibold">{formatCurrency(p.total_food_cost)}</span>
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