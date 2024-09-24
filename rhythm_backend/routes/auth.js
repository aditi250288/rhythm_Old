const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helpers");

// Register route
router.post("/register", async (req, res) => {
    try {
        const { email, password, firstName, lastName, username } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res
                .status(409)
                .json({ error: "A user with this email already exists" });
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
            return res
                .status(409)
                .json({ error: "This username is already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUserData = {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            username,
        };
        const newUser = await User.create(newUserData);

        // Generate token
        const token = await getToken(newUser);
        console.log("geterated Token:", token);

        // Prepare user object to return
        const userToReturn = { ...newUser.toJSON(), token };
        delete userToReturn.password;

        return res.status(201).json(userToReturn);
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = await getToken(user);

        // Prepare user object to return
        const userToReturn = { ...user.toJSON(), token };
        delete userToReturn.password;

        return res.status(200).json(userToReturn);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;