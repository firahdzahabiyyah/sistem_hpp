import React, { useState, useEffect } from 'react'
import api from './api'

export default function App(){
  const [tab, setTab] = useState('pre') // 'pre' or 'product'
  const [preRows, setPreRows] = useState([
    { name: 'Ayam', usage: 100, unit: 'g', net_weight: 1000, gross_weight:1200, price: 50, cost_price:0 }
  ])
  const [productRows, setProductRows] = useState([])
  const [portions, setPortions] = useState(1)
  const [ingredients, setIngredients] = useState([])

  useEffect(()=>{
    api.getIngredients().then(setIngredients).catch(()=>setIngredients([]))
    api.getLabor().then(data=> setLabors(data)).catch(()=>setLabors([]))
  },[])
  // load products for HPP page and product tab
  const [products, setProducts] = useState([])
  useEffect(()=>{
    api.getProducts().then(setProducts).catch(()=>setProducts([]))
  },[])

  const getCurrent = () => tab==='product' ? productRows : preRows
  const setCurrent = (v) => tab==='product' ? setProductRows(v) : setPreRows(v)

  const update = (i, field, val) => {
    const copy = [...getCurrent()]
    copy[i][field] = field === 'name' || field === 'unit' ? val : parseFloat(val)||0
    copy[i].cost_price = copy[i].net_weight>0 ? (copy[i].usage / copy[i].net_weight) * copy[i].price : 0
    setCurrent(copy)
  }

  const addRow = () => setCurrent([...getCurrent(), { name:'', usage:0, unit:'', net_weight:0, gross_weight:0, price:0, cost_price:0 }])

  const saveRecipe = async () => {
    const payload = { name: 'New Recipe', details: preRows }
    try{
      const res = await api.createRecipe(payload)
      alert('Recipe saved. Total: ' + (res.total||0))
    }catch(e){
      alert('Gagal simpan: '+(e.message||e))
    }
  }

  const saveProduct = async (opts={}) => {
    const payload = { name: 'New Product', details: productRows, portions: opts }
    try{
      const res = await api.createProduct(payload)
      alert('Product saved. Total: ' + (res.total||0))
    }catch(e){
      alert('Gagal simpan product: '+(e.message||e))
    }
  }

  const deleteRow = (i) => setCurrent(getCurrent().filter((_,idx)=>idx!==i))
  // Labor state
  const [labors, setLabors] = useState([])
  const [laborForm, setLaborForm] = useState({ employee_name:'', salary:0, work_days:1 })

  const saveLabor = async () => {
    try{
      const res = await api.createLabor(laborForm)
      setLabors([...labors, res])
      setLaborForm({ employee_name:'', salary:0, work_days:1 })
      alert('Labor saved')
    }catch(e){ alert('Gagal simpan labor: '+(e.message||e)) }
  }
  // Overhead state
  const [overheads, setOverheads] = useState([])
  const [overheadForm, setOverheadForm] = useState({ name:'', total_cost:0, duration_days:1 })

  useEffect(()=>{
    api.getOverheads().then(setOverheads).catch(()=>{})
  },[])

  const saveOverhead = async () => {
    try{
      const res = await api.createOverhead(overheadForm)
      setOverheads([...overheads, res])
      setOverheadForm({ name:'', total_cost:0, duration_days:1 })
      alert('Overhead saved')
    }catch(e){ alert('Gagal simpan overhead: '+(e.message||e)) }
  }

  // HPP state
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [hppData, setHppData] = useState(null)
  const [marginPct, setMarginPct] = useState(20)

  const loadHPP = async (productId) => {
    if (!productId) return setHppData(null)
    const data = await api.getProductHPP(productId)
    setHppData(data)
  }

  const currentRows = getCurrent()
  const total = currentRows.reduce((s,r)=> s + (r.cost_price||0), 0)
  const costPerPortion = portions>0 ? total / portions : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 p-6 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rose-600">Mie Ayam Ceker Jali-Jali</h1>
            <p className="text-sm text-slate-500 mt-1">Hitung Harga Pokok Produksi (HPP) dengan cepat</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setTab('pre')} className={`px-4 py-2 rounded-full text-sm ${tab==='pre'? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Pre-Recipe</button>
            <button onClick={()=>setTab('product')} className={`px-4 py-2 rounded-full text-sm ${tab==='product'? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Products</button>
            <button onClick={()=>setTab('labor')} className={`px-4 py-2 rounded-full text-sm ${tab==='labor'? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Labor</button>
            <button onClick={()=>setTab('overhead')} className={`px-4 py-2 rounded-full text-sm ${tab==='overhead'? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Overhead</button>
            <button onClick={()=>setTab('hpp')} className={`px-4 py-2 rounded-full text-sm ${tab==='hpp'? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>HPP Result</button>
          </div>
        </div>
        <div className="overflow-auto">
          {(tab==='pre' || tab==='product') && (
            <>
              <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="text-left text-sm text-slate-600">
                <th className="w-8">No</th>
                <th>Nama Bahan</th>
                <th className="w-28">Pemakaian</th>
                <th className="w-20">Satuan</th>
                <th className="w-28">Berat Bersih</th>
                <th className="w-28">Berat Kotor</th>
                <th className="w-28">Harga</th>
                <th className="w-40">Cost Price</th>
              </tr>
            </thead>
              <tbody>
              {currentRows.map((r, i) => (
                <tr key={i} className="border-t hover:bg-rose-50">
                  <td className="py-2 align-top">{i+1}</td>
                  <td>
                    <input className="w-full p-2 border rounded" value={r.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Nama bahan" />
                  </td>
                  <td><input className="w-full p-2 border rounded" value={r.usage} onChange={e=>update(i,'usage',e.target.value)}/></td>
                  <td><input className="w-full p-2 border rounded" value={r.unit} onChange={e=>update(i,'unit',e.target.value)}/></td>
                  <td><input className="w-full p-2 border rounded" value={r.net_weight} onChange={e=>update(i,'net_weight',e.target.value)}/></td>
                  <td><input className="w-full p-2 border rounded" value={r.gross_weight} onChange={e=>update(i,'gross_weight',e.target.value)}/></td>
                  <td><input className="w-full p-2 border rounded" value={r.price} onChange={e=>update(i,'price',e.target.value)}/></td>
                  <td className="font-mono text-right pr-2 align-top">Rp {r.cost_price.toFixed(2)}</td>
                  <td className="pl-2 align-top"><button className="text-sm text-red-600" onClick={()=>deleteRow(i)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
                <tr className="bg-rose-50 sticky bottom-0">
                  <td colSpan={7} className="text-right py-3 pr-4 font-semibold">Total</td>
                  <td className="font-semibold text-rose-600">Rp {total.toFixed(2)}</td>
                </tr>
            </tfoot>
              </table>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-rose-600 text-white rounded-lg shadow" onClick={addRow}>Tambah Baris</button>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                <label className="text-sm text-slate-600">Portions</label>
                <input type="number" className="w-20 p-2 border rounded" value={portions} onChange={e=>setPortions(parseInt(e.target.value)||1)} />
              </div>
            </div>
            <div className="flex gap-2">
              {tab==='pre' ? (
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg" onClick={saveRecipe}>Simpan Resep</button>
              ) : (
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg" onClick={()=>saveProduct({...portions})}>Simpan Product</button>
              )}
            </div>
          </div>

            </>
          )}

          {/* Labor section */}
          {tab==='labor' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Labor / Tenaga Kerja</h2>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Nama Pegawai" className="p-2 border rounded" value={laborForm.employee_name} onChange={e=>setLaborForm({...laborForm, employee_name:e.target.value})} />
                <input placeholder="Gaji" type="number" className="p-2 border rounded" value={laborForm.salary} onChange={e=>setLaborForm({...laborForm, salary:parseFloat(e.target.value)||0})} />
                <input placeholder="Hari Kerja" type="number" className="p-2 border rounded" value={laborForm.work_days} onChange={e=>setLaborForm({...laborForm, work_days:parseInt(e.target.value)||1})} />
                <button className="px-4 py-2 bg-rose-500 text-white rounded" onClick={saveLabor}>Simpan Labor</button>
              </div>
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600"><th>No</th><th>Nama</th><th>Gaji</th><th>Hari Kerja</th><th>Cost/Day</th></tr>
                </thead>
                <tbody>
                  {labors.map((l,i)=> (
                    <tr key={i} className="border-t"><td className="py-2">{i+1}</td><td>{l.employee_name}</td><td>{l.salary}</td><td>{l.work_days}</td><td>{l.cost_per_day}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Overhead section */}
          {tab==='overhead' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Overhead</h2>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Nama Overhead" className="p-2 border rounded" value={overheadForm.name} onChange={e=>setOverheadForm({...overheadForm, name:e.target.value})} />
                <input placeholder="Total Cost" type="number" className="p-2 border rounded" value={overheadForm.total_cost} onChange={e=>setOverheadForm({...overheadForm, total_cost:parseFloat(e.target.value)||0})} />
                <input placeholder="Duration Days" type="number" className="p-2 border rounded" value={overheadForm.duration_days} onChange={e=>setOverheadForm({...overheadForm, duration_days:parseInt(e.target.value)||1})} />
                <button className="px-4 py-2 bg-rose-500 text-white rounded" onClick={saveOverhead}>Simpan Overhead</button>
              </div>
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600"><th>No</th><th>Nama</th><th>Total Cost</th><th>Duration</th><th>Cost/Day</th></tr>
                </thead>
                <tbody>
                  {overheads.map((o,i)=> (
                    <tr key={i} className="border-t"><td className="py-2">{i+1}</td><td>{o.name}</td><td>{o.total_cost}</td><td>{o.duration_days}</td><td>{o.cost_per_day}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* HPP Result */}
          {tab==='hpp' && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">HPP Result</h2>
              <div className="flex gap-2 items-center mb-4">
                <select className="p-2 border rounded" value={selectedProductId||''} onChange={e=>{ setSelectedProductId(e.target.value); loadHPP(e.target.value) }}>
                  <option value="">-- Pilih Product --</option>
                  {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <label className="ml-4">Margin %</label>
                <input type="number" className="p-2 border rounded w-24" value={marginPct} onChange={e=>setMarginPct(parseFloat(e.target.value)||0)} />
                <button className="px-4 py-2 bg-emerald-500 text-white rounded" onClick={()=>loadHPP(selectedProductId)}>Hitung</button>
              </div>

                  {hppData && (
                <div className="bg-slate-50 p-4 rounded shadow">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>TOTAL FOOD COST</div><div className="font-semibold">Rp { (hppData.food_cost||0).toFixed(2) }</div>
                    <div>LABOR COST (daily)</div><div className="font-semibold">Rp { (hppData.labor_daily||0).toFixed(2) }</div>
                    <div>OVERHEAD COST (daily)</div><div className="font-semibold">Rp { (hppData.overhead_daily||0).toFixed(2) }</div>
                    <div className="border-t pt-2">HPP</div><div className="border-t font-bold pt-2">Rp { (hppData.hpp||0).toFixed(2) }</div>
                    <div>MARGIN (%)</div><div>{marginPct}%</div>
                    <div>SELLING PRICE</div><div className="text-2xl font-extrabold">Rp { ( (hppData.hpp||0) * (1 + marginPct/100) ).toFixed(2) }</div>
                    <div>Cost / Portion (UI)</div><div className="font-semibold">Rp { costPerPortion.toFixed(2) }</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
