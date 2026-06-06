module.exports = (sequelize, DataTypes) => {
  const DailySale = sequelize.define('DailySale', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    productName: { type: DataTypes.STRING, allowNull: false },
    stok_awal: { type: DataTypes.INTEGER, defaultValue: 0 },
    stok_akhir: { type: DataTypes.INTEGER, defaultValue: 0 },
    porsi_terjual: { type: DataTypes.INTEGER, defaultValue: 0 },
    harga_per_porsi: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_pendapatan: { type: DataTypes.FLOAT, defaultValue: 0 },
    estimasi_keuntungan: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return DailySale;
};
