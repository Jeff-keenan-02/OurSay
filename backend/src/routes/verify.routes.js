const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require("../controllers/verify.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post('/liveness', requireAuth, requireTier(0), upload.single('file'), controller.verifyLiveness);


router.post('/passport', requireAuth, requireTier(1),  upload.single('file'), controller.verifyPassport);


router.post('/residence', requireAuth, requireTier(2), controller.verifyResidence);

module.exports = router;
