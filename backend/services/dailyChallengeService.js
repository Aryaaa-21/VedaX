const DailyChallenge = require("../models/DailyChallenge");
const PracticeSession = require("../models/PracticeSession");
const { createQuestionSet } = require("./math");
const { dateKeyFromDate } = require("../utils/dateKey");
const { TECHNIQUES } = require("./math");
const { startSession, completeSession } = require("./practiceService");

const getOrCreateDailyChallenge = async (date = new Date()) => {
  const dateKey = dateKeyFromDate(date);
  const existing = await DailyChallenge.findOne({ dateKey, version: 1 });
  if (existing) return existing;
  const techniqueIds = TECHNIQUES.filter((_, index) => index % 3 === new Date(date).getUTCDate() % 3).slice(0, 5).map((technique) => technique.id);
  const questions = createQuestionSet({ techniqueIds, count: 10, seed: `daily:${dateKey}:1`, difficulty: 2 });
  return DailyChallenge.create({ dateKey, timezone: "UTC", version: 1, questionIds: questions.map((question) => question.id), techniqueIds, questionCount: questions.length, activeFrom: new Date(`${dateKey}T00:00:00.000Z`), activeUntil: new Date(`${dateKey}T23:59:59.999Z`) });
};

const publicChallenge = (challenge, completion = null) => ({
  challenge: { dateKey: challenge.dateKey, version: challenge.version, questionCount: challenge.questionCount, techniqueIds: challenge.techniqueIds, expiresAt: challenge.activeUntil },
  completion: completion ? { completed: completion.status === "completed", score: completion.score || 0, xpAwarded: completion.xpAwarded || 0 } : null
});

const getDaily = async (userId) => {
  const challenge = await getOrCreateDailyChallenge();
  const completion = userId ? await PracticeSession.findOne({ userId, mode: "daily-challenge", status: "completed", createdAt: { $gte: challenge.activeFrom, $lte: challenge.activeUntil } }) : null;
  return publicChallenge(challenge, completion);
};

const startDaily = async (userId) => {
  const challenge = await getOrCreateDailyChallenge();
  return startSession({ userId, mode: "daily-challenge", techniqueIds: challenge.techniqueIds, questionCount: challenge.questionCount, difficulty: 2, seed: `daily:${challenge.dateKey}:${challenge.version}` });
};

const completeDaily = async ({ userId, sessionId, idempotencyKey }) => completeSession({ userId, sessionId, idempotencyKey });

const history = async (userId, limit = 20) => PracticeSession.find({ userId, mode: "daily-challenge", status: "completed" }).sort({ completedAt: -1 }).limit(Math.min(100, Number(limit) || 20)).lean();

module.exports = { getOrCreateDailyChallenge, publicChallenge, getDaily, startDaily, completeDaily, history };
