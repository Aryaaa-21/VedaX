const UserProgress = require("../models/UserProgress");
const { TECHNIQUES } = require("./math");

const getRecommendations = async (userId, limit = 5) => {
  const records = await UserProgress.find({ userId }).sort({ masteryScore: 1, lastAttemptAt: 1 }).limit(50).lean();
  const byTechnique = new Map(records.map((record) => [record.techniqueId, record]));
  return TECHNIQUES.map((technique) => {
    const progress = byTechnique.get(technique.id);
    const score = progress ? progress.masteryScore : 0;
    const overdue = progress?.nextReviewAt && progress.nextReviewAt <= new Date() ? 0.2 : 0;
    return {
      techniqueId: technique.id,
      reason: progress ? (progress.consecutiveIncorrect >= 2 ? "Repeated mistakes" : overdue ? "Needs review" : "Build mastery") : "Not practiced yet",
      priority: Math.round(Math.min(1, (100 - score) / 100 + overdue) * 100) / 100,
      suggestedMode: "practice",
      suggestedQuestionCount: score < 40 ? 10 : 5
    };
  }).sort((a, b) => b.priority - a.priority).slice(0, limit);
};

module.exports = { getRecommendations };
