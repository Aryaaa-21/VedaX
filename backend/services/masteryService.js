const UserProgress = require("../models/UserProgress");
const { getMasteryState } = require("./adaptiveLearningService");

const getMasteryLevel = (score) => score >= 90 ? "mastered" : score >= 70 ? "proficient" : score >= 40 ? "developing" : "novice";

const calculateMasteryScore = ({ accuracy, recentAccuracy, averageResponseTimeMs }) => {
  const speedScore = Math.max(0, Math.min(100, 100 - ((averageResponseTimeMs || 0) / 5000) * 100));
  return Math.round((accuracy * 0.7 + recentAccuracy * 0.2 + speedScore * 0.1) * 100) / 100;
};

const updateMasteryFromAttempt = async ({ userId, techniqueId, correct, responseTimeMs, attemptedAt = new Date(), retryCount = 0 }) => {
  let current = await UserProgress.findOne({ userId, techniqueId });
  if (!current) {
    try {
      current = await UserProgress.create({ userId, techniqueId });
    } catch (error) {
      if (error.code !== 11000) throw error;
      current = await UserProgress.findOne({ userId, techniqueId });
    }
  }
  if (!current) throw new Error("Unable to initialize technique progress");

  // Optimistic versioning prevents two rapid attempts from silently overwriting
  // one another. The caller can retry the full update when the version changed.
  const expectedVersion = current.version;
  const previousAttempts = current.attempts;
  current.attempts += 1;
  current.correctAttempts += correct ? 1 : 0;
  current.incorrectAttempts += correct ? 0 : 1;
  current.accuracy = Math.round((current.correctAttempts / current.attempts) * 10000) / 100;
  current.recentAccuracy = previousAttempts === 0 ? (correct ? 100 : 0) : Math.round((current.recentAccuracy * 0.7 + (correct ? 100 : 0) * 0.3) * 100) / 100;
  current.averageResponseTimeMs = previousAttempts === 0 ? responseTimeMs : Math.round((current.averageResponseTimeMs * 0.7 + responseTimeMs * 0.3) * 100) / 100;
  current.masteryScore = calculateMasteryScore(current);
  current.masteryLevel = getMasteryLevel(current.masteryScore);
  current.learningState = getMasteryState(current);
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
  current.version = expectedVersion + 1;
  const result = await UserProgress.updateOne({ _id: current._id, version: expectedVersion }, {
    $set: {
      attempts: current.attempts,
      correctAttempts: current.correctAttempts,
      incorrectAttempts: current.incorrectAttempts,
      accuracy: current.accuracy,
      averageResponseTimeMs: current.averageResponseTimeMs,
      recentAccuracy: current.recentAccuracy,
      masteryScore: current.masteryScore,
      masteryLevel: current.masteryLevel,
      learningState: current.learningState,
      lastAttemptAt: current.lastAttemptAt,
      lastCorrectAt: current.lastCorrectAt,
      nextReviewAt: current.nextReviewAt,
      consecutiveCorrect: current.consecutiveCorrect,
      consecutiveIncorrect: current.consecutiveIncorrect,
      version: current.version
    }
  });
  if (!result.modifiedCount) {
    if (retryCount >= 3) throw new Error("Technique progress changed concurrently; retry the attempt");
    return updateMasteryFromAttempt({ userId, techniqueId, correct, responseTimeMs, attemptedAt, retryCount: retryCount + 1 });
  }
  return UserProgress.findById(current._id);
};

module.exports = { getMasteryLevel, calculateMasteryScore, updateMasteryFromAttempt };
