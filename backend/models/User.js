const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 100 },
  type: { type: String, enum: ["practice", "challenge", "daily-challenge", "achievement"], required: true },
  title: { type: String, required: true, maxlength: 160 },
  desc: { type: String, required: true, maxlength: 500 },
  date: { type: String, required: true, maxlength: 80 },
  xpAwarded: { type: Number, default: 0, min: 0, max: 100000 }
}, { _id: false });

const BadgeSchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 100 },
  unlocked: { type: Boolean, default: false },
  // The existing frontend uses values such as "Today"; keep this field textual.
  unlockedAt: { type: String, default: null, maxlength: 80 }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  tokenVersion: { type: Number, default: 0, min: 0 },
  joinedDate: { type: Date, default: Date.now },
  level: { type: Number, default: 1, min: 1, max: 1000 },
  xp: { type: Number, default: 0, min: 0, max: 100000000 },
  streak: { type: Number, default: 0, min: 0, max: 100000 },
  longestStreak: { type: Number, default: 0, min: 0, max: 100000 },
  lastActivityDate: { type: String, default: null, maxlength: 10 },
  lastQualifiedActivityDate: { type: String, default: null, maxlength: 10 },
  accuracy: { type: Number, default: 0, min: 0, max: 100 },
  badges: { type: [BadgeSchema], default: [], validate: [(value) => value.length <= 100, "Too many badges"] },
  completedTechniques: { type: [mongoose.Schema.Types.Mixed], default: [], validate: [(value) => value.length <= 1000, "Too many techniques"] },
  challengeHistory: { type: [mongoose.Schema.Types.Mixed], default: [], validate: [(value) => value.length <= 1000, "Challenge history is too large"] },
  profileImage: { type: String, default: "", maxlength: 2048 },
  avatar: { type: String, default: "https://lh3.googleusercontent.com/a/default-user", maxlength: 2048 },
  avgSpeed: { type: Number, default: 0, min: 0, max: 100000 },
  completedLessons: { type: Number, default: 0, min: 0, max: 100000 },
  challengeHighScore: { type: Number, default: 0, min: 0, max: 100000000 },
  recentActivities: { type: [ActivitySchema], default: [], validate: [(value) => value.length <= 100, "Too many recent activities"] }
}, {
  timestamps: true
});

UserSchema.index({ xp: -1, level: -1, accuracy: -1, challengeHighScore: -1, _id: 1 });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
