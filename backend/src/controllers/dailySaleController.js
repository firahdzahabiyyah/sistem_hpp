const express = require('express');
const router = express.Router();
const service = require('../services/dailySaleService');

router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const items = await service.listSales(date);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const result = await service.createSale(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/summary', async (req, res) => {
  try {
    const { date } = req.query;
    const result = await service.getSalesSummary(date);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', async (req, res) => {
  try {
    const result = await service.getSalesHistory();
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await service.deleteSale(req.params.id);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
