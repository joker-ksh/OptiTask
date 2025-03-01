const express = require('express');
const router = express.Router();
const { DeveloperSignUp, DeveloperSignIn } = require('../controller/developerAuth');

router.post('/signup', DeveloperSignUp);
router.post('/signin', DeveloperSignIn);

module.exports = router;