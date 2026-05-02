const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientController');
router.use('/', controller);
module.exports = router;
