const mongoose = require("mongoose");

// Define a schema for the message content
const contentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    media: {
        data: Buffer,
        contentType: String,
    },
});

// Define the message schema
const messageSchema = new mongoose.Schema({
    content: {
        type: contentSchema,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Create the Message model using the schema
const Message = mongoose.model("Message", messageSchema);

// Export the Message model
module.exports = Message;