const { Laboratorium } = require('../models');

async function listLaboratorium() {
  return Laboratorium.findAll();
}

async function createLaboratorium({ name, unit, quantity, price }) {
  if (!name) throw new Error('name is required');
  const qty = parseFloat(quantity) || 0;
  const prc = parseFloat(price) || 0;
  const total_cost = qty * prc;
  return Laboratorium.create({ name, unit, quantity: qty, price: prc, total_cost });
}

async function updateLaboratorium(id, { name, unit, quantity, price }) {
  const item = await Laboratorium.findByPk(id);
  if (!item) throw new Error('Laboratorium not found');
  const qty = quantity !== undefined ? parseFloat(quantity) || 0 : item.quantity;
  const prc = price !== undefined ? parseFloat(price) || 0 : item.price;
  const total_cost = qty * prc;
  await item.update({ 
    name: name !== undefined ? name : item.name,
    unit: unit !== undefined ? unit : item.unit,
    quantity: qty,
    price: prc,
    total_cost 
  });
  return item;
}

async function deleteLaboratorium(id) {
  const item = await Laboratorium.findByPk(id);
  if (!item) throw new Error('Laboratorium not found');
  await item.destroy();
  return { success: true };
}

module.exports = { listLaboratorium, createLaboratorium, updateLaboratorium, deleteLaboratorium };