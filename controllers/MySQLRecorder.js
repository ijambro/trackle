const mysql = require("mysql");

const db_url = process.env.JAWSDB_URL;

const pool = mysql.createPool(db_url);

const INSERT_METRIC = "INSERT INTO Metrics (user_id, type, metrics) VALUES (?, ?, ?)";

function writeMetric(userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    writeMetrics(userId, type, metrics);
}

function writeMetrics(userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics));

    let sql = mysql.format(INSERT_METRIC, [userId, type, JSON.stringify(metrics)]);
    console.log("Running SQL: " + sql);
    
    pool.query(sql, function(error, results, fields) {
            console.log("MySQL Insert completed!");
            if (error) throw error;
            
            console.log("MySQL Success!");
    });
}

module.exports.writeMetric = writeMetric;
module.exports.writeMetrics = writeMetrics;