const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const user = require('../models/user'); // Changed variable name to avoid conflicts

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

// List all jobs for logged in user
router.post("/jobs", async (req, res) => {
    try {
        let jobs = [], bids = [];
        if (req.body.username) {
            const foundUser = await user.findOne({ username: req.body.username }); // Changed variable name
            jobs = await job.find({ user: foundUser.id });
        } else if (req.body.company) {
            const company = await company.findOne({ username: req.body.company });
            jobs = await job.find({ company: company.id });
            bids = await bid.find({ company: company.id });
        }
        const data = {
            jobs: jobs,
            bids: bids,
        };
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Get specific job
router.post("/getjob", async (req, res) => {
    try {
        const job = await job.findById(req.body.jobid);
        const foundUser = await user.findById(job.user); // Changed variable name
        let bid, bids;
        if (req.body.company) {
            const company = await company.findOne({ username: req.body.company });
            bid = await bid.findOne({ company: company.id, job: job.id });
        }
        if (req.body.username) {
            bids = await bid.find({ job: job.id });
        }
        const data = {
            job: job,
            user: foundUser, // Changed variable name
            bid: bid,
            bids: bids,
        };
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Delete job
router.post("/deletejob", async (req, res) => {
    try {
        const thread = await Thread.findOne({ job: req.body.jobid });
        await Promise.all([
            Bid.deleteMany({ job: req.body.jobid }),
            message.deleteMany({ thread: thread.id }),
            thread.findByIdAndDelete(thread.id),
            job.findByIdAndDelete(req.body.jobid),
        ]);
        res.status(200).send();
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Create job endpoint
router.post("/createjob", upload.array("files", 5), async (req, res) => {
    try {
        // Validate request body
        if (!req.body.title || !req.body.desc || !req.body.category) {
            return res.status(400).send({ error: "Missing required fields." });
        }

        // Find user by username
        const foundUser = await user.findOne({ username: req.body.username }); // Changed variable name
        if (!foundUser) {
            return res.status(400).send({ error: "User not found." });
        }

        // Process files
        let media = [];
        if (req.body.files && req.files.length > 0) {
            media = req.files.map((file) => ({
                data: Buffer.from(file.buffer, "base64"),
                contentType: file.mimetype,
            }));
        }

        // Process handymen
        let handymen = [];
        if (req.body.handymen && req.body.handymen.length > 0) {
            handymen = await Promise.all(req.body.handymen.map(async (handyman) => {
                const company = await company.findOne({ username: handyman.username });
                return company ? company.id : null;
            }));
        }

        // Create job
        const job = new job({
            title: req.body.title,
            description: req.body.desc,
            category: req.body.category,
            userMedia: media,
            user: foundUser.id, 
            marketplace: Boolean(req.body.bid),
            private: handymen.filter(id => id), 
        });
        await job.save();

        // Create threads
        await Promise.all(handymen.map(async (companyId) => {
            const thread = new thread({
                title: req.body.title,
                user: foundUser.id, 
                company: companyId,
                username: foundUser.username, 
                companyName: req.body.handymen.find((h) => h.company === companyId)?.companyName || "",
                job: job.id,
                jobName: job.title,
            });
            await thread.save();
        }));

        // Log success
        console.log("Job created successfully:", job);

        // Send response
        res.status(200).send(job);
    } catch (error) {
        // Log error
        console.error("Error creating job:", error);

        // Send error response
        res.status(500).send({ error: "An error occurred while processing the request." });
    }
});

// Retrieve job messages
router.post("/jobmessages", async (req, res) => {
    try {
        const thread = await thread.findOne({ job: req.body.jobid });
        const job = await job.findById(req.body.jobid);
        const user = await user.findById(job.user);
        const company = await company.findOne({ username: req.body.company });
        let messages = await Message.find({ thread: thread.id }).sort({ timestamp: 1 });
        if (!messages.length) {
            const newThread = new thread({
                title: job.title,
                user: job.user,
                username: user.username,
                company: company.id,
                companyName: company.companyName,
                job: job.id,
                jobName: job.title,
            });
            await newThread.save();
            messages = await message.find({ thread: newThread.id }).sort({ timestamp: 1 });
        }
        const data = {
            messages: messages,
            jobname: thread.jobName,
            job: job,
        };
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Add message
router.post("/addjobmessage", async (req, res) => {
    try {
        const company = await company.findOne({ username: req.body.company });
        const thread = await thread.findOne({ job: req.body.jobid, company: company.id });
        const sender = req.body.username ? req.body.username : req.body.company;
        const msg = new message({
            content: {
                text: req.body.newMsg,
            },
            thread: thread.id,
            sender: sender,
        });
        await msg.save();
        res.status(200).send(msg);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Add bid
router.post("/addbid", async (req, res) => {
    try {
        const company = await company.findOne({ username: req.body.company });
        const job = await job.findById(req.body.jobid);
        const bid = new bid({
            company: company.id,
            companyUser: company.username,
            companyName: company.companyName,
            job: req.body.jobid,
            jobName: job.title,
            quote: req.body.price,
            description: req.body.desc,
        });
        await bid.save();
        res.status(200).send(bid);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Accept bid
router.post("/acceptbid", async (req, res) => {
    try {
        const bid = await bid.findById(req.body.acceptbid);
        bid.accepted = true;
        await bid.save();
        const job = await Job.findById(bid.job);
        job.marketplace = false;
        job.companyName = bid.companyName;
        job.company = bid.company;
        job.companyUser = bid.companyUser;
        job.quote = bid.quote;
        job.bidDesc = bid.description;
        job.bids = [];
        job.accepted = true;
        await Promise.all([
            bid.deleteMany({ job: job.id }),
            job.save(),
        ]);
        res.status(200).send(bid);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Delete bid
router.post("/deletebid", async (req, res) => {
    try {
        const bid = await bid.findByIdAndDelete(req.body.bid._id);
        res.status(200).send(bid);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

// Get marketplace
router.post("/marketplace", async (req, res) => {
    try {
        const company = await company.findOne({ username: req.body.company });
        const jobs = await Job.find({ marketplace: true, accepted: false, category: company.category });
        const data = {
            jobs: jobs,
        };
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send({ error: "An error occurred." });
    }
});

module.exports = router;