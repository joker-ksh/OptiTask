const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/ManagersAuth')
const {createTask} = require('../controller/TaskController')
const router = express.Router();
const {protectRoute} = require('../middleware/authMiddleware')


router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);

  

// Add protectRoute before any route that requires authentication
router.post("/createtask",protectRoute,createTask);

module.exports = router;