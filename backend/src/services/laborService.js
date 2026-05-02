const { Labor } = require('../models');

async function listLabor() {
  return Labor.findAll();
}

async function createLabor({ employee_name, salary, work_days }) {
  if (!employee_name) throw new Error('employee_name is required');
  const s = parseFloat(salary) || 0;
  const days = parseInt(work_days) || 1;
  const cost_per_day = days > 0 ? s / days : 0;
  return Labor.create({ employee_name, salary: s, work_days: days, cost_per_day });
}

module.exports = { listLabor, createLabor };
