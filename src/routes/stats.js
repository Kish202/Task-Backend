const express = require('express');
const { getOverviewStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/overview', getOverviewStats);

module.exports = router;