const { getLearnerProfile } = require("../services/learnerProfileService");
const { getLearningPath } = require("../services/learningPathService");
const { getAdaptiveDifficulty } = require("../services/adaptiveLearningService");
const Attempt = require("../models/Attempt");

const learnerProfile = async (req, res) => res.json({ learner: await getLearnerProfile(req.user._id) });
const learningPath = async (req, res) => res.json(await getLearningPath(req.user._id));
const adaptiveDifficulty = async (req, res) => {
  const recentAttempts = await Attempt.find({ userId: req.user._id, techniqueId: req.params.techniqueId }).sort({ submittedAt: -1 }).limit(10).lean();
  return res.json({ techniqueId: req.params.techniqueId, difficulty: getAdaptiveDifficulty({ currentDifficulty: Number(req.query.currentDifficulty) || 1, recentAttempts, masteryScore: Number(req.query.masteryScore) || 0 }) });
};

module.exports = { learnerProfile, learningPath, adaptiveDifficulty };
