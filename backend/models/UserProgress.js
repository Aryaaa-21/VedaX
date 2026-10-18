const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  techniqueId: { type: String, required: true, maxlength: 80 },
  attempts: { type: Number, default: 0, min: 0 },
  correctAttempts: { type: Number, default: 0, min: 0 },
  incorrectAttempts: { type: Number, default: 0, min: 0 },
  accuracy: { type: Number, default: 0, min: 0, max: 100 },
  averageResponseTimeMs: { type: Number, default: 0, min: 0, max: 300000 },
  recentAccuracy: { type: Number, default: 0, min: 0, max: 100 },
  masteryScore: { type: Number, default: 0, min: 0, max: 100 },
  masteryLevel: { type: String, enum: ["novice", "developing", "proficient", "mastered"], default: "novice" },
  lastAttemptAt: { type: Date, default: null },
  lastCorrectAt: { type: Date, default: null },
  nextReviewAt: { type: Date, default: null },
  consecutiveCorrect: { type: Number, default: 0, min: 0 },
  consecutiveIncorrect: { type: Number, default: 0, min: 0 },
  version: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, techniqueId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, masteryScore: 1 });

module.exports = mongoose.model("UserProgress", UserProgressSchema);
