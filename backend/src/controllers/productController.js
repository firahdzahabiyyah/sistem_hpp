const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const laborService = require('../services/laborService');
const overheadService = require('../services/overheadService');

router.get('/', async (req, res) => {
  try {
    const items = await productService.listProducts();
    res.json(items);
  } catch (err) { console.error('GET /api/products error', err); res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const result = await productService.createProduct(req.body);
    // return a stable JSON shape
    return res.json({ product: result.product, total: result.total });
  } catch (err) { console.error('POST /api/products error', err); res.status(400).json({ error: err.message }); }
});

router.get('/:id/hpp', async (req, res) => {
  try {
    const items = await productService.listProducts();
    const product = items.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Not found' });

    const food_cost = product.total_food_cost || 0;
    const labors = await laborService.listLabor();
    const overheads = await overheadService.listOverheads();
    const labor_daily = labors.reduce((s, l) => s + (l.cost_per_day||0), 0);
    const overhead_daily = overheads.reduce((s, o) => s + (o.cost_per_day||0), 0);
    // allocate labor and overhead per portion
    const portions = product.portions || 1;
    const total_daily = labor_daily + overhead_daily;
    const labor_per_portion = labor_daily / portions;
    const overhead_per_portion = overhead_daily / portions;
    const hpp_total = food_cost + labor_daily + overhead_daily;
    const hpp_per_portion = portions>0 ? hpp_total / portions : hpp_total;
    res.json({
      food_cost,
      labor_daily,
      overhead_daily,
      portions,
      labor_per_portion,
      overhead_per_portion,
      hpp_total,
      hpp: hpp_per_portion
    });
  } catch (err) { console.error('GET /api/products/:id/hpp error', err); res.status(500).json({ error: err.message }); }
});

module.exports = router;
