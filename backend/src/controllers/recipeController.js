const express = require('express');
const router = express.Router();
const service = require('../services/recipeService');

router.get('/', async (req, res) => {
  try {
    const items = await service.listRecipes();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const result = await service.createRecipe(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
