const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    companyUser: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        trim: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    jobName: {
        type: String,
        trim: true
    },
    quote: {
        type: Number,
        required: true,
        min: 0 // Ensure quote is a non-negative number
    },
    description: {
        type: String,
        trim: true
    },
    accepted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Bid = mongoose.model("Bid", bidSchema);

module.exports = Bid;