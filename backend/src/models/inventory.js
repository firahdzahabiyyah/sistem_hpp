module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    name: { type: DataTypes.STRING, allowNull: false },
    unit: DataTypes.STRING,
    current_stock: { type: DataTypes.FLOAT, defaultValue: 0 },
    min_stock: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Inventory;
};
