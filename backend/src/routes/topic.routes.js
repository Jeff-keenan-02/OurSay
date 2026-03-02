const express = require('express');
const router = express.Router();
const controller = require("../controllers/topic.controller");
const requireAuth = require("../middleware/auth.middleware");


/* --------------------------------------------------
   Production Route
-------------------------------------------------- */

router.get("/", requireAuth, controller.getTopics);