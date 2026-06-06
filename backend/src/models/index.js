const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../../../data/database.sqlite'),
  logging: false
});

const Ingredient = require('./ingredient')(sequelize, DataTypes);
const Recipe = require('./recipe')(sequelize, DataTypes);
const RecipeDetail = require('./recipeDetail')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const ProductDetail = require('./productDetail')(sequelize, DataTypes);
const Labor = require('./labor')(sequelize, DataTypes);
const Overhead = require('./overhead')(sequelize, DataTypes);
const DailySale = require('./dailySale')(sequelize, DataTypes);
const Inventory = require('./inventory')(sequelize, DataTypes);

// Associations
Recipe.hasMany(RecipeDetail, { as: 'details', foreignKey: 'recipeId' });
RecipeDetail.belongsTo(Recipe, { foreignKey: 'recipeId' });

Product.hasMany(ProductDetail, { as: 'details', foreignKey: 'productId' });
ProductDetail.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(DailySale, { foreignKey: 'productId' });
DailySale.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  Sequelize,
  Ingredient,
  Recipe,
  RecipeDetail,
  Product,
  ProductDetail,
  Labor,
  Overhead,
  DailySale,
  Inventory
};
