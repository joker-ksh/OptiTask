const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/ManagersAuth')
const {createTask,getmanagersTasks} = require('../controller/TaskController')
const router = express.Router();
const {protectRoute} = require('../middleware/authMiddleware')


router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);

  


router.post("/createtask",protectRoute,createTask);

router.post('/getTasks',protectRoute,getmanagersTasks);
module.exports = router;