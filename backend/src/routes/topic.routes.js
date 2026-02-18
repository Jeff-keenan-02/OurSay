const express = require('express');
const router = express.Router();
const controller = require("../controllers/topic.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");

// routes/topic.routes.js
router.get("/", requireAuth, controller.getTopics);

module.exports = router;