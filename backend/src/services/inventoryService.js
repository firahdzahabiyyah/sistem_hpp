const { Inventory } = require('../models');
const { DailySale } = require('../models');
const { Op } = require('sequelize');

async function listInventory() {
  return await Inventory.findAll({ order: [['name', 'ASC']] });
}

async function createOrUpdateInventory(payload) {
  const { id, name, unit, current_stock, min_stock } = payload;
  if (!name) throw new Error('Nama bahan wajib diisi');
  if (id) {
    const item = await Inventory.findByPk(id);
    if (!item) throw new Error('Bahan tidak ditemukan');
    await item.update({ name, unit, current_stock, min_stock });
    return item.toJSON();
  }
  const item = await Inventory.create({ name, unit, current_stock, min_stock });
  return item.toJSON();
}

async function deleteInventory(id) {
  const item = await Inventory.findByPk(id);
  if (!item) throw new Error('Bahan tidak ditemukan');
  await item.destroy();
  return { success: true };
}

async function getForecast(date) {
  const forecastDate = new Date(date);
  const dayOfMonth = forecastDate.getDate();
  const month = forecastDate.getMonth();

  const sales = await DailySale.findAll({
    where: {
      [Op.and]: [
        { date: { [Op.ne]: null } }
      ]
    }
  });

  const sameDaySales = sales.filter(s => {
    const d = new Date(s.date);
    return d.getDate() === dayOfMonth;
  });

  const avgSales = sameDaySales.length > 0
    ? sameDaySales.reduce((s, r) => s + r.porsi_terjual, 0) / sameDaySales.length
    : 0;

  return {
    date,
    day: dayOfMonth,
    month: month + 1,
    recommended_stock: Math.ceil(avgSales * 1.2),
    historical_data_points: sameDaySales.length
  };
}

module.exports = { listInventory, createOrUpdateInventory, deleteInventory, getForecast };
