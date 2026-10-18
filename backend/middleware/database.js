const mongoose = require("mongoose");
const { AppError } = require("../utils/errors");

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const requireDatabase = (req, res, next) => {
  if (!isDatabaseReady()) {
    return next(new AppError("Database temporarily unavailable", 503, "DATABASE_UNAVAILABLE"));
  }
  return next();
};

module.exports = { isDatabaseReady, requireDatabase };
