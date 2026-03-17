// utils/time.js

/**
 * Parse time string to Date object (using epoch date)
 */
exports.parseTime = (timeStr) => {
    if (!timeStr) return null;

    // Convert to string if not already
    if (typeof timeStr !== 'string') {
        // If it's a Date object
        if (timeStr instanceof Date) {
            return new Date(timeStr.getTime()); // clone the date
        }
        // Otherwise, coerce to string
        timeStr = timeStr.toString();
    }

    let hours = 0, minutes = 0;

    if (timeStr.includes(':')) {
        [hours, minutes] = timeStr.split(':').map(Number);
    } else {
        // If format is unexpected, fallback to midnight
        return new Date('1970-01-01T00:00:00Z');
    }

    const date = new Date('1970-01-01T00:00:00Z');
    date.setUTCHours(hours || 0, minutes || 0, 0, 0);
    return date;
};

/**
 * Add minutes to a date
 */
exports.addMinutes = (date, minutes) => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
};

/**
 * Format date as HH:MM
 */
exports.formatTime = (date) => {
    if (!date) return '00:00';

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

/**
 * Calculate time difference in minutes
 */
exports.getMinutesDifference = (time1, time2) => {
    const date1 = exports.parseTime(time1);
    const date2 = exports.parseTime(time2);
    return (date2 - date1) / (1000 * 60);
};

/**
 * Check if time1 is before time2
 */
exports.isBefore = (time1, time2) => {
    const date1 = exports.parseTime(time1);
    const date2 = exports.parseTime(time2);
    return date1 < date2;
};