const mongoose = require("mongoose");
const { errorPayload } = require("../utils/errors");
const { log } = require("../utils/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: { code: "NOT_FOUND", message: "Route not found", fields: {} }
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "Server error occurred";
  let fields = err.fields || {};

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Request body must contain valid JSON";
  } else if (err.name === "ValidationError") {
    statusCode = 422;
    code = "VALIDATION_ERROR";
    message = "Invalid request";
    fields = Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message]));
  } else if (err.code === 11000) {
    statusCode = 409;
    code = "CONFLICT";
    message = "A record with those details already exists";
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = "INVALID_IDENTIFIER";
    message = "Invalid identifier";
  } else if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    code = "CORS_ORIGIN_DENIED";
    message = "Origin is not allowed";
  }

  log("error", message, {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });

  if (statusCode >= 500) {
    return res.status(statusCode).json(errorPayload({
      message: "Server error occurred",
      code: "INTERNAL_SERVER_ERROR",
      fields: {}
    }));
  }

  return res.status(statusCode).json(errorPayload({ message, code, fields }));
};

module.exports = { notFoundHandler, errorHandler };
