const express = require('express');
const router = express.Router();
const controller = require('../controllers/overheadController');
router.use('/', controller);
module.exports = router;
