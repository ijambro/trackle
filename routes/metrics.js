const express = require("express");
const router = express.Router();

// Event names
const PAIN = "pain-level";
const GAS = "gas-level";
const POOPEVENT = "poop-event";
const POOPTIME = "poop-time";

// Temp storage of all events, metrics and symptoms to track
let events = [];

// SHOW ALL EVENTS

router.get("/", (req, res) => {
    res.json(events);
});

// SUBMIT "PAIN" FORM

router.post("/pain", (req, res) => {
    console.log("Submitted metric: pain");

    // Record a pain-level metric

    let value = req.body["pain-level"];

    writeEvent(PAIN, value);
    cacheEvent(PAIN, value);

    res.sendStatus(200);
});

// SUBMIT "GAS" FORM

router.post("/gas", (req, res) => {
    console.log("Submitted metric: gas");

    // Record a gas-level metric

    let value = req.body["gas-level"];

    writeEvent(GAS, value);
    cacheEvent(GAS, value);

    res.sendStatus(200);
});

// SUBMIT "POOP" FORM

router.post("/poop", (req, res) => {
    console.log("Submitted metric: poop");

    // Record a poop-time metric for time and whether pooped.
    // If pooped, also record a poop-event metric.
    
    let timeSpent = req.body["time"];
    let poopTimeValue = {
        timeSpent: timeSpent
    }
    let pooped = req.body["pooped"];
    if (pooped) {
        poopTimeValue["pooped"] = true;
        let poopEventValue = {
            consistency: req.body["consistency"],
            urgent: req.body["urgent"] ? true : false,
            explosive: req.body["explosive"] ? true : false,
            blood: req.body["blood"] ? true : false,
        }

        writeEvent(POOPEVENT, poopEventValue);
        cacheEvent(POOPEVENT, poopEventValue);
    } else {
        poopTimeValue["pooped"] = false;
    }

    writeEvent(POOPTIME, poopTimeValue);
    cacheEvent(POOPTIME, poopTimeValue);

    res.sendStatus(200);
});

function writeEvent(eventName, eventValue) {
    console.log("Write event to InfluxDB: " + eventName + " = " + eventValue);
}

function cacheEvent(eventName, eventValue) {
    console.log("Cacheing event to temp storage: " + eventName + " = " + eventValue);
    let event = {
        type: eventName,
        values: eventValue,
        time: new Date()
    };
    events.push(event);
    console.log("Cached event to temp storage: " + JSON.stringify(event));
}

module.exports = router;