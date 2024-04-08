const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    registrationType: {
        type: String,
        required: true,
        enum: ["user", "company"] // Ensure the value is either "user" or "company"
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
        unique: false,
        match: /^[0-9]{10}$/,
    },
    category: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: false,
    },
    address: {
        street: {
            type: String,
            required: false,
        },
        unit: String,
        city: {
            type: String,
            required: false,
        },
        state: String,
        zip: {
            type: String,
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
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid"
    }],
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Create Company model
const company = mongoose.model("company", companySchema);

module.exports = company;