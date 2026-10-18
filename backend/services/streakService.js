const User = require("../models/User");
const { dateKeyFromDate, dayDifference } = require("../utils/dateKey");

const qualifyActivity = async (userId, date = new Date()) => {
  const today = dateKeyFromDate(date);
  const user = await User.findById(userId);
  if (!user) return null;
  if (user.lastQualifiedActivityDate === today) return { streak: user.streak, increased: false, date: today };

  const gap = dayDifference(user.lastQualifiedActivityDate, today);
  const nextStreak = gap === 1 ? user.streak + 1 : 1;
  user.streak = nextStreak;
  user.longestStreak = Math.max(user.longestStreak || 0, nextStreak);
  user.lastQualifiedActivityDate = today;
  user.lastActivityDate = today;
  await user.save();
  return { streak: nextStreak, increased: true, date: today };
};

module.exports = { qualifyActivity };
