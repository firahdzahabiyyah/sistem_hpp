const express = require('express');
const router = express.Router();
const service = require('../services/laborService');

router.post('/', async (req, res) => {
  try {
    const item = await service.createLabor(req.body);
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const items = await service.listLabor();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
