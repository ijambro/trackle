/**
 * Convert to a MySQL timestamp format "yyyy-MM-dd hh:mm:ss"
 * @param {String} date in format "yyyy-MM-dd".  Use current date if empty.
 * @param {String} time in format "hh:mm AM".  Use current time if empty.
 * @param {int} userTimezoneOffsetMinutes Represents minutes behind UTC from user's client-side JavaScript Date.
 * 
 * This function will not be called if both date and time are empty (routers would use writeMetric with default timestamp instead)
 */
module.exports.convertDateTimeValuesToTimestamp = function(date, time, userTimezoneOffsetMinutes) {
    if (!date) {
        date = getCurrentDateString(userTimezoneOffsetMinutes);
    }

    let hhmm = "00:00";
    if (!time) {
        hhmm = getCurrentTimeString(userTimezoneOffsetMinutes);
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
    return `${date} ${hhmm}:00${getTimeZoneOffsetString(userTimezoneOffsetMinutes)}`;
}

function getCurrentDateInUserTimezone(userTimezoneOffsetMinutes) {
    // current date on server
    let currDate = new Date();
    console.log("getCurrentDateInUserTimezone : current on server: " + currDate);
    // difference between the user's tzOffset and server's tzOffset
    let tzOffsetDiff = userTimezoneOffsetMinutes - currDate.getTimezoneOffset();
    console.log("getCurrentDateInUserTimezone : user offset=" + userTimezoneOffsetMinutes);
    console.log("getCurrentDateInUserTimezone : srvr offset=" + currDate.getTimezoneOffset());
    console.log("getCurrentDateInUserTimezone : diff offset=" + tzOffsetDiff);

    currDate.setMinutes(currDate.getMinutes() - tzOffsetDiff); //current date in user's browser
    console.log("getCurrentDateInUserTimezone : current for user: " + currDate);
    return currDate;
}

function getCurrentDateString(userTimezoneOffsetMinutes) {
    let currDate = getCurrentDateInUserTimezone(userTimezoneOffsetMinutes);

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

function getCurrentTimeString(userTimezoneOffsetMinutes) {
    let currDate = getCurrentDateInUserTimezone(userTimezoneOffsetMinutes);

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

/**
 * Convert the user's browser's timezone to the offset string.
 * @param {int} userTimezoneOffsetMinutes Represents minutes behind UTC.  Positive values are behind UTC, so these get a minus sign.
 */
function getTimeZoneOffsetString(userTimezoneOffsetMinutes) {
    let tzOffset = "";
    
    let offsetHours = parseInt(Math.abs(userTimezoneOffsetMinutes / 60));
    let offsetMins = Math.abs(userTimezoneOffsetMinutes % 60);
    if (offsetHours < 10) {
        offsetHours = "0" + offsetHours;
    }
    if (offsetMins < 10) {
        offsetMins = "0" + offsetMins;
    }
    if (userTimezoneOffsetMinutes < 0) {
        tzOffset = '+' + offsetHours + ':' + offsetMins;
    } else if (userTimezoneOffsetMinutes > 0) {
        tzOffset = '-' + offsetHours + ':' + offsetMins;
    } else {
        // Do not specify an offset when time zone is UTC (offset = 0)
    }

    return tzOffset;
}
