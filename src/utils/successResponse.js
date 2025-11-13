const successResponse = (res, statusCode = 200, message = "success", data={}) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
        meta:{
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl,
            method: res.req.method,
        }
    });
};

module.exports = successResponse;