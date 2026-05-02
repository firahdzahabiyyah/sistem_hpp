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

module.exports = { listOverheads, createOverhead };
