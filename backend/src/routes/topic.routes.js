const express = require('express');
const router = express.Router();
const controller = require('../controllers/topic.controller');

// routes/topic.routes.js
router.get("/", controller.getTopics);

module.exports = router;