const express = require('express');
const router = express.Router();
const controller = require('../controllers/laborController');
router.use('/', controller);
module.exports = router;
