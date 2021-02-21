const mysql = require("mysql2");

const db_url = process.env.JAWSDB_URL;

const pool = mysql.createPool(db_url);
const promisePool = pool.promise();

const Q_AUTH = "SELECT * FROM Users WHERE email = ? AND password = ? LIMIT 1";
const Q_INSERT_USER = "INSERT INTO Users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)";
const Q_SELECT_METRICS = "SELECT * FROM Metrics WHERE user_id = ?";
const Q_INSERT_METRIC = "INSERT INTO Metrics (user_id, type, metrics) VALUES (?, ?, ?)";
const Q_INSERT_METRIC_AT_TIME = "INSERT INTO Metrics (time, user_id, type, metrics) VALUES (?, ?, ?, ?)";

module.exports.authenticate = async function(email, password) {
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

module.exports.create = async function(email, password, first_name, last_name) {
    let sql = mysql.format(Q_INSERT_USER, [email, password, first_name, last_name]);
    console.log("Running SQL: " + sql);
    
    let user = {};
    try {
        const [result, fields] = await promisePool.query(sql);
        console.log("MySQL result:");
        console.log(result);
        if (result.affectedRows === 1 && result.insertId > 0) {
            user["id"] = result.insertId;
            user["email"] = email;
            user["first_name"] = first_name;
            user["last_name"] = last_name;
        }
    } catch (e) {
        console.error(e);
    }
    return user;
}

module.exports.getAllMetrics = async function(userId) {
    let sql = mysql.format(Q_SELECT_METRICS, [userId]);
    console.log("Running SQL: " + sql);
    
    let metrics = [];
    try {
        const [rows, fields] = await promisePool.query(sql);
        console.log("MySQL result:");
        console.log(rows);
        if (rows.length > 0) {
            metrics = rows;
        }
    } catch (e) {
        console.error(e);
    }
    return metrics;
}

/**
 * Record the single metric value in MySQL.
 * Return true if successful, false otherwise.
 * @param {*} userId 
 * @param {*} type 
 * @param {*} metricName 
 * @param {*} metricValue 
 */
function writeMetric(userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    return writeMetrics(userId, type, metrics);
}

/**
 * Record the single metric value in MySQL with the specified time (converted to UTC).
 * Return true if successful, false otherwise.
 * @param {*} time 
 * @param {*} userId 
 * @param {*} type 
 * @param {*} metricName 
 * @param {*} metricValue 
 */
function writeMetricAtTime(time, userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    return writeMetricsAtTime(time, userId, type, metrics);
}

/**
 * Record the metric values in MySQL.
 * Return true if successful, false otherwise.
 * @param {*} userId 
 * @param {*} type 
 * @param {*} metrics 
 */
function writeMetrics(userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics));

    let sql = mysql.format(Q_INSERT_METRIC, [userId, type, JSON.stringify(metrics)]);
    return doInsert(sql);
}

/**
 * Record the metric values in MySQL with the specified time (converted to UTC).
 * Return true if successful, false otherwise.
 * @param {*} time 
 * @param {*} userId 
 * @param {*} type 
 * @param {*} metrics 
 */
function writeMetricsAtTime(time, userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics) + " at time " + time);

    let sql = mysql.format(Q_INSERT_METRIC_AT_TIME, [time, userId, type, JSON.stringify(metrics)]);
    return doInsert(sql);
}

/**
 * Execute the insert, asynchronously.
 * Return true if successfully inserted 1 row, false otherwise.
 * @param {String} sql 
 */
async function doInsert(sql) {
    console.log("Running SQL insert: " + sql);
    let success = false;
    try {
        const [result, fields] = await promisePool.query(sql);
        console.log("MySQL insert completed!  Result:");
        console.log(result);
        if (result.affectedRows === 1) {
            console.log("MySQL successfully inserted 1 row!");
            success = true;
        }
    } catch (e) {
        console.error(e);
        success = false;
    }
    return success;
}

module.exports.writeMetric = writeMetric;
module.exports.writeMetrics = writeMetrics;
module.exports.writeMetricAtTime = writeMetricAtTime;
module.exports.writeMetricsAtTime = writeMetricsAtTime;

// Share the pool for use by the MySQLSessionStore (express-mysql-session)
module.exports.pool = pool;
module.exports.promisePool = promisePool;