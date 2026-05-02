module.exports = (sequelize, DataTypes) => {
  const Overhead = sequelize.define('Overhead', {
    name: DataTypes.STRING,
    total_cost: { type: DataTypes.FLOAT, defaultValue: 0 },
    duration_days: { type: DataTypes.INTEGER, defaultValue: 1 },
    cost_per_day: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Overhead;
};
