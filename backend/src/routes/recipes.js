const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipeController');
router.use('/', controller);
module.exports = router;
