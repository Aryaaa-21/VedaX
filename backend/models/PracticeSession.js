const mongoose = require("mongoose");

const SessionQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sequence: { type: Number, required: true, min: 0 },
  techniqueId: { type: String, required: true, maxlength: 80 },
  operation: { type: String, required: true, maxlength: 100 },
  difficulty: { type: Number, required: true, min: 1, max: 3 },
  prompt: { type: String, required: true, maxlength: 500 },
  expectedAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  solutionData: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const PracticeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  mode: { type: String, enum: ["practice", "sutra", "challenge", "daily-challenge"], required: true },
  techniqueIds: { type: [String], default: [] },
  questions: { type: [SessionQuestionSchema], required: true, validate: [(value) => value.length > 0 && value.length <= 50, "Session must contain 1-50 questions"] },
  questionCount: { type: Number, required: true, min: 1, max: 50 },
  status: { type: String, enum: ["active", "completed", "expired", "abandoned"], default: "active", index: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: true },
  lastAttemptAt: { type: Date, default: null },
  answeredCount: { type: Number, default: 0, min: 0 },
  correctCount: { type: Number, default: 0, min: 0 },
  incorrectCount: { type: Number, default: 0, min: 0 },
  score: { type: Number, default: 0, min: 0 },
  xpAwarded: { type: Number, default: 0, min: 0 },
  completionIdempotencyKey: { type: String, default: null, maxlength: 120 }
}, { timestamps: true });

PracticeSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });
PracticeSessionSchema.index({ userId: 1, mode: 1, status: 1 });

module.exports = mongoose.model("PracticeSession", PracticeSessionSchema);
