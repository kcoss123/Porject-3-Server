const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
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
        default: false,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
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

// Indexes
workOrderSchema.index({ user: 1, createdAt: -1 });

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);

module.exports = WorkOrder;