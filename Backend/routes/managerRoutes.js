const express = require('express');
const { ManagerSignUp,ManagerSignIn} = require('../controller/ManagersAuth')
const router = express.Router();
const {protectRoute} = require('../middleware/authMiddleware')


router.post('/signup', ManagerSignUp);
router.post('/signin', ManagerSignIn);


// Protected routes (Only authenticated users can access)
router.get("/dashboard", protectRoute, (req, res) => {
    res.json({ message: `Welcome ${req.user.email}, you are authenticated!` });
});
  

// Add protectRoute before any route that requires authentication
router.post("/createtask", protectRoute, (req, res) => {
    res.json({ message: "Task created successfully!" });
});

module.exports = router;