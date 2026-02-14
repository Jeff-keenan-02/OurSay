const express = require('express');
const router = express.Router();
const controller = require('../controllers/discussion.controller');

// Lists
router.get('/trending', controller.getTrending);
router.get('/by-topic/:topicId', controller.getDisscussionByTopic);

router.get('/weekly', controller.getWeeklyDiscussion);

// Interactions
router.post('/:id/comments', controller.postComment);
router.post('/:id/vote', controller.voteDiscussion);

// ⚠️ MUST be last
router.get('/:id', controller.getDiscussion);

module.exports = router;