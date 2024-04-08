const express = require("express");
const multer = require("multer");
const path = require("path"); // Import the 'path' module

const router = express.Router();

const User = require("../models/user"); 
const Company = require("../models/company"); 
const WorkOrder = require("../models/workorder");
const Thread = require("../models/thread");
const Message = require("../models/message");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

// list all workorders for logged in user
router.post("/workorders", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) throw new Error("User not found");

        const orders = await WorkOrder.find({ user: user.id });
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// add new workorder
router.post("/addworkorder", upload.array("files", 5), async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) throw new Error("User not found");

        const company = await Company.findOne({ companyName: req.body.companyName });
        if (!company) throw new Error("Company not found");

        let media;
        if (req.body.files) {
            media = req.body.files.map((file) => {
                return { data: Buffer.from(file.buffer, "base64"), contentType: file.mimetype };
            });
        }

        let order = new WorkOrder({
            title: req.body.title,
            description: req.body.desc,
            userMedia: media,
            user: user.id,
            company: company.id,
            companyName: req.body.companyName,
        });

        let thread = new Thread({
            title: req.body.title,
            user: user.id,
            company: company.id,
            workorder: order.id,
            workorderName: order.title,
        });

        await order.save();
        await thread.save();

        res.status(200).send(thread);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// retrieve workorder messages
router.post("/workordermessages", async (req, res) => {
    try {
        const thread = await Thread.findOne({ workorder: req.body.orderId });
        const messages = await Message.find({ thread: thread.id }).sort({ timestamp: 1 });
        const data = {
            messages: messages,
            workorderName: thread.workorderName,
        };
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post("/addworkordermessage", async (req, res) => {
    try {
        const thread = await Thread.findOne({ workorder: req.body.orderId });
        let msg = new Message({
            content: {
                text: req.body.newMsg,
            },
            thread: thread.id,
            sender: req.body.username,
        });
        await msg.save();
        res.status(200).send(msg);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post("/deleteworkorder", async (req, res) => {
    try {
        const thread = await Thread.findOne({ workorder: req.body.orderId });
        await Message.deleteMany({ thread: thread.id });
        await Thread.findByIdAndDelete(thread.id);
        await WorkOrder.findByIdAndDelete(req.body.orderId);
        res.status(200).send();
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
