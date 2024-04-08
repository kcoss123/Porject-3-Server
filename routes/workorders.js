const { user } = require("../models/user");
const { company } = require("../models/company");
const { WorkOrder } = require("../models/workorder");
const { Thread } = require("../models/thread");
const { Message } = require("../models/message");
const express = require("express");
const multer = require("multer");
const router = express.Router();

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
    const user = await user.findOne({ username: req.body.username });
    const orders = await WorkOrder.find({ user: user.id });
    if (orders.length) {
        res.status(200).send(orders);
    } else {
        res.status(200).send();
    }
})

// add new workorder
router.post("/addworkorder", upload.array("files", 5), async (req, res) => {
    const user = await user.findOne({ username: req.body.username });
    const company = await Company.findOne({ companyName: req.body.companyName });
    var media;
    // console.log(req.body.files);
    if (req.body.files) {   // FIXME
        media = req.body.files.map((file) => {
            return {data: Buffer.from(file.buffer, "base64"), contentType: file.mimetype};
        })
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

    await order.save().then(order => {
    }).catch(error => {
        res.status(400).send(error);
    })
    await thread.save().then(order => {
        res.status(200).send(order);
    }).catch(error => {
        res.status(400).send(error);
    })
})

// retrieve workorder messages
router.post("/workordermessages", async (req, res) => {
    const thread = await Thread.findOne({ workorder: req.body.orderId });
    const messages = await Message.find({ thread: thread.id }).sort({ timestamp: 1 });
    const data = {
        messages: messages,
        workorderName: thread.workorderName,
    }
    try {
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/addworkordermessage", async (req, res) => {
    const thread = await Thread.findOne({ workorder: req.body.orderId });
    let msg = new Message({
        content: {
            text: req.body.newMsg,
        },
        thread: thread.id,
        sender: req.body.username,
    })
    await msg.save().then(msg => {
        res.status(200).send(msg);
    }).catch(error => {
        res.status(400).send(error);
    })
    return;
})

router.post("/deleteworkorder", async (req, res) => {
    try {
        const thread = await Thread.findOne({ workorder: req.body.orderId });
        await Message.deleteMany({ thread: thread.id });
        await Thread.findByIdAndDelete(thread.id);
        await WorkOrder.findByIdAndDelete(req.body.orderId);
        res.status(200).send();
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router;