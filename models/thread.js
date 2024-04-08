const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    companyName: String,
    workorder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkOrder"
    },
    workorderName: String,
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    jobName: String,
    bid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid"
    }
}, { timestamps: true });

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
