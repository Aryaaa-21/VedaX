const User = require("../models/User");
const { AppError } = require("../utils/errors");
const { toSafeUser } = require("../utils/serializeUser");

const EDITABLE_FIELDS = ["name", "avatar", "profileImage"];
const SERVER_CONTROLLED_FIELDS = [
  "level",
  "xp",
  "streak",
  "accuracy",
  "avgSpeed",
  "completedLessons",
  "challengeHighScore",
  "badges",
  "completedTechniques",
  "challengeHistory",
  "recentActivities"
];

const findCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return user;
};

const updateEditableFields = (user, values) => {
  for (const field of EDITABLE_FIELDS) {
    if (values[field] !== undefined) user[field] = values[field];
  }
  return user;
};

const updateProfile = async (userId, values) => {
  const user = await findCurrentUser(userId);
  updateEditableFields(user, values);
  return user.save();
};

module.exports = {
  EDITABLE_FIELDS,
  SERVER_CONTROLLED_FIELDS,
  findCurrentUser,
  updateEditableFields,
  updateProfile,
  toSafeUser
};
