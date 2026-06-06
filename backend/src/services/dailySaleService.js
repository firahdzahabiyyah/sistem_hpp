const { DailySale } = require('../models');

async function listSales(date) {
  const where = date ? { date } : {};
  return await DailySale.findAll({ where, order: [['createdAt', 'DESC']] });
}

async function createSale(payload) {
  const { date, productId, productName, stok_awal, stok_akhir, harga_per_porsi } = payload;
  if (!date) throw new Error('Tanggal wajib diisi');
  if (!productId) throw new Error('Produk wajib dipilih');
  const porsi_terjual = (parseInt(stok_awal) || 0) - (parseInt(stok_akhir) || 0);
  const harga = parseFloat(harga_per_porsi) || 0;
  const total_pendapatan = porsi_terjual * harga;
  const estimasi_keuntungan = total_pendapatan * 0.3;
  const sale = await DailySale.create({
    date, productId, productName,
    stok_awal: parseInt(stok_awal) || 0,
    stok_akhir: parseInt(stok_akhir) || 0,
    porsi_terjual,
    harga_per_porsi: harga,
    total_pendapatan,
    estimasi_keuntungan
  });
  return sale.toJSON();
}

async function deleteSale(id) {
  const sale = await DailySale.findByPk(id);
  if (!sale) throw new Error('Data penjualan tidak ditemukan');
  await sale.destroy();
  return { success: true };
}

async function getSalesSummary(date) {
  const where = date ? { date } : {};
  const sales = await DailySale.findAll({ where });
  const total_terjual = sales.reduce((s, r) => s + r.porsi_terjual, 0);
  const total_pendapatan = sales.reduce((s, r) => s + r.total_pendapatan, 0);
  const total_keuntungan = sales.reduce((s, r) => s + r.estimasi_keuntungan, 0);
  return { total_terjual, total_pendapatan, total_keuntungan, count: sales.length };
}

async function getSalesHistory() {
  const sales = await DailySale.findAll({
    order: [['date', 'ASC']],
    attributes: ['date', 'productId', 'productName', 'porsi_terjual', 'total_pendapatan']
  });
  return sales;
}

module.exports = { listSales, createSale, deleteSale, getSalesSummary, getSalesHistory };
