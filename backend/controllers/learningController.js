const { getLearnerProfile } = require("../services/learnerProfileService");
const { getLearningPath } = require("../services/learningPathService");
const { getAdaptiveDifficulty } = require("../services/adaptiveLearningService");
const Attempt = require("../models/Attempt");
const UserProgress = require("../models/UserProgress");

const learnerProfile = async (req, res) => res.json({ learner: await getLearnerProfile(req.user._id) });
const learningPath = async (req, res) => res.json(await getLearningPath(req.user._id));
const adaptiveDifficulty = async (req, res) => {
  const [recentAttempts, progress] = await Promise.all([
    Attempt.find({ userId: req.user._id, techniqueId: req.params.techniqueId }).sort({ submittedAt: -1 }).limit(10).lean(),
    UserProgress.findOne({ userId: req.user._id, techniqueId: req.params.techniqueId }).lean()
  ]);
  const masteryScore = progress?.masteryScore || 0;
  const currentDifficulty = masteryScore >= 70 ? 3 : masteryScore >= 40 ? 2 : 1;
  return res.json({ techniqueId: req.params.techniqueId, difficulty: getAdaptiveDifficulty({ currentDifficulty, recentAttempts, masteryScore }) });
};

module.exports = { learnerProfile, learningPath, adaptiveDifficulty };
