const Attempt = require("../models/Attempt");

const getMistakeSummary = async (userId, limit = 20) => Attempt.aggregate([
  { $match: { userId, correct: false } },
  { $group: {
    _id: { techniqueId: "$techniqueId", operation: "$operation", difficulty: "$difficulty" },
    mistakes: { $sum: 1 },
    averageResponseTimeMs: { $avg: "$responseTimeMs" },
    lastAttemptAt: { $max: "$submittedAt" }
  } },
  { $sort: { mistakes: -1, lastAttemptAt: 1 } },
  { $limit: Math.min(100, Math.max(1, Number(limit) || 20)) },
  { $project: { _id: 0, techniqueId: "$_id.techniqueId", operation: "$_id.operation", difficulty: "$_id.difficulty", mistakes: 1, averageResponseTimeMs: { $round: ["$averageResponseTimeMs", 0] }, lastAttemptAt: 1 } }
]);

module.exports = { getMistakeSummary };
