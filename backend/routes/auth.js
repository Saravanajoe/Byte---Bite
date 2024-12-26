const express = require("express");
const router = express.Router();
const User = require("../models/user");

// User login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: `Welcome ${user.role}!`, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
