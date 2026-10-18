const UserProgress = require("../models/UserProgress");

const getMasteryLevel = (score) => score >= 90 ? "mastered" : score >= 70 ? "proficient" : score >= 40 ? "developing" : "novice";

const calculateMasteryScore = ({ accuracy, recentAccuracy, averageResponseTimeMs }) => {
  const speedScore = Math.max(0, Math.min(100, 100 - ((averageResponseTimeMs || 0) / 5000) * 100));
  return Math.round((accuracy * 0.7 + recentAccuracy * 0.2 + speedScore * 0.1) * 100) / 100;
};

const updateMasteryFromAttempt = async ({ userId, techniqueId, correct, responseTimeMs, attemptedAt = new Date() }) => {
  const current = await UserProgress.findOne({ userId, techniqueId }) || new UserProgress({ userId, techniqueId });
  const previousAttempts = current.attempts;
  current.attempts += 1;
  current.correctAttempts += correct ? 1 : 0;
  current.incorrectAttempts += correct ? 0 : 1;
  current.accuracy = Math.round((current.correctAttempts / current.attempts) * 10000) / 100;
  current.recentAccuracy = previousAttempts === 0 ? (correct ? 100 : 0) : Math.round((current.recentAccuracy * 0.7 + (correct ? 100 : 0) * 0.3) * 100) / 100;
  current.averageResponseTimeMs = previousAttempts === 0 ? responseTimeMs : Math.round((current.averageResponseTimeMs * 0.7 + responseTimeMs * 0.3) * 100) / 100;
  current.masteryScore = calculateMasteryScore(current);
  current.masteryLevel = getMasteryLevel(current.masteryScore);
  current.lastAttemptAt = attemptedAt;
  if (correct) {
    current.lastCorrectAt = attemptedAt;
    current.consecutiveCorrect += 1;
    current.consecutiveIncorrect = 0;
  } else {
    current.consecutiveIncorrect += 1;
    current.consecutiveCorrect = 0;
  }
  const reviewDays = current.masteryScore >= 90 ? 30 : current.masteryScore >= 70 ? 14 : current.masteryScore >= 40 ? 3 : 1;
  current.nextReviewAt = new Date(attemptedAt.getTime() + reviewDays * 86400000);
  current.version += 1;
  return current.save();
};

module.exports = { getMasteryLevel, calculateMasteryScore, updateMasteryFromAttempt };
