const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/managersAuth')
const {createTask,getmanagersTasks,getTask,deleteTask} = require('../controller/TaskController')

const router = express.Router();
const {protectRoute} = require('../middleware/authMiddleware')


router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);

  


router.post("/createtask",protectRoute,createTask);
router.post('/getTasks',protectRoute,getmanagersTasks);
router.post("/getTask",getTask);
router.post('/deleteTask',deleteTask);

module.exports = router;