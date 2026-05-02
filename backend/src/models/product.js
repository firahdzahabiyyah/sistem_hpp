module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price_sell: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_food_cost: { type: DataTypes.FLOAT, defaultValue: 0 },
    portions: { type: DataTypes.INTEGER, defaultValue: 1 }
  });
  return Product;
};
