const mysql = require("mysql2");

const db_url = process.env.JAWSDB_URL;

const pool = mysql.createPool(db_url);
const promisePool = pool.promise();

const Q_AUTH = "SELECT * FROM Users WHERE email = ? AND password = ? LIMIT 1";
const Q_INSERT_METRIC = "INSERT INTO Metrics (user_id, type, metrics) VALUES (?, ?, ?)";

async function authenticate(email, password) {
    let sql = mysql.format(Q_AUTH, [email, password]);
    console.log("Running SQL: " + sql);
    
    let user = {};
    try {
        const [rows, fields] = await promisePool.query(sql);
        console.log("MySQL result:");
        console.log(rows);
        if (rows.length > 0) {
            user = rows[0];
        }
    } catch (e) {
        console.error(e);
    }
    return user;
}

function writeMetric(userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    writeMetrics(userId, type, metrics);
}

function writeMetrics(userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics));

    let sql = mysql.format(Q_INSERT_METRIC, [userId, type, JSON.stringify(metrics)]);
    console.log("Running SQL: " + sql);
    
    pool.query(sql, function(error, results, fields) {
            console.log("MySQL Insert completed!");
            if (error) throw error;
            
            console.log("MySQL Success!");
    });
}

module.exports.authenticate = authenticate;
module.exports.writeMetric = writeMetric;
module.exports.writeMetrics = writeMetrics;