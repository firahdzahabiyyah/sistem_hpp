const express = require('express');
const router = express.Router();
const service = require('../services/ingredientService');

router.get('/', async (req, res) => {
  try {
    const items = await service.listIngredients();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const item = await service.createIngredient(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
