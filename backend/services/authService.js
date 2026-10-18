const User = require("../models/User");
const { AppError } = require("../utils/errors");
const { isDatabaseReady } = require("../middleware/database");

const requireDatabase = () => {
  if (!isDatabaseReady()) {
    throw new AppError("Database temporarily unavailable", 503, "DATABASE_UNAVAILABLE");
  }
};

const createAccount = async ({ name, email, password }) => {
  requireDatabase();
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS", { email: "Email already exists" });
  }

  return User.create({
    name,
    email,
    password,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    profileImage: ""
  });
};

const authenticateCredentials = async ({ email, password }) => {
  requireDatabase();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  return user;
};

const revokeTokenVersion = async (userId) => {
  requireDatabase();
  return User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

module.exports = { createAccount, authenticateCredentials, revokeTokenVersion, requireDatabase };
