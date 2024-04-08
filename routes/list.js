const express = require("express");
const router = express.Router();
const company = require("../models/company");
const user = require("../models/user");
const { Thread } = require("../models/thread");

// Endpoint to list companies based on location and category
router.post("/list", async (req, res) => {
    let result = [];
    let query = {};

    if (req.body.location === "zip") {
        query.zip = Number(req.body.locDetails);
    } else if (req.body.location === "city") {
        query.city = req.body.locDetails;
    } else if (req.body.location === "state") {
        query.state = req.body.locDetails;
    }

    if (req.body.category !== "all") {
        query.category = req.body.category;
    }

    result = await company.find(query);

    res.status(200).send(result);
});

// Endpoint to get all companies' names
router.post("/getcompanies", async (req, res) => {
    const companies = await company.find({}, 'companyName');
    const companyNames = companies.map(company => company.companyName);
    res.status(200).send(companyNames);
});

// Endpoint to search for a handyman
router.post("/gethandyman", async (req, res) => {
    const company = await company.find({ username: req.body.search });
    const data = {
        handyman: company.length ? company : [],
        error: company.length ? "false" : req.body.search
    };
    res.status(200).send(data);
});

// Endpoint to retrieve user or company threads
router.post("/inbox", async (req, res) => {
    let threads = [];

    if (req.body.username) {
        const user = await user.findOne({ username: req.body.username });
        threads = await Thread.find({ user: user.id });
    } else if (req.body.company) {
        const company = await company.findOne({ username: req.body.company });
        threads = await Thread.find({ company: company.id });
    }

    res.status(200).send(threads);
});

module.exports = router;