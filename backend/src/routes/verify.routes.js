const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require("../controllers/verify.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post('/verify-passport', requireAuth, upload.single('file'), controller.verifyPassport);

router.post('/verify-liveness', requireAuth, upload.single('file'), controller.verifyLiveness);

router.post('/verify-residence', requireAuth, controller.verifyResidence);

module.exports = router;