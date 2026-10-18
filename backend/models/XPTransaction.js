const mongoose = require("mongoose");

const XPTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sourceType: { type: String, enum: ["practice-session", "challenge", "daily-challenge", "achievement", "admin-adjustment"], required: true },
  sourceId: { type: String, required: true, maxlength: 120 },
  amount: { type: Number, required: true, min: 0, max: 100000 },
  reason: { type: String, required: true, maxlength: 240 },
  idempotencyKey: { type: String, required: true, maxlength: 160 }
}, { timestamps: true });

XPTransactionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
XPTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("XPTransaction", XPTransactionSchema);
