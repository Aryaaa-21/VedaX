const LearnerProfile = require("../models/LearnerProfile");
const { buildLearnerProfile } = require("./adaptiveLearningService");

const refreshLearnerProfile = async (userId) => {
  const calculated = await buildLearnerProfile(userId);
  const profile = await LearnerProfile.findOneAndUpdate({ userId }, {
    $set: {
      overallMastery: calculated.overallMastery,
      recommendedDifficulty: calculated.recommendedDifficulty,
      strengths: calculated.strengths.map((item) => item.techniqueId),
      weaknesses: calculated.weaknesses.map((item) => item.techniqueId),
      recentPerformance: calculated.recentPerformance,
      learningConsistency: calculated.learningConsistency,
      lastUpdated: calculated.lastUpdated
    }
  }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return { ...calculated, profileId: String(profile._id) };
};

const getLearnerProfile = async (userId) => {
  const profile = await LearnerProfile.findOne({ userId }).lean();
  return profile || refreshLearnerProfile(userId);
};

module.exports = { refreshLearnerProfile, getLearnerProfile };
