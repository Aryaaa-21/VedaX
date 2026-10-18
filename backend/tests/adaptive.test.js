const assert = require("node:assert/strict");
const test = require("node:test");
const { STATES, getMasteryState, getAdaptiveDifficulty } = require("../services/adaptiveLearningService");

test("mastery states are deterministic and explainable", () => {
  assert.equal(getMasteryState({ attempts: 0 }), STATES.NOT_STARTED);
  assert.equal(getMasteryState({ attempts: 3, masteryScore: 20, recentAccuracy: 20 }), STATES.LEARNING);
  assert.equal(getMasteryState({ attempts: 5, masteryScore: 55, recentAccuracy: 60 }), STATES.DEVELOPING);
  assert.equal(getMasteryState({ attempts: 10, masteryScore: 80, recentAccuracy: 80 }), STATES.PROFICIENT);
  assert.equal(getMasteryState({ attempts: 10, masteryScore: 95, recentAccuracy: 90 }), STATES.MASTERED);
  assert.equal(getMasteryState({ attempts: 10, masteryScore: 80, recentAccuracy: 40, consecutiveIncorrect: 2 }), STATES.NEEDS_REVIEW);
});

test("adaptive difficulty increases gradually, decreases after repeated failure, and holds mixed performance", () => {
  const strong = Array.from({ length: 5 }, () => ({ correct: true, responseTimeMs: 2000 }));
  const weak = Array.from({ length: 5 }, () => ({ correct: false, responseTimeMs: 5000 }));
  const mixed = [{ correct: true, responseTimeMs: 2000 }, { correct: false, responseTimeMs: 3000 }];
  assert.equal(getAdaptiveDifficulty({ currentDifficulty: 1, recentAttempts: strong, masteryScore: 60 }), 2);
  assert.equal(getAdaptiveDifficulty({ currentDifficulty: 3, recentAttempts: strong, masteryScore: 60 }), 3);
  assert.equal(getAdaptiveDifficulty({ currentDifficulty: 2, recentAttempts: weak, masteryScore: 50 }), 1);
  assert.equal(getAdaptiveDifficulty({ currentDifficulty: 2, recentAttempts: mixed, masteryScore: 50 }), 2);
});
