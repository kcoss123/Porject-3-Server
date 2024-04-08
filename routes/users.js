const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const Company = require("../models/company");
const { Review } = require("../models/review");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        console.log("Received registration request");

        const { registrationType, firstName, lastName, username, email, password, confirmPassword, street, unit, city, state, zip, country, companyName, phone, category, about } = req.body;
        console.log("Request body:", req.body);

        // Check if all required fields are provided
        if (!registrationType || !firstName || !lastName || !username || !email || !password || !confirmPassword) {
            console.log("Missing required fields:", { registrationType, firstName, lastName, username, email, password, confirmPassword });
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Use regex to validate the email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            console.log("Invalid email format:", email);
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        // Check if the email is already registered
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            console.log("Email already registered:", email);
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Check password match
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed");

        let newUser;

        if (registrationType === "user") {
            // User registration
            console.log("Performing user registration");
            newUser = await User.create({
                registrationType,
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                street,
                unit,
                city,
                state,
                zip,
                country,
            });
        } else if (registrationType === "company") {
            // Company registration
            console.log("Performing company registration");
            console.log("Company registration details:", { companyName, phone, category, about, street, unit, city, state, zip, country });

            // Create new company
            newUser = await Company.create({
                registrationType,
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                companyName,
                phone,
                category,
                about,
                street,
                unit,
                city,
                state,
                zip,
                country,
            });
        } else {
            console.log("Invalid registration type:", registrationType);
            return res.status(400).json({ message: "Invalid registration type" });
        }

        console.log("User/Company successfully registered:", newUser);
        // Deconstruct the newly created user object to omit the password
        const { _id } = newUser;

        const payload = { _id, email, firstName, lastName, username };

        // Create and sign the token
        const authToken = jwt.sign(
            payload,
            process.env.SECRET,
            { algorithm: 'HS256', expiresIn: "1h" }
        );

        // Send a json response containing the user object and auth token
        res.status(201).json({ user: { _id, email, firstName, lastName, username }, authToken });
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            console.error("Validation Error:", err);
            return res.status(400).json({ message: "Validation Error", error: err });
        } else if (err.code === 11000) {
            console.error("Duplicate value error:", err);
            return res.status(400).json({ message: "Duplicate value", error: err });
        } else {
            // Log other errors
            console.error("Error registering user:", err);
            return res.status(500).json({ message: "Error encountered", error: err });
        }
    }
});

module.exports = router;
