const mongoose = require("mongoose");
const PracticeSession = require("../models/PracticeSession");
const Attempt = require("../models/Attempt");
const { createQuestionSet, verifyAnswer, explainQuestion, getTechnique } = require("./math");
const { calculateAttemptScore, calculateSessionXp } = require("../utils/scoring");
const { awardXp } = require("./rewardService");
const { updateMasteryFromAttempt } = require("./masteryService");
const { qualifyActivity } = require("./streakService");
const { AppError } = require("../utils/errors");

const cleanSession = (session) => ({
  id: String(session._id),
  mode: session.mode,
  techniqueIds: session.techniqueIds,
  questionCount: session.questionCount,
  status: session.status,
  startedAt: session.startedAt,
  completedAt: session.completedAt,
  expiresAt: session.expiresAt,
  answeredCount: session.answeredCount,
  correctCount: session.correctCount,
  incorrectCount: session.incorrectCount,
  score: session.score,
  xpAwarded: session.xpAwarded
});

const publicQuestion = (question) => ({
  id: question.id,
  sequence: question.sequence,
  techniqueId: question.techniqueId,
  operation: question.operation,
  difficulty: question.difficulty,
  text: question.prompt,
  question: question.prompt
});

const startSession = async ({ userId, mode = "practice", techniqueIds, questionCount = 5, difficulty = 1, seed = new mongoose.Types.ObjectId().toString() }) => {
  const ids = techniqueIds?.length ? techniqueIds : undefined;
  if (ids) ids.forEach((id) => { if (!getTechnique(id)) throw new AppError(`Unknown technique: ${id}`, 422, "VALIDATION_ERROR", { techniqueId: "Unknown technique" }); });
  const existing = await PracticeSession.findOne({ userId, mode, status: "active" });
  if (existing && existing.expiresAt > new Date()) throw new AppError("An active session already exists", 409, "ACTIVE_SESSION_EXISTS");

  const questions = createQuestionSet({ techniqueIds: ids, count: questionCount, seed, difficulty });
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (mode === "challenge" || mode === "daily-challenge" ? 2 : 15) * 60 * 1000);
  const session = await PracticeSession.create({
    userId,
    mode,
    techniqueIds: [...new Set(questions.map((question) => question.techniqueId))],
    questions: questions.map((question, index) => ({ ...question, sequence: index })),
    questionCount: questions.length,
    startedAt: now,
    expiresAt
  });
  return { session: cleanSession(session), questions: session.questions.map(publicQuestion) };
};

const findOwnedSession = async (userId, sessionId) => {
  if (!mongoose.isValidObjectId(sessionId)) throw new AppError("Invalid sessionId", 400, "INVALID_IDENTIFIER");
  const session = await PracticeSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError("Practice session not found", 404, "SESSION_NOT_FOUND");
  return session;
};

const submitAttempt = async ({ userId, sessionId, sequence, answer, responseTimeMs = 0, hintUsed = false, idempotencyKey }) => {
  const session = await findOwnedSession(userId, sessionId);
  if (session.status !== "active") throw new AppError("Session is not active", 409, "SESSION_NOT_ACTIVE");
  if (session.expiresAt <= new Date()) throw new AppError("Session has expired", 409, "SESSION_EXPIRED");
  if (!Number.isInteger(sequence) || sequence < 0 || sequence >= session.questions.length) throw new AppError("Invalid question sequence", 422, "VALIDATION_ERROR", { sequence: "Invalid question sequence" });
  if (!idempotencyKey) throw new AppError("idempotencyKey is required", 422, "VALIDATION_ERROR", { idempotencyKey: "Required" });

  const prior = await Attempt.findOne({ userId, sessionId, sequence });
  if (prior) return { attempt: prior, session: cleanSession(session), duplicate: true };
  const answeredCount = await Attempt.countDocuments({ userId, sessionId });
  if (sequence !== answeredCount) throw new AppError("Questions must be answered in sequence", 409, "INVALID_ATTEMPT_ORDER");
  const question = session.questions[sequence];
  const previousAttempt = await Attempt.findOne({ userId, sessionId }).sort({ submittedAt: -1 }).lean();
  const serverReference = previousAttempt?.submittedAt || session.startedAt;
  const serverElapsed = Math.max(0, Date.now() - new Date(serverReference).getTime());
  const safeResponseTime = Math.max(serverElapsed, Math.min(300000, Number(responseTimeMs) || 0));
  const result = verifyAnswer(question, answer);
  let attempt;
  try {
    attempt = await Attempt.create({
    userId,
    sessionId,
    questionId: question.id,
    techniqueId: question.techniqueId,
    operation: question.operation,
    difficulty: question.difficulty,
    sequence,
    submittedAnswer: String(answer ?? "").slice(0, 200),
    normalizedAnswer: result.normalizedAnswer,
    correct: result.correct,
    responseTimeMs: safeResponseTime,
    hintUsed: Boolean(hintUsed),
    scoreAwarded: calculateAttemptScore({ correct: result.correct, difficulty: question.difficulty, hintUsed }),
    idempotencyKey,
    source: session.mode === "sutra" ? "sutra" : session.mode
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await Attempt.findOne({ userId, idempotencyKey });
      if (duplicate) return { attempt: duplicate, session: cleanSession(session), duplicate: true };
    }
    throw error;
  }
  await PracticeSession.findByIdAndUpdate(sessionId, {
    $inc: { answeredCount: 1, correctCount: result.correct ? 1 : 0, incorrectCount: result.correct ? 0 : 1, score: attempt.scoreAwarded },
    $set: { lastAttemptAt: new Date() }
  });
  await updateMasteryFromAttempt({ userId, techniqueId: question.techniqueId, correct: result.correct, responseTimeMs: safeResponseTime });
  const updated = await PracticeSession.findById(sessionId);
  return {
    attempt: { id: String(attempt._id), sequence, correct: result.correct, expectedAnswer: result.expectedAnswer, scoreAwarded: attempt.scoreAwarded, solution: result.correct ? undefined : explainQuestion(question, result.expectedAnswer) },
    session: cleanSession(updated),
    duplicate: false
  };
};

const completeSession = async ({ userId, sessionId, idempotencyKey }) => {
  const session = await findOwnedSession(userId, sessionId);
  if (session.status === "completed") return { session: cleanSession(session), rewards: { xpAwarded: session.xpAwarded, duplicate: true } };
  if (!idempotencyKey) throw new AppError("idempotencyKey is required", 422, "VALIDATION_ERROR", { idempotencyKey: "Required" });
  const attempts = await Attempt.find({ userId, sessionId }).sort({ sequence: 1 }).lean();
  if (attempts.length === 0) throw new AppError("At least one valid attempt is required", 422, "SESSION_NOT_COMPLETABLE");
  const averageResponseTimeMs = attempts.length ? attempts.reduce((total, attempt) => total + attempt.responseTimeMs, 0) / attempts.length : 0;
  const difficulty = session.questions.reduce((max, question) => Math.max(max, question.difficulty), 1);
  const xp = calculateSessionXp({ correctCount: attempts.filter((attempt) => attempt.correct).length, answeredCount: attempts.length, difficulty, averageResponseTimeMs });
  session.status = "completed";
  session.completedAt = new Date();
  session.xpAwarded = xp;
  session.completionIdempotencyKey = idempotencyKey;
  await session.save();
  const reward = await awardXp({ userId, amount: xp, sourceType: session.mode === "daily-challenge" ? "daily-challenge" : session.mode === "challenge" ? "challenge" : "practice-session", sourceId: session._id, reason: `${session.mode} session completion`, idempotencyKey: `session:${session._id}` });
  const streak = attempts.length ? await qualifyActivity(userId) : null;
  return { session: cleanSession(session), rewards: { xpAwarded: reward.amount, level: reward.progress?.level, leveledUp: reward.leveledUp, streak: streak?.streak || 0, streakIncreased: Boolean(streak?.increased), duplicate: reward.duplicate } };
};

const getSession = async ({ userId, sessionId }) => {
  const session = await findOwnedSession(userId, sessionId);
  const attempts = await Attempt.find({ userId, sessionId }).sort({ sequence: 1 }).lean();
  return { session: cleanSession(session), questions: session.questions.map(publicQuestion), attempts };
};

const getHistory = async ({ userId, limit = 20 }) => {
  const sessions = await PracticeSession.find({ userId, status: "completed" }).sort({ completedAt: -1 }).limit(Math.min(50, Math.max(1, Number(limit) || 20))).lean();
  return sessions.map(cleanSession);
};

module.exports = { startSession, submitAttempt, completeSession, getSession, getHistory, cleanSession, publicQuestion };
