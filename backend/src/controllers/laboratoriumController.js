const express = require('express');
const router = express.Router();
const service = require('../services/laboratoriumService');

router.post('/', async (req, res) => {
  try {
    const item = await service.createLaboratorium(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const items = await service.listLaboratorium();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await service.updateLaboratorium(req.params.id, req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await service.deleteLaboratorium(req.params.id);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;