/**
 * Convert to a MySQL timestamp format "yyyy-MM-dd hh:mm:ss"
 * @param {String} date in format "yyyy-MM-dd".  Use current date if empty.
 * @param {String} time in format "hh:mm AM".  Use current time if empty.
 * Will not be called if both date and time are empty (would use writeMetric with default timestamp instead)
 */
module.exports.convertDateTimeValuesToTimestamp = function(date, time) {
    if (!date) {
        date = getCurrentDateString();
    }

    let hhmm = "00:00";
    if (!time) {
        hhmm = getCurrentTimeString();
    } else if (time.endsWith(" AM") && time.length === 8 && time.charAt(2) == ':') {
        // If hh = 12 AM, convert to 00
        let hh = parseInt(time.substr(0, 2), 10);
        let hh24 = hh;
        if (hh < 10) {
            hh24 = "0" + hh;
        } else if (hh == 12) {
            hh24 = "00";
        }
        let mm = time.substr(3, 2);
        hhmm = `${hh24}:${mm}`
    } else if (time.endsWith(" PM") && time.length === 8 && time.charAt(2) == ':') {
        // Convert the hh to 24-hour clock then add :mm
        let hh = parseInt(time.substr(0, 2), 10);
        let hh24 = hh;
        if (hh < 12) {
            hh24 = hh + 12;
        }
        let mm = time.substr(3, 2);
        hhmm = `${hh24}:${mm}`
    }

    // Append date, time and timezone offset together
    return `${date} ${hhmm}:00${getCurrentTimeZoneOffset()}`;
}

function getCurrentDateString() {
    let currDate = new Date();
    let MM = 1 + currDate.getMonth();
    if (MM < 10) {
        MM = "0" + MM;
    }
    let dd = currDate.getDate();
    if (dd < 10) {
        dd = "0" + dd;
    }
    return `${currDate.getFullYear()}-${MM}-${dd}`;
}

function getCurrentTimeString() {
    let currDate = new Date();
    let hh = currDate.getHours();
    if (hh < 10) {
        hh = "0" + hh;
    }
    let mm = currDate.getMinutes();
    if (mm < 10) {
        mm = "0" + mm;
    }
    return `${hh}:${mm}`;
}

function getCurrentTimeZoneOffset() {
    let tzOffset = "";
    let tzOffsetMinutes = new Date().getTimezoneOffset(); //Represents minutes behind UTC
    
    let offsetHours = parseInt(Math.abs(tzOffsetMinutes / 60));
    let offsetMins = Math.abs(tzOffsetMinutes % 60);
    if (offsetHours < 10) {
        offsetHours = "0" + offsetHours;
    }
    if (offsetMins < 10) {
        offsetMins = "0" + offsetMins;
    }
    if (tzOffsetMinutes < 0) {
        tzOffset = '+' + offsetHours + ':' + offsetMins;
    } else if (tzOffsetMinutes > 0) {
        tzOffset = '-' + offsetHours + ':' + offsetMins;
    } else {
        // Do not specify an offset when time zone is UTC (offset = 0)
    }

    return tzOffset;
}
