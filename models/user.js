const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    registrationType: {
        type: String,
        required: true,
        enum: ["user", "company"] // Ensure the value is either "user" or "company"
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: false,
        },
        unit: {
            type: String,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
        },
        zip: {
            type: Number,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const user = mongoose.model("user", userSchema);

module.exports = user;
