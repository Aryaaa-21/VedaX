const { TECHNIQUES } = require("./math");
const { buildLearnerProfile } = require("./adaptiveLearningService");

const getLearningPath = async (userId) => {
  const learner = await buildLearnerProfile(userId);
  const byId = new Map(learner.techniqueMastery.map((item) => [item.techniqueId, item]));
  const available = TECHNIQUES.filter((technique) => {
    const item = byId.get(technique.id);
    return item?.state !== "MASTERED" && item?.prerequisiteGaps?.length === 0;
  }).sort((a, b) => (byId.get(a.id)?.masteryScore || 0) - (byId.get(b.id)?.masteryScore || 0));
  return { currentLevel: learner.recommendedDifficulty, mastered: learner.strengths, prerequisiteGaps: learner.weaknesses.flatMap((item) => item.prerequisiteGaps || []), nextTechniques: available.slice(0, 5).map((technique) => ({ techniqueId: technique.id, reason: byId.get(technique.id)?.state === "NEEDS_REVIEW" ? "Review needed" : "Next available technique" })) };
};

module.exports = { getLearningPath };
