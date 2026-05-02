const express = require('express');
const router = express.Router();
const service = require('../services/overheadService');

router.post('/', async (req, res) => {
  try {
    const item = await service.createOverhead(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const items = await service.listOverheads();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
