const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/managersAuth')
const {createTask,getmanagersTasks,getTask} = require('../controller/TaskController')
const router = express.Router();
const {protectRoute} = require('../middleware/authMiddleware')


router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);

  


router.post("/createtask",protectRoute,createTask);
router.post('/getTasks',protectRoute,getmanagersTasks);
router.get("/getTask",getTask);

module.exports = router;