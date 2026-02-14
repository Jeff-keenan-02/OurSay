const express = require('express');
const router = express.Router();
const controller = require('../controllers/poll.controller');

// Weekly (special case)
router.get('/weekly', controller.getWeeklyPoll);

// GET /poll/trending
router.get("/trending", controller.getTrendingPoll);

// Poll groups under a topic
router.get('/topics/:topicId/groups', controller.getPollGroupsByTopic);

// Polls under a group
router.get('/groups/:pollGroupId/polls', controller.getPollsByGroup);

// Vote on a poll
router.post('/:id/vote', controller.votePoll);

module.exports = router;