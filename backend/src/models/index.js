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

// Associations
Recipe.hasMany(RecipeDetail, { as: 'details', foreignKey: 'recipeId' });
RecipeDetail.belongsTo(Recipe, { foreignKey: 'recipeId' });
RecipeDetail.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Product.hasMany(ProductDetail, { as: 'details', foreignKey: 'productId' });
ProductDetail.belongsTo(Product, { foreignKey: 'productId' });
ProductDetail.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

module.exports = {
  sequelize,
  Sequelize,
  Ingredient,
  Recipe,
  RecipeDetail,
  Product,
  ProductDetail,
  Labor,
  Overhead
};
