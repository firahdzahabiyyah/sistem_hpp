module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    name: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING },
    net_weight: { type: DataTypes.FLOAT, defaultValue: 0 },
    gross_weight: { type: DataTypes.FLOAT, defaultValue: 0 },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    type: { type: DataTypes.STRING, defaultValue: 'raw' }
  });
  return Ingredient;
};
