const express = require("express");
const router = express.Router();

const controller = require("../controllers/analytics.controller");
const requireAuth = require("../middleware/auth.middleware");

router.get("/polls", requireAuth, controller.getPolls);
router.get("/polls/:pollId", requireAuth, controller.getPollResults);

router.get("/petitions", requireAuth, controller.getPetitions);
router.get("/petitions/:petitionId", requireAuth, controller.getPetitionResults);

module.exports = router;