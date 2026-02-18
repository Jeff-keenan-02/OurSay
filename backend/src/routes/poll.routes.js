const express = require('express');
const router = express.Router();
const controller = require("../controllers/poll.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");

// Weekly (special case)
router.get('/weekly', requireAuth, controller.getWeeklyPoll);

// GET /poll/trending
router.get("/trending", requireAuth, controller.getTrendingPoll);

// Poll groups under a topic
router.get('/topics/:topicId/groups', requireAuth, controller.getPollGroupsByTopic);

// Polls under a group
router.get('/groups/:pollGroupId/polls', requireAuth, controller.getPollsByGroup);

// Vote on a poll
router.post('/:id/vote', requireAuth, controller.votePoll);

module.exports = router;