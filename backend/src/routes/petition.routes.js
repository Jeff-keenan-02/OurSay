const express = require("express");
const router = express.Router();
const controller = require("../controllers/petition.controller");


// Weekly
router.get("/weekly", controller.getWeeklyPetition);

// Trending
router.get("/trending", controller.getTrendingPetition);

// Lists
router.get("/topics/:id", controller.getPetitionsByTopic);

// Single petition
router.get("/:id", controller.getPetition);

// Sign
router.post("/:id/sign", controller.signPetition);

module.exports = router;