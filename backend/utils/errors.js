class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", fields = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const errorPayload = (error) => ({
  success: false,
  message: error.message,
  error: {
    code: error.code || "INTERNAL_SERVER_ERROR",
    message: error.message,
    fields: error.fields || {}
  }
});

module.exports = { AppError, asyncHandler, errorPayload };
