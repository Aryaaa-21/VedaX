const mongoose = require("mongoose");
const User = require("../models/User");
const XPTransaction = require("../models/XPTransaction");
const { calculateLevelFromXp, getProgressForXp } = require("../utils/leveling");

const awardXp = async ({ userId, amount, sourceType, sourceId, reason, idempotencyKey }) => {
  const safeAmount = Math.max(0, Math.min(500, Math.floor(Number(amount) || 0)));
  if (!safeAmount) return { amount: 0, transaction: null, progress: null, leveledUp: false };

  let transaction;
  let session;
  try {
    session = await mongoose.startSession();
    let before;
    let updated;
    await session.withTransaction(async () => {
      const created = await XPTransaction.create([{ userId, amount: safeAmount, sourceType, sourceId: String(sourceId), reason, idempotencyKey }], { session });
      transaction = created[0];
      before = await User.findById(userId).session(session).lean();
      updated = await User.findByIdAndUpdate(userId, { $inc: { xp: safeAmount } }, { new: true, runValidators: true, session }).lean();
      if (!updated) throw new Error("User disappeared while awarding XP");
    });
    const beforeLevel = before ? calculateLevelFromXp(before.xp) : 1;
    const progress = getProgressForXp(updated.xp);
    await session.endSession();
    return { amount: safeAmount, transaction, progress, leveledUp: progress.level > beforeLevel, duplicate: false };
  } catch (error) {
    if (session) await session.endSession().catch(() => {});
    if (error.code !== 11000) throw error;
    transaction = await XPTransaction.findOne({ userId, idempotencyKey });
    const user = await User.findById(userId).lean();
    return { amount: transaction?.amount || 0, transaction, progress: user ? getProgressForXp(user.xp) : null, leveledUp: false, duplicate: true };
  }
};

module.exports = { awardXp };
