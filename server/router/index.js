const express = require('express');
const router = express.Router();

router.use('/api/v1', require('./api'));
router.use('/api/v1/resources', express.static('./uploads'));

module.exports = router;
