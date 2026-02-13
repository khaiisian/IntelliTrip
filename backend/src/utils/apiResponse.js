const sendResponse = (res, {
    status = true,
    statusCode = 200,
    message = 'Success',
    data = null
}) => {
    return res.status(statusCode).json({
        status,
        statusCode,
        message,
        data
    })
}

module.exports = sendResponse;