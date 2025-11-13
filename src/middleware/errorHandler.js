const { constants } = require("../../constants");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || res.statusCode || 500;

    const response = {
        success: false,
        statusCode: statusCode,
        message: err.message || "An unexpected error occurred",
        errors: err.errors || [],
        meta: {
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
        }
    };

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
