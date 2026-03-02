const express = require('express');
const router = express.Router();
const controller = require('../controllers/discussion.controller');
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");


// Lists
router.get('/trending', requireAuth, controller.getTrending);
router.get('/by-topic/:topicId', requireAuth, controller.getDisscussionByTopic);

router.get('/weekly',requireAuth, controller.getWeeklyDiscussion);

// Interactions
router.post('/:id/comments',requireAuth, requireTier(2), controller.postComment);
router.post('/:id/vote', requireAuth, controller.voteDiscussion);

// ⚠️ MUST be last
router.get('/:id', requireAuth, controller.getDiscussion);

module.exports = router;