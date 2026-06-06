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

async function createProduct({ name, details, portions = 1 }) {
  if (!name) throw new Error('name is required');
  if (!Array.isArray(details)) details = [];

  const portionsInt = parseInt(portions) || 1;
  const product = await Product.create({ name, portions: portionsInt });
  let total = 0;
  
  console.log('Creating product:', { name, portions: portionsInt, detailsCount: details.length });
  
  for (const d of details) {
    try {
      const detailData = {
        name: d.name || '',
        usage: parseFloat(d.usage) || 0,
        unit: d.unit || '',
        net_weight: parseFloat(d.net_weight) || 0,
        gross_weight: parseFloat(d.gross_weight) || 0,
        price: parseFloat(d.price) || 0,
        cost_price: 0,
        productId: product.id
      };
      detailData.cost_price = computeCostPrice(detailData);
      total += detailData.cost_price;
      
      const created = await ProductDetail.create(detailData);
      console.log('Created ProductDetail:', created.id, detailData.name);
    } catch (inner) {
      console.error('createProduct - detail error', inner, d);
    }
  }
  product.total_food_cost = total;
  await product.save();
  console.log('Product created with ID:', product.id, 'total_food_cost:', total);
  return { product: product.toJSON(), total };
}

module.exports = { listProducts, createProduct, computeCostPrice };
