const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/ManagersAuth')
const router = express.Router();

router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);

module.exports = router;