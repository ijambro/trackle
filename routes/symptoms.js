const express = require("express");
const router = express.Router();

//Event names
const PAIN = "pain-level";
const GAS = "gas-level";

// SUBMIT COMPLETE FORM

router.post("/", (req, res) => {
    console.log("Submitted: ");

    let pain = req.body["pain-level"];
    writeEvent(PAIN, pain);

    let gas = req.body["gas-level"];
    writeEvent(GAS, gas);
    
    res.sendStatus(200);
});

// SUBMIT "PAIN" FORM

router.post("/pain", (req, res) => {
    console.log("Submitted: pain level");

    let pain = req.body["pain-level"];

    writeEvent(PAIN, pain);

    res.sendStatus(200);
});

function writeEvent(eventName, eventValue) {
    console.log("Write event to InfluxDB: " + eventName + " = " + eventValue);
}

module.exports = router;