const express = require('express');
const router = express.Router();
const { DeveloperSignUp, DeveloperSignIn } = require('../controller/developerAuth');
const { protectRoute } = require('../middleware/authMiddleware');
router.post('/signup', DeveloperSignUp);
router.post('/signin', DeveloperSignIn);


// Protected routes (Only authenticated users can access)
router.get("/dashboard", protectRoute, (req, res) => {
    res.json({ message: `Welcome ${req.user.email}, you are authenticated!` });
});
  

// Add protectRoute before any route that requires authentication
router.post("/createtask", protectRoute, (req, res) => {
    res.json({ message: "Task created successfully!" });
});
module.exports = router;