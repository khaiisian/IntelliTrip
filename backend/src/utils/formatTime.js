const toTime = (time) => {
    if (!time || typeof time !== 'string')
        throw { status: false, statusCode: 400, message: 'Invalid time format' };

    // Expect HH:mm or HH:mm:ss
    return new Date(`1970-01-01T${time}`);
};

module.exports = toTime;