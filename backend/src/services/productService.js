const { Product, ProductDetail, Ingredient, Recipe } = require('../models');

function computeCostPrice(detail) {
  const usage = parseFloat(detail.usage) || 0;
  const net = parseFloat(detail.net_weight) || 0;
  const price = parseFloat(detail.price) || 0;
  return net > 0 ? (usage / net) * price : 0;
}

async function listProducts() {
  try{
    return await Product.findAll({ include: ['details'] });
  }catch(err){
    console.error('productService.listProducts error', err)
    return [];
  }
}

async function createProduct({ name, details }) {
  if (!name) throw new Error('name is required');
  if (!Array.isArray(details)) details = [];

  // accept portions if provided
  const portions = parseInt(arguments[0].portions) || 1
  const product = await Product.create({ name, portions });
  let total = 0;
  for (const d of details) {
    try {
      const cost_price = computeCostPrice(d);
      total += cost_price;
      await ProductDetail.create({ ...d, cost_price, productId: product.id });
    } catch (inner) {
      console.error('createProduct - detail error', inner, d);
    }
  }
  product.total_food_cost = total;
  await product.save();
  // return plain JSON to avoid serializing Sequelize instances with circular refs
  return { product: product.toJSON(), total };
}

module.exports = { listProducts, createProduct, computeCostPrice };
