const mongoose = require("mongoose");

const DailyChallengeSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, maxlength: 10 },
  timezone: { type: String, required: true, default: "UTC", maxlength: 64 },
  version: { type: Number, required: true, min: 1 },
  questionIds: { type: [String], required: true },
  techniqueIds: { type: [String], required: true },
  questionCount: { type: Number, required: true, min: 1, max: 50 },
  activeFrom: { type: Date, required: true },
  activeUntil: { type: Date, required: true }
}, { timestamps: true });

DailyChallengeSchema.index({ dateKey: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("DailyChallenge", DailyChallengeSchema);
