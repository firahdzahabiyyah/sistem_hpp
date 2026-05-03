const { Recipe, RecipeDetail, Ingredient } = require('../models');

function computeCostPrice(detail) {
  const usage = parseFloat(detail.usage) || 0;
  const net = parseFloat(detail.net_weight) || 0;
  const price = parseFloat(detail.price) || 0;
  return net > 0 ? (usage / net) * price : 0;
}

async function listRecipes() {
  return Recipe.findAll({ include: ['details'] });
}

async function createRecipe({ name, details }) {
  if (!name) throw new Error('name is required');
  if (!Array.isArray(details)) details = [];

  const recipe = await Recipe.create({ name });
  let total = 0;
  for (const d of details) {
    const cost_price = computeCostPrice(d);
    total += cost_price;
    await RecipeDetail.create({ ...d, cost_price, recipeId: recipe.id });
  }
  recipe.total_cost = total;
  await recipe.save();

  // save as pre_recipe ingredient
  await Ingredient.create({ name: recipe.name, price: total, type: 'pre_recipe' });

  return { recipe, total };
}

async function getRecipeById(id) {
  const recipe = await Recipe.findByPk(id, { include: ['details'] });
  if (!recipe) throw new Error('Recipe not found');
  return recipe;
}

module.exports = { listRecipes, createRecipe, getRecipeById, computeCostPrice };
