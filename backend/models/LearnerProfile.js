const mongoose = require("mongoose");

const LearnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  overallMastery: { type: Number, default: 0, min: 0, max: 100 },
  recommendedDifficulty: { type: Number, default: 1, min: 1, max: 3 },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  recentPerformance: { type: mongoose.Schema.Types.Mixed, default: {} },
  learningConsistency: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("LearnerProfile", LearnerProfileSchema);
