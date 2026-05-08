const toTime = (time) => {
    if (!time || typeof time !== 'string')
        throw { status: false, statusCode: 400, message: 'Invalid time format' };

    // Expect HH:mm or HH:mm:ss
    const parts = time.split(':').map(Number);
    const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
    const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
    const seconds = Number.isFinite(parts[2]) ? parts[2] : 0;

    // Create a Date representing the exact wall-clock time in UTC (epoch date)
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
};

module.exports = toTime;