const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { AppError } = require("../utils/errors");
const { isDatabaseReady } = require("./database");

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  if (!header) return null;
  const [scheme, token, ...extra] = header.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token || extra.length > 0) {
    throw new AppError("Invalid authorization header", 401, "UNAUTHORIZED");
  }
  return token;
};

const findUserById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findById(id);
};

const authenticateRequest = async (req) => {
  const token = getBearerToken(req);
  if (!token) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  if (!process.env.JWT_SECRET) throw new AppError("Authentication unavailable", 503, "AUTHENTICATION_UNAVAILABLE");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }

  if (!decoded || typeof decoded !== "object" || !decoded.id) {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }

  if (!isDatabaseReady()) {
    throw new AppError("Database temporarily unavailable", 503, "DATABASE_UNAVAILABLE");
  }

  const user = await findUserById(decoded.id);
  if (!user) throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");

  if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }

  req.user = user;
  req.auth = { token: token, claims: decoded };
  return user;
};

const protect = async (req, res, next) => {
  try {
    await authenticateRequest(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  try {
    await authenticateRequest(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
  }
  return next();
};

module.exports = { protect, optionalProtect, requireRole, getBearerToken };
