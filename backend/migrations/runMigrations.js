const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/models');

(async () => {
  await sequelize.sync({ alter: true });
  console.log('Migrations applied (sequelize.sync alter).');
  process.exit(0);
})();
