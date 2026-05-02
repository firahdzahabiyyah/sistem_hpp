module.exports = (sequelize, DataTypes) => {
  const ProductDetail = sequelize.define('ProductDetail', {
    name: DataTypes.STRING,
    usage: { type: DataTypes.FLOAT, defaultValue: 0 },
    unit: DataTypes.STRING,
    net_weight: { type: DataTypes.FLOAT, defaultValue: 0 },
    gross_weight: { type: DataTypes.FLOAT, defaultValue: 0 },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    cost_price: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return ProductDetail;
};
