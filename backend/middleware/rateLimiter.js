const rateLimit = require("express-rate-limit");

const limiterResponse = (req, res) => res.status(429).json({
  success: false,
  message: "Too many requests. Please try again later.",
  error: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
    fields: {}
  }
});

const createLimiter = (windowMs, limit) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: limiterResponse
});

const testLimiter = (req, res, next) => next();

const selectLimiter = (windowMs, limit) => process.env.NODE_ENV === "test"
  ? testLimiter
  : createLimiter(windowMs, limit);

const apiLimiter = selectLimiter(15 * 60 * 1000, 300);
const authLimiter = selectLimiter(15 * 60 * 1000, 20);

module.exports = { apiLimiter, authLimiter, createLimiter, testLimiter };
