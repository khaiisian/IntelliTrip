function normalizeTimeString(value) {
    if (!value) return '00:00';

    if (value instanceof Date) {
        const h = value.getUTCHours().toString().padStart(2, '0');
        const m = value.getUTCMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    const timeStr = String(value);
    if (/^\d{1,2}:\d{2}/.test(timeStr)) {
        const [h, m] = timeStr.split(':').map(Number);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    const date = new Date(timeStr);
    if (!Number.isNaN(date.getTime())) {
        return normalizeTimeString(date);
    }

    return '00:00';
}

function timeToMinutes(timeStr) {
    const [h, m] = normalizeTimeString(timeStr).split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes) {
    const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function addMinutesToTime(timeStr, minutes) {
    return minutesToTime(timeToMinutes(timeStr) + Number(minutes || 0));
}

function compareTimes(a, b) {
    return timeToMinutes(a) - timeToMinutes(b);
}

function getLocalDateTime(dateStr, timeStr, timezone = 'Asia/Yangon') {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = normalizeTimeString(timeStr).split(':').map(Number);
    const offsetMinutes = timezone === 'Asia/Yangon' ? 390 : 0;
    const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60000;
    return new Date(utcTimestamp);
}

module.exports = {
    normalizeTimeString,
    timeToMinutes,
    minutesToTime,
    addMinutesToTime,
    compareTimes,
    getLocalDateTime
};
