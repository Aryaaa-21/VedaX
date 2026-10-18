const User = require("../models/User");
const Attempt = require("../models/Attempt");
const UserProgress = require("../models/UserProgress");
const XPTransaction = require("../models/XPTransaction");
const { getProgressForXp } = require("../utils/leveling");
const { toSafeUser } = require("../utils/serializeUser");
const { getRecommendations } = require("./recommendationService");

const getSummary = async (userId) => {
  const user = await User.findById(userId).lean();
  const [attemptStats] = await Attempt.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: 1 }, correct: { $sum: { $cond: ["$correct", 1, 0] } }, avgSpeed: { $avg: "$responseTimeMs" } } }
  ]);
  const total = attemptStats?.total || 0;
  const accuracy = total ? Math.round((attemptStats.correct / total) * 10000) / 100 : 0;
  const progress = getProgressForXp(user?.xp || 0);
  return { user: toSafeUser(user), xp: user?.xp || 0, level: progress.level, xpIntoLevel: progress.xpIntoLevel, xpToNextLevel: progress.xpToNextLevel, streak: user?.streak || 0, longestStreak: user?.longestStreak || 0, lastActivityDate: user?.lastActivityDate || null, accuracy, avgSpeed: Math.round((attemptStats?.avgSpeed || 0) / 100) / 10 };
};

const getTechniqueProgress = async (userId, techniqueId) => {
  if (techniqueId) return UserProgress.findOne({ userId, techniqueId }).lean();
  return UserProgress.find({ userId }).sort({ masteryScore: -1 }).lean();
};

const getXpHistory = async (userId, limit = 20) => XPTransaction.find({ userId }).sort({ createdAt: -1 }).limit(Math.min(100, Math.max(1, Number(limit) || 20))).lean();

const getProgressOverview = async (userId) => ({ summary: await getSummary(userId), techniques: await getTechniqueProgress(userId), recommendations: await getRecommendations(userId) });

module.exports = { getSummary, getTechniqueProgress, getXpHistory, getProgressOverview };
