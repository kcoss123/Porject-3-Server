const mongoose = require("mongoose");

// Define Review schema
const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

// Create Review model
const Review = mongoose.model("Review", reviewSchema);

// Export Review model
module.exports = Review;