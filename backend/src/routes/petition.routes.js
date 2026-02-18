const express = require("express");
const router = express.Router();
const controller = require("../controllers/petition.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");


// Weekly
router.get("/weekly", requireAuth, controller.getWeeklyPetition);

// Trending
router.get("/trending", requireAuth, controller.getTrendingPetition);

// Lists (must be before :id)
router.get("/topics/:id", requireAuth, controller.getPetitionsByTopic);

// Single petition
router.get("/:id", requireAuth, controller.getPetition);

// Sign
router.post("/:id/sign",  requireAuth, controller.signPetition);

module.exports = router;