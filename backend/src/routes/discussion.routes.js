const express = require('express');
const router = express.Router();
const controller = require('../controllers/discussion.controller');

// Lists
router.get('/trending', controller.getTrending);
router.get('/by-topic/:topicId', controller.getDisscussionByTopic);

router.get('/weekly', controller.getWeeklyDiscussion);

// ⚠️ MUST be last
router.get('/:id', controller.getDiscussion);

// Interactions
router.post('/:id/comments', controller.postComment);
router.post('/:id/vote', controller.voteDiscussion);

module.exports = router;