const assert = require("node:assert/strict");
const test = require("node:test");
const { calculateLevelFromXp, getProgressForXp, xpRequiredForLevel } = require("../utils/leveling");
const { calculateAttemptScore, calculateSessionXp } = require("../utils/scoring");
const { dateKeyFromDate, dayDifference } = require("../utils/dateKey");

test("leveling is deterministic and monotonic", () => {
  assert.equal(calculateLevelFromXp(0), 1);
  assert.equal(calculateLevelFromXp(xpRequiredForLevel(1)), 2);
  assert.ok(calculateLevelFromXp(10000) >= calculateLevelFromXp(1000));
  const progress = getProgressForXp(150);
  assert.equal(progress.level, 2);
  assert.equal(progress.xpIntoLevel, 50);
  assert.ok(progress.xpToNextLevel > 0);
});

test("scoring never awards XP for incorrect answers and caps session rewards", () => {
  assert.equal(calculateAttemptScore({ correct: false, difficulty: 3 }), 0);
  assert.ok(calculateAttemptScore({ correct: true, difficulty: 3 }) > calculateAttemptScore({ correct: true, difficulty: 1 }));
  assert.equal(calculateSessionXp({ correctCount: 0, answeredCount: 10 }), 0);
  assert.ok(calculateSessionXp({ correctCount: 10, answeredCount: 10, difficulty: 3, averageResponseTimeMs: 1000 }) <= 500);
});

test("streak date keys are server-derived and consecutive days are exact", () => {
  assert.equal(dateKeyFromDate(new Date("2026-10-18T23:59:59.000Z")), "2026-10-18");
  assert.equal(dayDifference("2026-10-17", "2026-10-18"), 1);
  assert.equal(dayDifference("2026-10-17", "2026-10-20"), 3);
  assert.equal(dayDifference("bad", "2026-10-20"), null);
});
