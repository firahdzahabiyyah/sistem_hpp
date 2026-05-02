const express = require('express');
const router = express.Router();
const controller = require('../controllers/laboratoriumController');
router.use('/', controller);
module.exports = router;