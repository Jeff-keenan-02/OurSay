const express = require('express');
const router = express.Router();
const controller = require('../controllers/poll.controller');

router.get('/weekly-poll', controller.getWeeklyPoll);
router.get('/poll-topics', controller.getPollTopics);
router.get('/polls-by-topic/:topicId', controller.getPollsByTopic);

router.post('/polls/:id/vote', controller.votePoll);
router.get('/poll-topic-progress/:topicId', controller.getProgress);
router.post('/poll-topic-progress/:topicId/update', controller.updateProgress);

module.exports = router;