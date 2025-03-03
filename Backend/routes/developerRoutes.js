const express = require('express');
const router = express.Router();
const { DeveloperSignUp, DeveloperSignIn } = require('../controller/developerAuth');
const {getDevelopersTask} = require('../controller/TaskController');
const { protectRoute } = require('../middleware/authMiddleware');
router.post('/signup', DeveloperSignUp);
router.post('/signin', DeveloperSignIn);


router.post('/myTask',protectRoute,getDevelopersTask);
  

module.exports = router;