const mysql = require("mysql2");

const db_url = process.env.JAWSDB_URL;

const pool = mysql.createPool(db_url);
const promisePool = pool.promise();

const Q_AUTH = "SELECT * FROM Users WHERE email = ? AND password = ? LIMIT 1";
const Q_INSERT_USER = "INSERT INTO Users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)";
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

function writeMetric(userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    writeMetrics(userId, type, metrics);
}

function writeMetricAtTime(time, userId, type, metricName, metricValue) {
    let metrics = {};
    metrics[metricName] = metricValue;
    writeMetricsAtTime(time, userId, type, metrics);
}

function writeMetrics(userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics));

    let sql = mysql.format(Q_INSERT_METRIC, [userId, type, JSON.stringify(metrics)]);
    console.log("Running SQL: " + sql);
    
    pool.query(sql, function(error, results, fields) {
            console.log("MySQL Insert completed!");
            if (error) return console.error(error);
            
            console.log("MySQL Success!");
    });
}

function writeMetricsAtTime(time, userId, type, metrics) {
    console.log("Writing " + type + " metrics to MySQL: " + JSON.stringify(metrics) + " at time " + time);

    let sql = mysql.format(Q_INSERT_METRIC_AT_TIME, [time, userId, type, JSON.stringify(metrics)]);
    console.log("Running SQL: " + sql);
    
    pool.query(sql, function(error, results, fields) {
            console.log("MySQL Insert completed!");
            if (error) return console.error(error);
            
            console.log("MySQL Success!");
    });
}

module.exports.writeMetric = writeMetric;
module.exports.writeMetrics = writeMetrics;
module.exports.writeMetricAtTime = writeMetricAtTime;
module.exports.writeMetricsAtTime = writeMetricsAtTime;

// Share the pool for use by the MySQLSessionStore (express-mysql-session)
module.exports.pool = pool;
module.exports.promisePool = promisePool;