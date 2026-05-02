module.exports = (sequelize, DataTypes) => {
  const Laboratorium = sequelize.define('Laboratorium', {
    name: DataTypes.STRING,
    unit: DataTypes.STRING,
    quantity: { type: DataTypes.FLOAT, defaultValue: 0 },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    total_cost: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Laboratorium;
};