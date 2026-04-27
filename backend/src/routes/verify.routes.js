const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require("../controllers/verify.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireTier = require("../middleware/tier.middleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post('/liveness/session', requireAuth, controller.createLivenessSession);
router.post('/liveness/confirm', requireAuth, controller.confirmLiveness);


router.post('/passport', requireAuth, requireTier(1),  upload.single('file'), controller.verifyPassport);


router.post('/residence', requireAuth, requireTier(2), controller.verifyResidence);

router.get("/summary", requireAuth, controller.getVerificationSummary);



module.exports = router;




// research part requriement anaylsis part 
// valuation startegy 
// code qualtitiy or calarity 
