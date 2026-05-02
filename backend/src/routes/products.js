const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
router.use('/', controller);
module.exports = router;
