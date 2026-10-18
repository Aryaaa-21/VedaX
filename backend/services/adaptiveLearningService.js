const UserProgress = require("../models/UserProgress");
const Attempt = require("../models/Attempt");
const { getTechnique, TECHNIQUES } = require("./math");

const STATES = Object.freeze({ NOT_STARTED: "NOT_STARTED", LEARNING: "LEARNING", DEVELOPING: "DEVELOPING", PROFICIENT: "PROFICIENT", MASTERED: "MASTERED", NEEDS_REVIEW: "NEEDS_REVIEW" });

const getMasteryState = ({ attempts = 0, masteryScore = 0, consecutiveIncorrect = 0, recentAccuracy = 0, nextReviewAt = null }) => {
  if (!attempts) return STATES.NOT_STARTED;
  if (consecutiveIncorrect >= 2 || (nextReviewAt && nextReviewAt <= new Date() && recentAccuracy < 70)) return STATES.NEEDS_REVIEW;
  if (masteryScore >= 90 && recentAccuracy >= 85) return STATES.MASTERED;
  if (masteryScore >= 70 && recentAccuracy >= 70) return STATES.PROFICIENT;
  if (masteryScore >= 40 || recentAccuracy >= 50) return STATES.DEVELOPING;
  return STATES.LEARNING;
};

const getAdaptiveDifficulty = ({ currentDifficulty = 1, recentAttempts = [], masteryScore = 0 }) => {
  if (!recentAttempts.length) return Math.max(1, Math.min(3, currentDifficulty));
  const accuracy = recentAttempts.filter((attempt) => attempt.correct).length / recentAttempts.length;
  const averageTime = recentAttempts.reduce((sum, attempt) => sum + attempt.responseTimeMs, 0) / recentAttempts.length;
  const strong = accuracy >= 0.8 && averageTime <= 6000;
  const weak = accuracy < 0.5 || recentAttempts.filter((attempt) => !attempt.correct).length >= 3;
  if (strong && masteryScore >= 40) return Math.min(3, currentDifficulty + 1);
  if (weak) return Math.max(1, currentDifficulty - 1);
  return currentDifficulty;
};

const getPrerequisiteGaps = (techniqueId, progressByTechnique) => {
  const technique = getTechnique(techniqueId);
  return (technique?.prerequisites || []).filter((id) => {
    const progress = progressByTechnique.get(id);
    return !progress || progress.masteryScore < 70;
  });
};

const buildLearnerProfile = async (userId) => {
  const [progress, recentAttempts] = await Promise.all([
    UserProgress.find({ userId }).lean(),
    Attempt.find({ userId }).sort({ submittedAt: -1 }).limit(100).lean()
  ]);
  const byTechnique = new Map(progress.map((record) => [record.techniqueId, record]));
  const techniqueMastery = TECHNIQUES.map((technique) => {
    const record = byTechnique.get(technique.id);
    return {
      techniqueId: technique.id,
      masteryScore: record?.masteryScore || 0,
      state: getMasteryState(record || {}),
      prerequisiteGaps: getPrerequisiteGaps(technique.id, byTechnique),
      lastPracticedAt: record?.lastAttemptAt || null,
      nextReviewAt: record?.nextReviewAt || null
    };
  });
  const practiced = techniqueMastery.filter((item) => item.masteryScore > 0);
  const overallMastery = practiced.length ? Math.round((practiced.reduce((sum, item) => sum + item.masteryScore, 0) / practiced.length) * 100) / 100 : 0;
  const strengths = techniqueMastery.filter((item) => item.state === STATES.MASTERED || item.state === STATES.PROFICIENT).sort((a, b) => b.masteryScore - a.masteryScore).slice(0, 5);
  const weaknesses = techniqueMastery.filter((item) => [STATES.LEARNING, STATES.NEEDS_REVIEW].includes(item.state)).sort((a, b) => a.masteryScore - b.masteryScore).slice(0, 5);
  const recentAccuracy = recentAttempts.length ? Math.round((recentAttempts.filter((attempt) => attempt.correct).length / recentAttempts.length) * 10000) / 100 : 0;
  const recommendedDifficulty = getAdaptiveDifficulty({ currentDifficulty: 1, recentAttempts: recentAttempts.slice(0, 10), masteryScore: overallMastery });
  return { userId, overallMastery, techniqueMastery, strengths, weaknesses, recentPerformance: { attempts: recentAttempts.length, accuracy: recentAccuracy }, learningConsistency: new Set(recentAttempts.map((attempt) => new Date(attempt.submittedAt).toISOString().slice(0, 10))).size, recommendedDifficulty, lastUpdated: new Date() };
};

module.exports = { STATES, getMasteryState, getAdaptiveDifficulty, getPrerequisiteGaps, buildLearnerProfile };
