const { Ingredient } = require('../models');

async function listIngredients() {
  return Ingredient.findAll();
}

async function createIngredient(data) {
  if (!data.name) throw new Error('name is required');
  const item = await Ingredient.create(data);
  return item;
}

module.exports = { listIngredients, createIngredient };
