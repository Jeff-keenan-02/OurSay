const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/verify.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/verify-passport', upload.single('file'), controller.verifyPassport);

router.post('/verify-liveness', upload.single('video'), controller.verifyLiveness);

router.post('/verify-residence', controller.verifyResidence);

module.exports = router;