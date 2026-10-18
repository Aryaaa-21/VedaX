const assert = require("node:assert/strict");
const test = require("node:test");
const {
  TECHNIQUES,
  generateVerifiedQuestion,
  verifyAnswer,
  explainQuestion,
  createQuestionSet,
  MathEngineError
} = require("../services/math");

test("catalog preserves all existing stable technique IDs", () => {
  assert.equal(TECHNIQUES.length, 16);
  assert.equal(new Set(TECHNIQUES.map((technique) => technique.id)).size, 16);
  assert.equal(TECHNIQUES[0].id, "ekadhikena-purvena");
  assert.equal(TECHNIQUES.at(-1).id, "gunakasamuccayah");
});

test("every technique generates cross-validated questions at every difficulty", () => {
  for (const technique of TECHNIQUES) {
    for (const difficulty of [1, 2, 3]) {
      const question = generateVerifiedQuestion({ techniqueId: technique.id, seed: `regression-${difficulty}`, difficulty });
      assert.equal(question.techniqueId, technique.id);
      assert.equal(question.expectedAnswer, question.solution.finalAnswer);
      assert.ok(question.id);
      assert.ok(question.solution.steps.length > 0);
      assert.equal(verifyAnswer(question, String(question.expectedAnswer)).correct, true);
    }
  }
});

test("randomized regression keeps generator, solver, explanation, and verifier aligned", () => {
  for (const technique of TECHNIQUES) {
    for (const difficulty of [1, 2, 3]) {
      for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
        const question = generateVerifiedQuestion({ techniqueId: technique.id, seed: `property-${technique.id}-${difficulty}-${seedIndex}`, difficulty });
        assert.equal(question.expectedAnswer, question.solution.finalAnswer);
        assert.equal(verifyAnswer(question, question.expectedAnswer).correct, true);
        assert.equal(verifyAnswer(question, "not-a-number").correct, false);
      }
    }
  }
});

test("question generation is deterministic for a fixed seed", () => {
  const first = createQuestionSet({ techniqueIds: ["nikhilam-subtraction"], count: 10, seed: "stable-seed", difficulty: 2 });
  const second = createQuestionSet({ techniqueIds: ["nikhilam-subtraction"], count: 10, seed: "stable-seed", difficulty: 2 });
  assert.deepEqual(first, second);
});

test("answer normalization accepts equivalent numeric formatting but rejects wrong answers", () => {
  const question = generateVerifiedQuestion({ techniqueId: "ekadhikena-purvena", seed: "answer-test", difficulty: 1 });
  assert.equal(verifyAnswer(question, ` ${question.expectedAnswer.toLocaleString("en-US")} `).correct, true);
  assert.equal(verifyAnswer(question, String(question.expectedAnswer + 1)).correct, false);
  assert.equal(verifyAnswer(question, "1+1").correct, false);
});

test("invalid technique and question counts fail safely", () => {
  assert.throws(() => generateVerifiedQuestion({ techniqueId: "not-a-technique", seed: "x" }), MathEngineError);
  assert.throws(() => createQuestionSet({ count: 0 }), MathEngineError);
  assert.throws(() => createQuestionSet({ count: 51 }), MathEngineError);
});

test("solution explanations are structured and do not execute expressions", () => {
  const question = generateVerifiedQuestion({ techniqueId: "chalana-kalanabhyam", seed: "explain", difficulty: 2 });
  const explanation = explainQuestion(question, question.expectedAnswer);
  assert.equal(explanation.techniqueId, "chalana-kalanabhyam");
  assert.ok(explanation.steps.every((step) => step.description && step.expression));
  assert.equal(explanation.finalAnswer, question.expectedAnswer);
});
