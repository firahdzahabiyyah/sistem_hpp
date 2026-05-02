const BASE = 'http://localhost:4000/api'

async function getIngredients(){
  const res = await fetch(BASE + '/ingredients')
  if (!res.ok) return []
  return res.json()
}

async function createRecipe(payload){
  const res = await fetch(BASE + '/recipes', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function getProducts(){
  const res = await fetch(BASE + '/products')
  if (!res.ok) return []
  return res.json()
}

async function createProduct(payload){
  const res = await fetch(BASE + '/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function getLabor(){
  const res = await fetch(BASE + '/labor')
  if (!res.ok) return []
  return res.json()
}

async function createLabor(payload){
  const res = await fetch(BASE + '/labor', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function updateLabor(id, payload){
  const res = await fetch(BASE + '/labor/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function deleteLabor(id){
  const res = await fetch(BASE + '/labor/' + id, { method: 'DELETE' })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function getOverheads(){
  const res = await fetch(BASE + '/overheads')
  if (!res.ok) return []
  return res.json()
}

async function createOverhead(payload){
  const res = await fetch(BASE + '/overheads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function updateOverhead(id, payload){
  const res = await fetch(BASE + '/overheads/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function deleteOverhead(id){
  const res = await fetch(BASE + '/overheads/' + id, { method: 'DELETE' })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}

async function getProductHPP(id){
  const res = await fetch(BASE + '/products/' + id + '/hpp')
  if (!res.ok) return null
  return res.json()
}

export default { getIngredients, createRecipe, getProducts, createProduct, getLabor, createLabor, updateLabor, deleteLabor, getOverheads, createOverhead, updateOverhead, deleteOverhead, getProductHPP }

