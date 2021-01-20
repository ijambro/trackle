const {InfluxDB} = require('@influxdata/influxdb-client');
const {Point} = require('@influxdata/influxdb-client');

const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
// TODO: Bucket should be user-specific
const bucket = 'SymptomTracker alpha';

const client = new InfluxDB({
    url: 'https://us-east-1-1.aws.cloud2.influxdata.com', 
    token: token
});

module.exports.writePoint = function(eventName, metricName, metricValue) {
    console.log("Writing " + eventName + " to InfluxDB: " + metricName + " = " + metricValue);

    const point = new Point(eventName).intField(metricName, metricValue);
    
    writePoint(point);
}

function writePoint(point) {
    console.log("Writing point to InfluxDB: " + JSON.stringify(point));

    const writeApi = client.getWriteApi(org, bucket)
    writeApi.useDefaultTags({host: 'host1'})

    writeApi.writePoint(point);
    
    writeApi.close()
        .then(() => {
            console.log('Finished writing to InfluxDB')
        })
        .catch(e => {
            console.error(e)
            console.log('\\nERROR writing to InfluxDB')
        });
}