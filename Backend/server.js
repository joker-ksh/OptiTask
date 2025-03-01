const express = require('express');
const app = express();
const cors = require('cors');
const managerRoutes = require('./routes/managerRoutes');
const dotenv = require('dotenv');
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

//routes
app.use('/manager',managerRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("Welcome to Firebase Auth API");
});

app.listen(5000,() => {
    console.log('Server is running on port 5000');
})