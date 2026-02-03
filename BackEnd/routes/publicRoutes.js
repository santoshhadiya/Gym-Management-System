// backend/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const { getHomeData } = require('../controllers/publicController');

router.get('/home-data', getHomeData);

module.exports = router;