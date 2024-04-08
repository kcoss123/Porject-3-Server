const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const user = require("../models/user");
const company = require("../models/company");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password, registrationType } = req.body;

        let foundUser;

        // Determine whether to search in user or company model based on userType
        if (registrationType === 'user') {
            foundUser = await user.findOne({ username });
        } else if (registrationType === 'company') {
            foundUser = await company.findOne({ username });
        } else {
            return res.status(400).send("Invalid user type");
        }

        if (!foundUser) {
            // If user with given username doesn't exist, return error
            return res.status(400).send("Invalid username or password");
        }

        // Verify password
        const pwd = await bcrypt.compare(password, foundUser.password);
        if (!pwd) {
            return res.status(400).send("Invalid username or password");
        }

        // Generate token
        const token = jwt.sign(
            {
                user: foundUser.username,
                registrationType,
            },
            process.env.SECRET,
            {
                expiresIn: "24h",
            }
        );

        // Send response with token
        res.status(200).send({
            user: foundUser.username,
            token,
            registrationType,
        });
    } catch (err) {
        return res.status(500).send("Server error. Please try again later");
    }
});

router.get('/verify', isAuthenticated, (req, res, next) => {
    res.status(201).json(req.user);
});

module.exports = router;
