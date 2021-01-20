// Storage for every recorded event, symptom and metric
let events = [];

module.exports.getAll = function() {
    return events;
}

// Write an event/symptom with a single metric
// For example: (pain, level, 3)
function writeMetric(eventName, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    writeMetrics(eventName, metrics);
}

// Write an event/symptom with multiple metrics
// For example: (poop, { consistency: 3, urgent: true})
function writeMetrics(eventName, metrics) {
    console.log("Writing " + eventName + " to cache: " + JSON.stringify(metrics));

    let event = {
        type: eventName,
        metrics: metrics,
        time: new Date()
    };
    events.push(event);
    console.log("Cached event to temp storage: " + JSON.stringify(event));
}

module.exports.writeMetric = writeMetric;
module.exports.writeMetrics = writeMetrics;