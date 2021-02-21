const express = require("express");
const router = express.Router();
const utils = require("../utils");
const influx = require("../controllers/InfluxRecorder");
const cache = require("../controllers/CacheRecorder");
const mysql = require("../controllers/MySQLRecorder");

// Event / Symptom names
const PAIN = "pain";
const GAS = "gas";
const POOP = "poop";
// Metric names
const LEVEL = "level";

// Show all recorded events for the logged-in user
router.get("/", async (req, res) => {
    let allMetrics = await mysql.getAllMetrics(req.session.userId);
    res.json(allMetrics);
});

// Record a pain-level metric
router.post("/pain", async (req, res) => {
    console.log("Submitted event: pain");

    let value = req.body["level"];
    let success = false;

    if (req.body["earlier"] && (req.body["earlier_date"] || req.body["earlier_time"])) {
        let ts = utils.convertDateTimeValuesToTimestamp(
            req.body["earlier_date"], 
            req.body["earlier_time"],
            req.session.userTimezoneOffset);
        console.log("Parsed timestamp: " + ts);
        success = await mysql.writeMetricAtTime(ts, req.session.userId, PAIN, LEVEL, value);
    } else {
        // influx.writePoint(PAIN, LEVEL, value);
        success = await mysql.writeMetric(req.session.userId, PAIN, LEVEL, value);
        // cache.writeMetric(PAIN, LEVEL, value);
    }

    if (success === true) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

// Record a gas-level metric
router.post("/gas", async (req, res) => {
    console.log("Submitted event: gas");

    let value = req.body["level"];
    let success = false;

    if (req.body["earlier"] && (req.body["earlier_date"] || req.body["earlier_time"])) {
        let ts = utils.convertDateTimeValuesToTimestamp(
            req.body["earlier_date"], 
            req.body["earlier_time"],
            req.session.userTimezoneOffset);
        console.log("Parsed timestamp: " + ts);
        success = await mysql.writeMetricAtTime(ts, req.session.userId, GAS, LEVEL, value);
    } else {
        // influx.writePoint(GAS, LEVEL, value);
        success = await mysql.writeMetric(req.session.userId, GAS, LEVEL, value);
        // cache.writeMetric(GAS, LEVEL, value);
    }

    if (success === true) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

// Record poop metrics
router.post("/poop", async (req, res) => {
    console.log("Submitted event: poop");

    let success = false;

    let poopMetrics = {
        duration: Number(req.body["duration"]),
        pooped: false
    }

    if (req.body["pooped"]) {
        poopMetrics["pooped"] = true;
        poopMetrics["consistency"] = Number(req.body["consistency"]);
        poopMetrics["urgent"] = req.body["urgent"] ? true : false;
        poopMetrics["explosive"] = req.body["explosive"] ? true : false;
        poopMetrics["blood"] = req.body["blood"] ? true : false;
    }

    // Calculate a poop discomfort level for InfluxDB:
    // consistency + 1 for each of urgent, explosive or blood
    let poopLevel = poopMetrics["consistency"] + 
        (poopMetrics["urgent"] ? 1 : 0) +
        (poopMetrics["explosive"] ? 1 : 0) +
        (poopMetrics["blood"] ? 1 : 0);

    if (req.body["earlier"] && (req.body["earlier_date"] || req.body["earlier_time"])) {
        let ts = utils.convertDateTimeValuesToTimestamp(
            req.body["earlier_date"], 
            req.body["earlier_time"],
            req.session.userTimezoneOffset);
        console.log("Parsed timestamp: " + ts);
        success = await mysql.writeMetricsAtTime(ts, req.session.userId, POOP, poopMetrics);
    } else {
        // influx.writePoint(POOP, LEVEL, poopLevel);
        success = await mysql.writeMetrics(req.session.userId, POOP, poopMetrics);
        // cache.writeMetrics(POOP, poopMetrics);
    }

    if (success === true) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

module.exports = router;