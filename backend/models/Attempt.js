const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeSession", required: true },
  questionId: { type: String, required: true },
  techniqueId: { type: String, required: true, maxlength: 80 },
  sequence: { type: Number, required: true, min: 0 },
  submittedAnswer: { type: String, required: true, maxlength: 200 },
  normalizedAnswer: { type: String, required: true, maxlength: 200 },
  correct: { type: Boolean, required: true },
  responseTimeMs: { type: Number, required: true, min: 0, max: 300000 },
  hintUsed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  scoreAwarded: { type: Number, default: 0, min: 0 },
  xpAwarded: { type: Number, default: 0, min: 0 },
  idempotencyKey: { type: String, required: true, maxlength: 120 },
  source: { type: String, enum: ["practice", "challenge", "daily-challenge", "sutra"], required: true }
}, { timestamps: true });

AttemptSchema.index({ sessionId: 1, sequence: 1, userId: 1 }, { unique: true });
AttemptSchema.index({ userId: 1, techniqueId: 1, submittedAt: -1 });
AttemptSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

module.exports = mongoose.model("Attempt", AttemptSchema);
