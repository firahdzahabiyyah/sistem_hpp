const express = require('express');
const router = express.Router();
const controller = require('../controllers/dailySaleController');
router.use('/', controller);
module.exports = router;
