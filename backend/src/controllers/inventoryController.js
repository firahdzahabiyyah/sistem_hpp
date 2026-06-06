const express = require('express');
const router = express.Router();
const service = require('../services/inventoryService');

router.get('/', async (req, res) => {
  try {
    const items = await service.listInventory();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const result = await service.createOrUpdateInventory(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await service.deleteInventory(req.params.id);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/forecast', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Parameter date wajib diisi' });
    const result = await service.getForecast(date);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
