module.exports = (sequelize, DataTypes) => {
  const Labor = sequelize.define('Labor', {
    employee_name: DataTypes.STRING,
    salary: { type: DataTypes.FLOAT, defaultValue: 0 },
    work_days: { type: DataTypes.INTEGER, defaultValue: 1 },
    cost_per_day: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Labor;
};
