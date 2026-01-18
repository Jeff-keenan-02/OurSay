const express = require('express');
const router = express.Router();
const controller = require('../controllers/discussion.controller');

// Categories
router.get('/categories', controller.getCategories);

// Lists
router.get('/trending', controller.getTrending);
router.get('/by-category/:categoryId', controller.getByCategory);

// ⚠️ MUST be last
router.get('/:id', controller.getDiscussion);

// Interactions
router.post('/:id/comments', controller.postComment);
router.post('/:id/vote', controller.voteDiscussion);

module.exports = router;