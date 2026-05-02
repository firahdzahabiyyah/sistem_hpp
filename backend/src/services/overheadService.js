const { Overhead } = require('../models');

async function listOverheads() {
  return Overhead.findAll();
}

async function createOverhead({ name, total_cost, duration_days }) {
  if (!name) throw new Error('name is required');
  const total = parseFloat(total_cost) || 0;
  const days = parseInt(duration_days) || 1;
  const cost_per_day = days > 0 ? total / days : 0;
  return Overhead.create({ name, total_cost: total, duration_days: days, cost_per_day });
}

async function updateOverhead(id, { name, total_cost, duration_days }) {
  const item = await Overhead.findByPk(id);
  if (!item) throw new Error('Overhead not found');
  const total = total_cost !== undefined ? parseFloat(total_cost) || 0 : item.total_cost;
  const days = duration_days !== undefined ? parseInt(duration_days) || 1 : item.duration_days;
  const cost_per_day = days > 0 ? total / days : 0;
  await item.update({ 
    name: name !== undefined ? name : item.name,
    total_cost: total, 
    duration_days: days, 
    cost_per_day 
  });
  return item;
}

async function deleteOverhead(id) {
  const item = await Overhead.findByPk(id);
  if (!item) throw new Error('Overhead not found');
  await item.destroy();
  return { success: true };
}

module.exports = { listOverheads, createOverhead, updateOverhead, deleteOverhead };
