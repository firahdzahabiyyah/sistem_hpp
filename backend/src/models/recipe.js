module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    name: { type: DataTypes.STRING, allowNull: false },
    total_cost: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Recipe;
};
