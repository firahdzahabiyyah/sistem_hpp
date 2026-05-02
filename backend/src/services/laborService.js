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

async function updateLabor(id, { employee_name, salary, work_days }) {
  const item = await Labor.findByPk(id);
  if (!item) throw new Error('Labor not found');
  const s = salary !== undefined ? parseFloat(salary) || 0 : item.salary;
  const days = work_days !== undefined ? parseInt(work_days) || 1 : item.work_days;
  const cost_per_day = days > 0 ? s / days : 0;
  await item.update({ 
    employee_name: employee_name !== undefined ? employee_name : item.employee_name,
    salary: s, 
    work_days: days, 
    cost_per_day 
  });
  return item;
}

async function deleteLabor(id) {
  const item = await Labor.findByPk(id);
  if (!item) throw new Error('Labor not found');
  await item.destroy();
  return { success: true };
}

module.exports = { listLabor, createLabor, updateLabor, deleteLabor };
