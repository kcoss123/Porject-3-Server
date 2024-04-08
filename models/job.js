const mongoose = require("mongoose");

// Define job schema
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    userMedia: [{
        data: Buffer,
        contentType: String,
    }],
    companyMedia: [{
        data: Buffer,
        contentType: String,
    }],
    accepted: {
        type: Boolean,
        required: true,
        default: false,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    marketplace: {
        type: Boolean,
        required: true,
        default: false,
    },
    private: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    }],
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
    }],
    companyName: {
        type: String,
    },
    companyUser: {
        type: String,
    },
    quote: {
        type: Number,
    },
    bidDesc: {
        type: String,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
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

// Create Job model
const Job = mongoose.model("Job", jobSchema);

module.exports = Job;