const express = require("express");
const router = express.Router();
const influx = require("../controllers/InfluxRecorder");
const cache = require("../controllers/CacheRecorder");
const mysql = require("../controllers/MySQLRecorder");

// Event / Symptom names
const PAIN = "pain";
const GAS = "gas";
const POOP = "poop";
// Metric names
const LEVEL = "level";

// TODO: User Management
let currentUserId = 1;

// Show all cached events

router.get("/", (req, res) => {
    res.json(cache.getAll());
});

// Record a pain-level metric
router.post("/pain", (req, res) => {
    console.log("Submitted event: pain");

    let value = req.body["level"];

    // influx.writePoint(PAIN, LEVEL, value);
    mysql.writeMetric(currentUserId, PAIN, LEVEL, value);
    cache.writeMetric(PAIN, LEVEL, value);

    res.sendStatus(200);
});

// Record a gas-level metric
router.post("/gas", (req, res) => {
    console.log("Submitted event: gas");

    let value = req.body["level"];

    // influx.writePoint(GAS, LEVEL, value);
    mysql.writeMetric(currentUserId, GAS, LEVEL, value);
    cache.writeMetric(GAS, LEVEL, value);

    res.sendStatus(200);
});

// Record poop metrics
router.post("/poop", (req, res) => {
    console.log("Submitted event: poop");

    let poopMetrics = {
        duration: req.body["duration"],
        pooped: false
    }

    if (req.body["pooped"]) {
        poopMetrics["pooped"] = true;
        poopMetrics["consistency"] = req.body["consistency"];
        poopMetrics["urgent"] = req.body["urgent"] ? true : false;
        poopMetrics["explosive"] = req.body["explosive"] ? true : false;
        poopMetrics["blood"] = req.body["blood"] ? true : false;
    }

    // influx.writePoint(POOP, poopMetrics);
    mysql.writeMetrics(currentUserId, POOP, poopMetrics);
    cache.writeMetrics(POOP, poopMetrics);

    res.sendStatus(200);
});

module.exports = router;